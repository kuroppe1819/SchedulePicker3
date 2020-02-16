import ScheduleEventsLogic from '../scheduleeventslogic';
import { ContextMenuHelper } from '../contextmenu/contextmenuhelper';
import { ContextMenu, ContextMenuParentId } from 'src/types/contextmenu';
import { EventInfo, StorageItems } from 'src/types/event';
import { DateRange } from 'src/types/date';
import { defaultMenuItems } from '../contextmenu/defaultcontextmenu';

export interface NormalActionService {
    updateContextMenus(): Promise<void>;
    getEventsByMySelf(items: StorageItems, dateRange: DateRange): Promise<EventInfo[]>;
    getPublicHolidays(specificDate: Date): Promise<string[]>;
}

export class NormalActionServiceImpl implements NormalActionService {
    private logic: ScheduleEventsLogic;

    constructor(logic: ScheduleEventsLogic) {
        this.logic = logic;
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

    public async getEventsByMySelf(items: StorageItems, dateRange: DateRange): Promise<EventInfo[]> {
        const events = await this.logic.getSortedMyEvents(dateRange);
        return events.filter(event => {
            let isIncludeEvent = true;

            if (!items.isIncludePrivateEvent) {
                isIncludeEvent = event.visibilityType !== 'PRIVATE';
            }

            if (!items.isIncludeAllDayEvent) {
                isIncludeEvent = !event.isAllDay;
            }

            return isIncludeEvent;
        });
    }

    public async getPublicHolidays(specificDate: Date): Promise<string[]> {
        return await this.logic.getNarrowedDownPublicHolidays(specificDate);
    }
}
