import moment from 'moment';
import { ContextMenu, ContextMenuDayId, ContextMenuParentId } from 'src/types/contextmenu';
import { DateRange } from 'src/types/date';
import {
    Event,
    MyGroupEvent,
    SpecialTemplateCharactor,
    TemplateCharactorInText,
    TemplateEventsInfo,
} from 'src/types/event';
import { FilterSetting } from 'src/types/storage';
import { ScheduleEventsLogic } from '../data/scheduleeventslogic';
import { ContextMenuHelper } from '../helper/contextmenuhelper';
import { DateHelper } from '../helper/datehelper';
import { defaultMenuItems } from '../helper/defaultcontextmenu';

export interface NormalActionService {
    findDateRangeByDateId(dayId: ContextMenuDayId, specifiedDate?: Date): Promise<DateRange>;
    updateContextMenus(): Promise<void>;
    getEventsByMySelf(setting: FilterSetting, dateRange: DateRange): Promise<Event[]>;
    getEventsByMyGroup(groupId: string, setting: FilterSetting, dateRange: DateRange): Promise<MyGroupEvent[]>;
    getEventsByTemplate(setting: FilterSetting, templateText: string): Promise<TemplateEventsInfo>;
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
                    throw new Error('NormalActionService: 取得したい予定の日付を選択してください');
                }
                return DateHelper.makeDateRange(specifiedDate);
            }
            default: {
                throw new Error('NormalActionService: コンテキストメニューに存在しない日付のIDが選択されています');
            }
        }
    }

    private async getMyGroupMenuItems(): Promise<ContextMenu[]> {
        const myGroups = await this.logic.getMyGroups();

        const ContextMenuDayIdList = [
            ContextMenuDayId.TODAY,
            ContextMenuDayId.NEXT_BUSINESS_DAY,
            ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
            ContextMenuDayId.SPECIFIED_DAY,
        ];
        const MyGroupMenuItems: ContextMenu[] = [];
        myGroups.forEach(g => {
            ContextMenuDayIdList.forEach(menuId =>
                MyGroupMenuItems.push({
                    id: g.key + menuId,
                    title: g.name,
                    parentId: menuId,
                    type: 'normal',
                })
            );
        });
        return MyGroupMenuItems;
    }

    public async updateContextMenus(): Promise<void> {
        const myGroupMenuItems = await this.getMyGroupMenuItems();
        const newContextMenuItems = defaultMenuItems.concat(myGroupMenuItems);

        await ContextMenuHelper.refresh(newContextMenuItems);
    }

    public async getEventsByMySelf(setting: FilterSetting, dateRange: DateRange): Promise<Event[]> {
        const events = await this.logic.getSortedMyEvents(dateRange);
        return events.filter(event => {
            if (!setting.isIncludePrivateEvent && event.visibilityType === 'PRIVATE') {
                return false;
            }

            if (!setting.isIncludeAllDayEvent && event.isAllDay) {
                return false;
            }

            return true;
        });
    }

    public async getEventsByMyGroup(
        groupId: string,
        setting: FilterSetting,
        dateRange: DateRange
    ): Promise<MyGroupEvent[]> {
        const myGroupEvents = await this.logic.getMyGroupEvents(dateRange, groupId);
        return myGroupEvents.filter(myGroupevent => {
            if (!setting.isIncludePrivateEvent && myGroupevent.event.visibilityType === 'PRIVATE') {
                return false;
            }

            if (!setting.isIncludeAllDayEvent && myGroupevent.event.isAllDay) {
                return false;
            }

            return true;
        });
    }

    public async getEventsByTemplate(setting: FilterSetting, templateText: string): Promise<TemplateEventsInfo> {
        const templateEventsInfo: TemplateEventsInfo = {
            specifiedDate: {
                todayStr: '',
                nextDayStr: '',
                previousDayStr: '',
            },
            todayEvents: [],
            nextDayEvents: [],
            previousDayEvents: [],
        };

        if (!templateText) {
            return templateEventsInfo;
        }

        const templateCharactorInText = await this.findSpecialTemplateCharacter(templateText);
        if (templateCharactorInText.isIncludeToday) {
            const dateRange = await this.findDateRangeByDateId(ContextMenuDayId.TODAY);
            templateEventsInfo.specifiedDate.todayStr = dateRange.startDate.toJSON();
            templateEventsInfo.todayEvents = await this.getEventsByMySelf(setting, dateRange);
        }

        if (templateCharactorInText.isIncludeNextDay) {
            const dateRange = await this.findDateRangeByDateId(ContextMenuDayId.NEXT_BUSINESS_DAY);
            templateEventsInfo.specifiedDate.nextDayStr = dateRange.startDate.toJSON();
            templateEventsInfo.nextDayEvents = await this.getEventsByMySelf(setting, dateRange);
        }

        if (templateCharactorInText.isIncludePreviousDay) {
            const dateRange = await this.findDateRangeByDateId(ContextMenuDayId.PREVIOUS_BUSINESS_DAY);
            templateEventsInfo.specifiedDate.previousDayStr = dateRange.startDate.toJSON();
            templateEventsInfo.previousDayEvents = await this.getEventsByMySelf(setting, dateRange);
        }

        return templateEventsInfo;
    }

    private async getPublicHolidays(specificDate: Date): Promise<string[]> {
        return await this.logic.getNarrowedDownPublicHolidays(specificDate);
    }

    private findSpecialTemplateCharacter(targetText: string): TemplateCharactorInText {
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
