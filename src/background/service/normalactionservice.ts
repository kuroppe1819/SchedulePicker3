import ScheduleEventsLogic from '../scheduleeventslogic';
import { ContextMenuParentId, defaultMenuItems, ContextMenuRootId } from '../contextmenu/defaultcontextmenu';
import { ContextMenuHelper } from '../contextmenu/contextmenuhelper';
import { ContextMenu } from 'src/types/contextmenu';

export interface NormalActionService {
    updateContextMenus(): Promise<void>;
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
}
