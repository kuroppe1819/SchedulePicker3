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
import moment from 'moment';

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
        const now = moment();
        const publicHolidays = await this.getPublicHolidays(now.toDate());
        switch (dateId) {
            case ContextMenuDateId.TODAY: {
                return DateHelper.makeDateRange(now.toDate());
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
            return { id: g.key, title: g.name, parentId: ContextMenuParentId.MYGROUPS, type: 'normal' };
        });
    }

    public async updateContextMenus(): Promise<void> {
        const contextMenuHelper = ContextMenuHelper.getInstance();
        await contextMenuHelper.removeAll();
        const myGroupMenuItems = await this.getMyGroupMenuItems();
        const newContextMenuItems = defaultMenuItems.concat(myGroupMenuItems);
        contextMenuHelper.addAll(newContextMenuItems);
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
            selectedDayEventInfoList: [],
            nextDayEventInfoList: [],
            previousDayEventInfoList: [],
        };

        if (templateCharactorInText.isIncludeToday) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.TODAY,
                new Date(setting.selectedDate)
            );
            templateEvent.selectedDayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        if (templateCharactorInText.isIncludeNextDay) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.NEXT_BUSINESS_DAY,
                new Date(setting.selectedDate)
            );
            templateEvent.selectedDayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        if (templateCharactorInText.isIncludePreviousDay) {
            const dateRange = await this.findDateRangeFromDateId(
                ContextMenuDateId.PREVIOUS_BUSINESS_DAY,
                new Date(setting.selectedDate)
            );
            templateEvent.selectedDayEventInfoList = await this.getFilterdEventsByFilterSetting(dateRange, setting);
        }

        return templateEvent;
    }

    private async getPublicHolidays(specificDate: Date): Promise<string[]> {
        return await this.logic.getNarrowedDownPublicHolidays(specificDate);
    }

    private findSpecialTemplateCharacter(targetText: string): TemplateCharactorInText {
        const isIncludeToday = targetText.indexOf(SpecialTemplateCharactor.SELECTED_DAY) !== -1;
        const isIncludeNextDay = targetText.indexOf(SpecialTemplateCharactor.NEXT_BUSINESS_DAY) !== -1;
        const isIncludePreviousDay = targetText.indexOf(SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY) !== -1;

        return {
            isIncludeToday: isIncludeToday,
            isIncludeNextDay: isIncludeNextDay,
            isIncludePreviousDay: isIncludePreviousDay,
        };
    }
}
