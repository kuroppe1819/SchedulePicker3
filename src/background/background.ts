import { ScheduleEventType, ContextMenuIds } from './eventtype';
import * as util from './util';
import ScheduleEventsLogicImpl from './scheduleeventslogic';

const defaultMenuItems = [
    { id: ContextMenuIds.ROOT.toString(), title: 'SchedulePicker' },
    { id: ContextMenuIds.TODAY.toString(), title: '今日の予定', parentId: ContextMenuIds.ROOT },
    { id: ContextMenuIds.NEXT_BUSINESS_DAY.toString(), title: '翌営業日の予定', parentId: ContextMenuIds.ROOT },
    { id: ContextMenuIds.TEMPLATE.toString(), title: 'テンプレート', parentId: ContextMenuIds.ROOT },
    { id: ContextMenuIds.MYSELF.toString(), title: '自分', parentId: ContextMenuIds.TODAY },
];

const createContextMenuItems = async (myGroupMenuItems): Promise<any> => {
    return defaultMenuItems.concat(myGroupMenuItems);
};

const addMenu = (menu: any): void => {
    chrome.contextMenus.create({
        id: menu.id,
        title: menu.title,
        parentId: menu.parentId,
        type: 'normal',
        contexts: ['all'],
    });
};

const setupContextMenu = async (domain: string): Promise<void> => {
    const logic = new ScheduleEventsLogicImpl(domain);
    const myGroups = await logic.getMyGroups();
    const myGroupMenuItems = myGroups.map(g => {
        return { id: g.key, title: g.name, parentId: ContextMenuIds.TODAY };
    });

    const contextMenuItems = await createContextMenuItems(myGroupMenuItems);
    contextMenuItems.forEach(item => {
        addMenu(item);
    });
    chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
        switch (info.menuItemId) {
            case ContextMenuIds.MYSELF: {
                const schedule = await logic.getMySchedule(ScheduleEventType.TODAY);
                chrome.tabs.sendMessage(tab!.id!, util.sortByTime(schedule.events));
                break;
            }
            case ContextMenuIds.NEXT_BUSINESS_DAY: {
                chrome.tabs.sendMessage(tab!.id!, ContextMenuIds.NEXT_BUSINESS_DAY);
                break;
            }
            case ContextMenuIds.TEMPLATE: {
                chrome.tabs.sendMessage(tab!.id!, ContextMenuIds.TEMPLATE);
                break;
            }
            default: {
                const schedule = await logic.getMyGroupSchedule(ScheduleEventType.TODAY, info.menuItemId);
                chrome.tabs.sendMessage(tab!.id!, util.sortByTime(schedule.events));
                break;
            }
        }
    });
};

chrome.runtime.onMessage.addListener((message, sender, resp) => {
    // FIXME 全部消すんじゃなくて、MyGroupのメニューだけを消すようにする
    chrome.contextMenus.removeAll(() => {
        setupContextMenu(message.domain);
    });
});
