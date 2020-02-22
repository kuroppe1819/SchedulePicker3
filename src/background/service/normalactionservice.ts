import ScheduleEventsLogic from '../data/scheduleeventslogic';
import { ContextMenuHelper } from '../contextmenu/contextmenuhelper';
import { ContextMenu, ContextMenuParentId, ContextMenuDateId } from 'src/types/contextmenu';
import {
    EventInfo,
    SpecialTemplateCharactor,
    TemplateCharactorInText,
    TemplateEvent,
    MyGroupEvent,
} from 'src/types/event';
import { DateRange } from 'src/types/date';
import { defaultMenuItems } from '../contextmenu/defaultcontextmenu';
import { DateHelper } from './datehelper';
import { UserSetting } from 'src/types/storage';

export interface NormalActionService {
    updateContextMenus(): Promise<void>;
    getEventsByMySelf(setting: UserSetting): Promise<EventInfo[]>;
    getEventsByMyGroup(groupId: string, setting: UserSetting): Promise<MyGroupEvent[]>;
    getEventsByTemplate(setting: UserSetting): Promise<TemplateEvent>;
}

export class NormalActionServiceImpl implements NormalActionService {
    private logic: ScheduleEventsLogic;

    constructor(logic: ScheduleEventsLogic) {
        this.logic = logic;
    }

    private async findDateRangeFromDateId(dateId: ContextMenuDateId, selectedDate: Date): Promise<DateRange> {
        const now = new Date();
        const publicHolidays = await this.getPublicHolidays(now);
        switch (dateId) {
            case ContextMenuDateId.TODAY: {
                return DateHelper.makeDateRange(now);
            }
            case ContextMenuDateId.NEXT_BUSINESS_DAY: {
                if (publicHolidays === undefined) {
                    throw new Error('RuntimeErrorException: publicHolidays is undefined');
                }
                return DateHelper.makeDateRange(DateHelper.assignBusinessDate(now, publicHolidays, 1));
            }
            case ContextMenuDateId.PREVIOUS_BUSINESS_DAY: {
                if (publicHolidays === undefined) {
                    throw new Error('RuntimeErrorException: publicHolidays is undefined');
                }
                return DateHelper.makeDateRange(DateHelper.assignBusinessDate(now, publicHolidays, -1));
            }
            case ContextMenuDateId.SELECT_DAY: {
                if (selectedDate === undefined) {
                    throw new Error('RuntimeErrorException: selectedDate is undefined');
                }
                return DateHelper.makeDateRange(selectedDate);
            }
            default: {
                throw new Error('RuntimeErrorException: コンテキストメニューに存在しない日付のIDが選択されています');
            }
        }
    }

    private async getMyGroupMenuItems(): Promise<ContextMenu[]> {
        const myGroups = await this.logic.getMyGroups();
        return myGroups.map(g => {
            return { id: g.key, title: g.name, parentId: ContextMenuParentId.MYGROUP, type: 'normal' };
        });
    }

    public async updateContextMenus(): Promise<void> {
        await ContextMenuHelper.removeAll();
        const myGroupMenuItems = await this.getMyGroupMenuItems();
        const newContextMenuItems = defaultMenuItems.concat(myGroupMenuItems);
        ContextMenuHelper.addAll(newContextMenuItems);
    }

    private async getFilterdEventsByFilterSetting(dateRange: DateRange, setting: UserSetting): Promise<EventInfo[]> {
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

    public async getEventsByMySelf(setting: UserSetting): Promise<EventInfo[]> {
        const dateRange = await this.findDateRangeFromDateId(setting.dateId, new Date(setting.selectedDate));
        return this.getFilterdEventsByFilterSetting(dateRange, setting);
    }

    public async getEventsByMyGroup(groupId: string, setting: UserSetting): Promise<MyGroupEvent[]> {
        const dateRange = await this.findDateRangeFromDateId(setting.dateId, new Date(setting.selectedDate));
        return await this.logic.getMyGroupEvents(dateRange, groupId);
    }

    public async getEventsByTemplate(setting: UserSetting): Promise<TemplateEvent> {
        const templateCharactorInText = await this.findSpecialTemplateCharacter(setting.templateText);

        const templateEvent: TemplateEvent = {
            todayEventInfoList: [],
            nextDayEventInfoList: [],
            previousDayEventInfoList: [],
            includes: templateCharactorInText,
        };

        if (templateCharactorInText.isIncludeToday) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.TODAY,
                new Date(setting.selectedDate)
            );
            templateEvent.todayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        if (templateCharactorInText.isIncludeNextDay) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.NEXT_BUSINESS_DAY,
                new Date(setting.selectedDate)
            );
            templateEvent.todayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        if (templateCharactorInText.isIncludePreviousDay) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.PREVIOUS_BUSINESS_DAY,
                new Date(setting.selectedDate)
            );
            templateEvent.todayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        return templateEvent;
    }

    private async getPublicHolidays(specificDate: Date): Promise<string[]> {
        return await this.logic.getNarrowedDownPublicHolidays(specificDate);
    }

    public findSpecialTemplateCharacter(targetText: string): TemplateCharactorInText {
        const isIncludeToday = targetText.indexOf(SpecialTemplateCharactor.TODAY) !== -1;
        const isIncludeNextDay = targetText.indexOf(SpecialTemplateCharactor.NEXT_BUSINESS_DAY) !== -1;
        const isIncludePreviousDay = targetText.indexOf(SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY) !== -1;

        return {
            isIncludeToday: isIncludeToday,
            isIncludeNextDay: isIncludeNextDay,
            isIncludePreviousDay: isIncludePreviousDay,
        };
    }
}
