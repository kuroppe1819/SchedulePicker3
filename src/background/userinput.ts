import { StrageItems } from 'src/types/event';
import { StorageKeys } from './eventtype';
import { ContextMenuActionId, ContextMenuDateId } from 'src/background/contextmenu/defaultcontextmenu';
import { NormalActionServiceImpl } from './service/normalactionservice';
import ScheduleEventsLogicImpl from './scheduleeventslogic';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const getStrageItems = (): Promise<StrageItems> =>
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

const isContextMenuDateId = (menuId: ContextMenuActionId | ContextMenuDateId): boolean => {
    return (
        menuId === ContextMenuDateId.TODAY ||
        menuId === ContextMenuDateId.NEXT_BUSINESS_DAY ||
        menuId === ContextMenuDateId.PREVIOUS_BUSINESS_DAY ||
        menuId === ContextMenuDateId.SELECT_DATE
    );
};

const executeNormalAction = (menuItemId: ContextMenuActionId, tab?: chrome.tabs.Tab): void => {
    const service = new NormalActionServiceImpl(new ScheduleEventsLogicImpl(currentDomain));
    switch (menuItemId) {
        case ContextMenuActionId.MYSELF:
            break;
        case ContextMenuActionId.MYGROUP_UPDATE:
            service.updateContextMenus();
            break;
        case ContextMenuActionId.TEMPLATE:
            break;
        default:
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener(changeDomain);
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    const menuItemId = info.menuItemId;
    if (isContextMenuDateId(menuItemId)) {
        return; // TODO: DateIDが選択されたときの処理
    } else {
        executeNormalAction(menuItemId, tab);
    }
});
