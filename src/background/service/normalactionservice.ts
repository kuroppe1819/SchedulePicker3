import moment from 'moment';
import { ContextMenu, ContextMenuDayId, ContextMenuParentId } from 'src/types/contextmenu';
import { DateRange } from 'src/types/date';
import {
    EventInfo,
    MyGroupEvent,
    SpecialTemplateCharactor,
    TemplateCharactorInText,
    TemplateEvent,
} from 'src/types/event';
import { UserSetting, FilterSetting } from 'src/types/storage';
import { ScheduleEventsLogic } from '../data/scheduleeventslogic';
import { ContextMenuHelper } from '../helper/contextmenuhelper';
import { DateHelper } from '../helper/datehelper';
import { defaultMenuItems } from '../helper/defaultcontextmenu';

export interface NormalActionService {
    findDateRangeByDateId(dayId: ContextMenuDayId, specifiedDate?: Date): Promise<DateRange>;
    updateContextMenus(): Promise<void>;
    getEventsByMySelf(setting: FilterSetting, dateRange: DateRange): Promise<EventInfo[]>;
    getEventsByMyGroup(groupId: string, setting: FilterSetting, dateRange: DateRange): Promise<MyGroupEvent[]>;
    getEventsByTemplate(setting: UserSetting): Promise<TemplateEvent>;
}

export class NormalActionServiceImpl implements NormalActionService {
    private logic: ScheduleEventsLogic;

    constructor(logic: ScheduleEventsLogic) {
        this.logic = logic;
    }

    public async findDateRangeByDateId(dayId: ContextMenuDayId, specifiedDate?: Date): Promise<DateRange> {
        const now = moment();
        switch (dayId) {
            case ContextMenuDayId.TODAY: {
                return DateHelper.makeDateRange(now.toDate());
            }
            case ContextMenuDayId.NEXT_BUSINESS_DAY: {
                const publicHolidays = await this.getPublicHolidays(now.toDate());
                return DateHelper.makeDateRange(DateHelper.assignBusinessDate(now, publicHolidays, 1));
            }
            case ContextMenuDayId.PREVIOUS_BUSINESS_DAY: {
                const publicHolidays = await this.getPublicHolidays(now.toDate());
                return DateHelper.makeDateRange(DateHelper.assignBusinessDate(now, publicHolidays, -1));
            }
            case ContextMenuDayId.SPECIFIED_DAY: {
                if (specifiedDate === undefined) {
                    throw new Error('RuntimeErrorException: 取得したい予定の日付を選択してください');
                }
                return DateHelper.makeDateRange(specifiedDate);
            }
            default: {
                throw new Error('RuntimeErrorException: コンテキストメニューに存在しない日付のIDが選択されています');
            }
        }
    }

    private async getMyGroupMenuItems(): Promise<ContextMenu[]> {
        const myGroups = await this.logic.getMyGroups();
        return myGroups.map(g => {
            return { id: g.key, title: g.name, parentId: ContextMenuParentId.MYGROUPS, type: 'normal' };
        });
    }

    public async updateContextMenus(): Promise<void> {
        await ContextMenuHelper.removeAll();
        const myGroupMenuItems = await this.getMyGroupMenuItems();
        const newContextMenuItems = defaultMenuItems.concat(myGroupMenuItems);
        ContextMenuHelper.addAll(newContextMenuItems);
    }

    public async getEventsByMySelf(setting: FilterSetting, dateRange: DateRange): Promise<EventInfo[]> {
        const events = await this.logic.getSortedMyEvents(dateRange);
        return events.filter(event => {
            let isIncludeEvent = true;

            if (!setting.isIncludePrivateEvent) {
                isIncludeEvent = event.visibilityType !== 'PRIVATE';
            }

            if (!setting.isIncludeAllDayEvent) {
                isIncludeEvent = !event.isAllDay;
            }

            return isIncludeEvent;
        });
    }

    public async getEventsByMyGroup(
        groupId: string,
        setting: FilterSetting,
        dateRange: DateRange
    ): Promise<MyGroupEvent[]> {
        const myGroupEvents = await this.logic.getMyGroupEvents(dateRange, groupId);
        return myGroupEvents.filter(myGroupevent => {
            let isIncludeEvent = true;

            if (!setting.isIncludePrivateEvent) {
                isIncludeEvent = myGroupevent.eventInfo.visibilityType !== 'PRIVATE';
            }

            if (!setting.isIncludeAllDayEvent) {
                isIncludeEvent = !myGroupevent.eventInfo.isAllDay;
            }

            return isIncludeEvent;
        });
    }

    public async getEventsByTemplate(setting: UserSetting): Promise<TemplateEvent> {
        const templateEvent: TemplateEvent = {
            specifiedDayEventInfoList: [],
            nextDayEventInfoList: [],
            previousDayEventInfoList: [],
        };

        if (!setting.templateText) {
            return templateEvent;
        }

        const templateCharactorInText = await this.findSpecialTemplateCharacter(setting.templateText);
        if (templateCharactorInText.isIncludeToday) {
            const dateRange = await this.findDateRangeByDateId(ContextMenuDayId.TODAY, setting.specifiedDate);
            templateEvent.specifiedDayEventInfoList = await this.getEventsByMySelf(setting.filterSetting, dateRange);
        }

        if (templateCharactorInText.isIncludeNextDay) {
            const dateRange = await this.findDateRangeByDateId(
                ContextMenuDayId.NEXT_BUSINESS_DAY,
                setting.specifiedDate
            );
            templateEvent.nextDayEventInfoList = await this.getEventsByMySelf(setting.filterSetting, dateRange);
        }

        if (templateCharactorInText.isIncludePreviousDay) {
            const dateRange = await this.findDateRangeByDateId(
                ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
                setting.specifiedDate
            );
            templateEvent.previousDayEventInfoList = await this.getEventsByMySelf(setting.filterSetting, dateRange);
        }

        return templateEvent;
    }

    private async getPublicHolidays(specificDate: Date): Promise<string[]> {
        return await this.logic.getNarrowedDownPublicHolidays(specificDate);
    }

    private findSpecialTemplateCharacter(targetText: string): TemplateCharactorInText {
        const isIncludeToday = targetText.indexOf(SpecialTemplateCharactor.SPECIFIED_DAY) !== -1;
        const isIncludeNextDay = targetText.indexOf(SpecialTemplateCharactor.NEXT_BUSINESS_DAY) !== -1;
        const isIncludePreviousDay = targetText.indexOf(SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY) !== -1;

        return {
            isIncludeToday: isIncludeToday,
            isIncludeNextDay: isIncludeNextDay,
            isIncludePreviousDay: isIncludePreviousDay,
        };
    }
}
