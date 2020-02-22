import { ContextMenuActionId, ContextMenuDateId } from 'src/types/contextmenu';
import { EventInfo, TemplateEvent, MyGroupEvent } from 'src/types/event';
import { NoticeEventType } from 'src/types/notice';
import { ContextMenuHelper } from './contextmenu/contextmenuhelper';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import ScheduleEventsLogicImpl from './data/scheduleeventslogic';
import { NormalActionServiceImpl } from './service/normalactionservice';
import { RadioActionServiceImpl } from './service/radioactionservice';
import { UserSetting, StorageKeys } from 'src/types/storage';

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
                StorageKeys.DATE_TYPE,
                StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                StorageKeys.TEMPLATE_TEXT,
            ],
            items => Promise.resolve(items)
        )
    );

const noticeStateToContent = (tabId: number, state: NoticeEventType): void =>
    chrome.tabs.sendMessage(tabId, { state: state });

const noticeEventMessageToContent = (
    tabId: number,
    actionId: ContextMenuActionId,
    selectedDate: Date,
    events: EventInfo[] | MyGroupEvent[] | TemplateEvent
): void => chrome.tabs.sendMessage(tabId, { actionId: actionId, selectedDate: selectedDate, events: events });

const executeRadioAction = (menuItemId: ContextMenuDateId): void => {
    RadioActionServiceImpl.setDateIdInStorage(menuItemId);
    if (menuItemId === ContextMenuDateId.SELECT_DAY) {
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
            noticeEventMessageToContent(tabId, menuItemId, new Date(setting.selectedDate), events);
            break;
        }
        case ContextMenuActionId.MYGROUP_UPDATE: {
            service.updateContextMenus();
            break;
        }
        case ContextMenuActionId.TEMPLATE: {
            const events = await service.getEventsByTemplate(setting);
            noticeEventMessageToContent(tabId, menuItemId, new Date(setting.selectedDate), events);
            break;
        }
        default: {
            const myGroupEvents = await service.getEventsByMyGroup(tabId.toString(), setting);
            noticeEventMessageToContent(tabId, menuItemId, new Date(setting.selectedDate), myGroupEvents);
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
    if (ContextMenuHelper.isContextMenuDateId(menuItemId)) {
        executeRadioAction(menuItemId);
    }

    try {
        noticeStateToContent(tabId, NoticeEventType.NOW_LOADING);
        await executeNormalAction(tabId, items, menuItemId);
    } catch (error) {
        noticeStateToContent(tabId, NoticeEventType.ERROR);
        throw new Error(`RuntimeErrorException: ${error.message}`);
    } finally {
        noticeStateToContent(tabId, NoticeEventType.FINISHED);
    }
});
