import { StorageItems, EventInfo, MyGroupEvent } from 'src/types/event';
import { StorageKeys } from './eventtype';
import { NormalActionServiceImpl } from './service/normalactionservice';
import ScheduleEventsLogicImpl from './scheduleeventslogic';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import { NoticeEventType } from 'src/types/notice';
import { DateHelper } from './service/datehelper';
import { ContextMenuDateId, ContextMenuActionId } from 'src/types/contextmenu';
import { DateRange } from 'src/types/date';
import { ContextMenuHelper } from './contextmenu/contextmenuhelper';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const getStorageItems = (): Promise<StorageItems> =>
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

const findDateRangeFromDateId = (
    dateId: ContextMenuDateId,
    selectedDate?: Date,
    publicHolidays?: string[]
): DateRange => {
    switch (dateId) {
        case ContextMenuDateId.TODAY: {
            return DateHelper.makeDateRange(new Date());
        }
        case ContextMenuDateId.NEXT_BUSINESS_DAY: {
            if (publicHolidays === undefined) {
                throw new Error('RuntimeErrorException: publicHolidays is undefined');
            }
            return DateHelper.makeDateRange(DateHelper.assignBusinessDate(new Date(), publicHolidays, 1));
        }
        case ContextMenuDateId.PREVIOUS_BUSINESS_DAY: {
            if (publicHolidays === undefined) {
                throw new Error('RuntimeErrorException: publicHolidays is undefined');
            }
            return DateHelper.makeDateRange(DateHelper.assignBusinessDate(new Date(), publicHolidays, -1));
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
};

const noticeStateToContent = (tabId: number, state: NoticeEventType): void =>
    chrome.tabs.sendMessage(tabId, { state: state });

const noticeEventMessageToContent = (
    tabId: number,
    actionId: ContextMenuActionId,
    selectedDate: Date,
    events: EventInfo[]
): void => chrome.tabs.sendMessage(tabId, { actionId: actionId, selectedDate: selectedDate, events: events });

const executeNormalAction = async (
    tabId: number,
    items: StorageItems,
    menuItemId: ContextMenuActionId
): Promise<void> => {
    const service = new NormalActionServiceImpl(new ScheduleEventsLogicImpl(new GaroonDataSourceImpl(currentDomain)));

    switch (menuItemId) {
        case ContextMenuActionId.MYSELF: {
            const dateRange = findDateRangeFromDateId(items.dateId);
            const events = await service.getEventsByMySelf(items, dateRange);
            noticeEventMessageToContent(tabId, menuItemId, new Date(items.selectedDate), events);
            break;
        }
        case ContextMenuActionId.MYGROUP_UPDATE: {
            service.updateContextMenus();
            break;
        }
        case ContextMenuActionId.TEMPLATE: {
            break;
        }
        default: {
            // マイグループがくる
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
        return; // TODO: DateIDが選択されたときの処理
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
