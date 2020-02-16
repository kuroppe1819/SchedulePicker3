import * as base from 'garoon-soap/dist/type/base';
import { EventInfo, Participant, MyGroupEvent, SpecialTemplateCharactorIndexs, TemplateEvent } from '../types/event';
import { DateRange } from '../types/date';
import { SpecialTemplateCharactor } from './eventtype';
import { GaroonDataSource } from './data/garoondatasource';
import { EventConverter } from './data/eventconverter';

interface ScheduleEventsLogic {
    getMyEvents(dateRange: DateRange, targetType: string, target: string): Promise<EventInfo[]>;
    getSortedMyEvents(dateRange: DateRange, targetType: string, target: string): Promise<EventInfo[]>;
    getMyGroups(): Promise<base.MyGroupType[]>;
    getMyGroupEvents(dateRange: DateRange, groupId: string): Promise<MyGroupEvent[]>;
    getNarrowedDownPublicHolidays(specificDate: Date): Promise<string[]>;
    getIndexesSpecialTemplateCharactor(targetText: string): SpecialTemplateCharactorIndexs;
}

export default class ScheduleEventsLogicImpl implements ScheduleEventsLogic {
    private garoonDataSource: GaroonDataSource;

    constructor(garoonDataSource: GaroonDataSource) {
        this.garoonDataSource = garoonDataSource;
    }

    private sortByTimeAndAllDayEventToTailEndFunc(eventInfo: EventInfo, nextEventInfo: EventInfo): number {
        if (eventInfo.isAllDay) {
            return 1;
        } else if (nextEventInfo.isAllDay) {
            return -1;
        } else {
            return eventInfo.startTime.getTime() > nextEventInfo.startTime.getTime() ? 1 : -1;
        }
    }

    public async getMyEvents(dateRange: DateRange, targetType = '', target = ''): Promise<EventInfo[]> {
        return await this.garoonDataSource.getScheduleEvents(
            dateRange.startDate.toISOString(),
            dateRange.endDate.toISOString(),
            targetType,
            target
        );
    }

    public async getSortedMyEvents(dateRange: DateRange, targetType = '', target = ''): Promise<EventInfo[]> {
        const eventInfoList = await this.getMyEvents(dateRange, targetType, target);
        return eventInfoList.sort(this.sortByTimeAndAllDayEventToTailEndFunc);
    }

    public async getMyGroups(): Promise<base.MyGroupType[]> {
        const myGroupVersions = await this.garoonDataSource.getMyGroupVersions([]);
        const myGroupIds = myGroupVersions.map(group => group.id);
        return this.garoonDataSource.getMyGroupsById(myGroupIds);
    }

    public async getMyGroupEvents(dateRange: DateRange, groupId: string): Promise<MyGroupEvent[]> {
        const myGroups = await this.getMyGroups();
        const targetMyGroups = myGroups.filter(g => g.key === groupId);

        if (targetMyGroups.length === 0) {
            throw new Error('RuntimeErrorException: 選択したMyグループが存在しません');
        }
        const groupMemberList = targetMyGroups[0].belong_member;

        /*
            @return [
                [{}, {}, {}],
                [{}, {}, {}],
                [{}, {}, {}]
                ....
            ]
        */
        const eventInfoPerUserList = await Promise.all(
            groupMemberList.map(async userId => await this.getMyEvents(dateRange, 'user', userId))
        );

        /*
            @return [{}, {}, {},........]
        */
        let mergeEventInfoList: EventInfo[] = [];
        eventInfoPerUserList.forEach(events => {
            mergeEventInfoList = mergeEventInfoList.concat(events);
        });

        const myGroupEventList = mergeEventInfoList
            .reduce((uniqueEvents: EventInfo[], currentEvent: EventInfo) => {
                if (!uniqueEvents.some(event => event.id === currentEvent.id)) {
                    uniqueEvents.push(currentEvent);
                }
                return uniqueEvents;
            }, [])
            .sort(this.sortByTimeAndAllDayEventToTailEndFunc)
            .map(eventInfo => {
                const participantList: Participant[] = [];
                eventInfo.attendees.forEach((participant: Participant) => {
                    groupMemberList.forEach(userId => {
                        if (participant.id === userId) {
                            participantList.push(participant);
                        }
                    });
                });
                return EventConverter.convertToMyGroupEvent(eventInfo, participantList);
            });
        return myGroupEventList;
    }

    public async getNarrowedDownPublicHolidays(specificDate: Date): Promise<string[]> {
        const calendarEvents = await this.garoonDataSource.getCalendarEvents();
        return calendarEvents
            .filter(event => {
                const holiday = new Date(event.date);

                const oneMonthBefore = new Date(
                    specificDate.getFullYear(),
                    specificDate.getMonth() - 1,
                    specificDate.getDate()
                );
                const oneMonthLater = new Date(
                    specificDate.getFullYear(),
                    specificDate.getMonth() + 1,
                    specificDate.getDate()
                );
                // リストのサイズが大きすぎるので、指定した日からの1ヶ月前後の祝日のリストに絞り込む
                return (
                    event.type === 'public_holiday' &&
                    oneMonthLater.getTime() > holiday.getTime() &&
                    holiday.getTime() > oneMonthBefore.getTime()
                );
            })
            .map(event => new Date(event.date).toLocaleDateString());
    }

    getIndexesSpecialTemplateCharactor(targetText: string): SpecialTemplateCharactorIndexs {
        const todayIndexes: number[] = this.getIndexesCharactor(targetText, SpecialTemplateCharactor.TODAY);
        const nextDayIndexes: number[] = this.getIndexesCharactor(
            targetText,
            SpecialTemplateCharactor.NEXT_BUSINESS_DAY
        );
        const previousDayIndexes: number[] = this.getIndexesCharactor(
            targetText,
            SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY
        );

        return {
            todayIndexes: todayIndexes,
            nextDayIndexes: nextDayIndexes,
            previousDayIndexes: previousDayIndexes,
        };
    }

    private escapeRegExp(text): string {
        // eslint-disable-next-line no-useless-escape
        return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味する
    }

    private getIndexesCharactor(targetText: string, searchText: string): number[] {
        const regex = new RegExp(this.escapeRegExp(searchText), 'g');
        const indexes: number[] = [];

        let result;
        while ((result = regex.exec(targetText)) !== null) {
            indexes.push(result.index);
        }
        return indexes;
    }
}
