import { ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';
import { EventInfo, TemplateEvent, MyGroupEvent } from 'src/types/event';
import { NoticeStateType } from 'src/types/notice';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import { ScheduleEventsLogicImpl } from './data/scheduleeventslogic';
import { NormalActionServiceImpl } from './service/normalactionservice';
import { RadioActionServiceImpl } from './service/radioactionservice';
import { UserSetting, StorageKeys } from 'src/types/storage';
import { ContextMenuHelper } from './helper/contextmenuhelper';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const getStorageItems = (): Promise<UserSetting> =>
    new Promise((): void =>
        chrome.storage.sync.get(
            [
                StorageKeys.DAY_ID,
                StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                StorageKeys.TEMPLATE_TEXT,
            ],
            items => Promise.resolve(items)
        )
    );

const noticeStateToContent = (tabId: number, state: NoticeStateType): void =>
    chrome.tabs.sendMessage(tabId, { state: state });

const noticeEventsToContent = (
    tabId: number,
    actionId: ContextMenuActionId,
    selectedDate: Date,
    events: EventInfo[] | MyGroupEvent[] | TemplateEvent
): void => chrome.tabs.sendMessage(tabId, { actionId: actionId, selectedDate: selectedDate, events: events });

const executeRadioAction = (menuItemId: ContextMenuDayId): void => {
    RadioActionServiceImpl.setDayIdInStorage(menuItemId);
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
            noticeEventsToContent(tabId, menuItemId, new Date(setting.selectedDate), events);
            break;
        }
        case ContextMenuActionId.MYGROUP_UPDATE: {
            service.updateContextMenus();
            break;
        }
        case ContextMenuActionId.TEMPLATE: {
            const events = await service.getEventsByTemplate(setting);
            noticeEventsToContent(tabId, menuItemId, new Date(setting.selectedDate), events);
            break;
        }
        default: {
            const myGroupEvents = await service.getEventsByMyGroup(tabId.toString(), setting);
            noticeEventsToContent(tabId, ContextMenuActionId.MYGROUP, new Date(setting.selectedDate), myGroupEvents);
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
    const items = await getStorageItems();
    if (ContextMenuHelper.isContextMenuDayId(menuItemId)) {
        executeRadioAction(menuItemId);
    }

    try {
        noticeStateToContent(tabId, NoticeStateType.NOW_LOADING);
        await executeNormalAction(tabId, items, menuItemId);
    } catch (error) {
        throw new Error(`RuntimeErrorException: ${error.message}`);
    } finally {
        noticeStateToContent(tabId, NoticeStateType.FINISHED);
    }
});
