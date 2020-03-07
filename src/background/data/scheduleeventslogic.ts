import * as base from 'garoon-soap/dist/type/base';
import { DateRange } from '../../types/date';
import { Event, MyGroupEvent, Participant } from '../../types/event';
import { EventConverter } from './eventconverter';
import { GaroonDataSource } from './garoondatasource';

export interface ScheduleEventsLogic {
    getMyEvents(dateRange: DateRange, targetType: string, target: string): Promise<Event[]>;
    getSortedMyEvents(dateRange: DateRange, targetType?: string, target?: string): Promise<Event[]>;
    getMyGroups(): Promise<base.MyGroupType[]>;
    getMyGroupEvents(dateRange: DateRange, groupId: string): Promise<MyGroupEvent[]>;
    getNarrowedDownPublicHolidays(specificDate: Date): Promise<string[]>;
}

export class ScheduleEventsLogicImpl implements ScheduleEventsLogic {
    private garoonDataSource: GaroonDataSource;

    constructor(garoonDataSource: GaroonDataSource) {
        this.garoonDataSource = garoonDataSource;
    }

    private sortByTimeAndAllDayEventToTailEndFunc(event: Event, nextEvent: Event): number {
        if (event.isAllDay) {
            return 1;
        } else if (nextEvent.isAllDay) {
            return -1;
        } else {
            return event.startTime.getHours() > nextEvent.startTime.getHours() ? 1 : -1;
        }
    }

    public async getMyEvents(dateRange: DateRange, targetType = '', target = ''): Promise<Event[]> {
        return await this.garoonDataSource.getScheduleEvents(
            dateRange.startDate.toISOString(),
            dateRange.endDate.toISOString(),
            targetType,
            target
        );
    }

    public async getSortedMyEvents(dateRange: DateRange, targetType = '', target = ''): Promise<Event[]> {
        const events = await this.getMyEvents(dateRange, targetType, target);
        return events.sort(this.sortByTimeAndAllDayEventToTailEndFunc);
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
            throw new Error('ScheduleEventLogic: 選択したMyグループが存在しません');
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
        const eventPerUserList = await Promise.all(
            groupMemberList.map(async userId => await this.getMyEvents(dateRange, 'user', userId))
        );

        /*
            @return [{}, {}, {},........]
        */
        let mergeEvents: Event[] = [];
        eventPerUserList.forEach(events => {
            mergeEvents = mergeEvents.concat(events);
        });

        const myGroupEvents = mergeEvents
            .reduce((uniqueEvents: Event[], currentEvent: Event) => {
                if (!uniqueEvents.some(event => event.id === currentEvent.id)) {
                    uniqueEvents.push(currentEvent);
                }
                return uniqueEvents;
            }, [])
            .sort(this.sortByTimeAndAllDayEventToTailEndFunc)
            .map(event => {
                const participantList: Participant[] = [];
                event.attendees.forEach((participant: Participant) => {
                    groupMemberList.forEach(userId => {
                        if (participant.id === userId) {
                            participantList.push(participant);
                        }
                    });
                });
                return EventConverter.convertToMyGroupEvent(event, participantList);
            });
        return myGroupEvents;
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
}
