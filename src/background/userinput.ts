import { ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';
import { EventInfo, TemplateEvent, MyGroupEvent } from 'src/types/event';
import { NoticeStateType } from 'src/types/notice';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import { ScheduleEventsLogicImpl } from './data/scheduleeventslogic';
import { NormalActionServiceImpl } from './service/normalactionservice';
import { RadioActionServiceImpl } from './service/radioactionservice';
import { UserSetting } from 'src/types/storage';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { StorageAccess } from '../storage/storageaccess';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const noticeStateToContent = (tabId: number, state: NoticeStateType): void =>
    chrome.tabs.sendMessage(tabId, { state: state });

const noticeEventsToContent = (
    tabId: number,
    actionId: ContextMenuActionId,
    events: EventInfo[] | MyGroupEvent[] | TemplateEvent,
    templateText?: string
): void => {
    if (templateText) {
        chrome.tabs.sendMessage(tabId, { actionId: actionId, events: events, templateText: templateText });
    } else {
        chrome.tabs.sendMessage(tabId, { actionId: actionId, events: events });
    }
};

const executeRadioAction = async (menuItemId: ContextMenuDayId): Promise<void> => {
    await StorageAccess.setDayId(menuItemId);
    if (menuItemId === ContextMenuDayId.SELECT_DAY) {
        RadioActionServiceImpl.showPopupWindow();
    }
};

const executeNormalAction = async (
    tabId: number,
    setting: UserSetting,
    menuItemId: ContextMenuActionId
): Promise<void> => {
    const service = new NormalActionServiceImpl(new ScheduleEventsLogicImpl(new GaroonDataSourceImpl(currentDomain)));

    switch (menuItemId) {
        case ContextMenuActionId.MYSELF: {
            const events = await service.getEventsByMySelf(setting);
            noticeEventsToContent(tabId, ContextMenuActionId.MYSELF, events);
            break;
        }
        case ContextMenuActionId.MYGROUP_UPDATE: {
            service.updateContextMenus();
            break;
        }
        case ContextMenuActionId.TEMPLATE: {
            const events = await service.getEventsByTemplate(setting);
            noticeEventsToContent(tabId, ContextMenuActionId.TEMPLATE, events, setting.templateText);
            break;
        }
        default: {
            const myGroupEvents = await service.getEventsByMyGroup(tabId.toString(), setting);
            noticeEventsToContent(tabId, ContextMenuActionId.MYGROUP, myGroupEvents);
            break;
        }
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener(changeDomain);
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (tab === undefined || tab.id === undefined) {
        return;
    }

    const tabId = tab.id;
    const menuItemId = info.menuItemId;
    const userSetting = await StorageAccess.getUserSetting();
    if (ContextMenuHelper.isContextMenuDayId(menuItemId)) {
        await executeRadioAction(menuItemId);
        return;
    }

    try {
        noticeStateToContent(tabId, NoticeStateType.NOW_LOADING);
        await executeNormalAction(tabId, userSetting, menuItemId);
    } catch (error) {
        throw new Error(`RuntimeErrorException: ${error.message}`);
    } finally {
        noticeStateToContent(tabId, NoticeStateType.FINISHED);
    }
});
