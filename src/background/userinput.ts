import { ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';
import { NoticeStateType } from 'src/types/notice';
import { UserSetting } from 'src/types/storage';
import { UserSettingServiceImpl } from '../storage/usersettingservice';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import { ScheduleEventsLogicImpl } from './data/scheduleeventslogic';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { NormalActionServiceImpl } from './service/normalactionservice';
import { RadioActionServiceImpl } from './service/radioactionservice';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const noticeStateToContent = (tabId: number, state: NoticeStateType): void =>
    chrome.tabs.sendMessage(tabId, { state: state });

const executeRadioAction = async (menuItemId: ContextMenuDayId): Promise<void> => {
    await UserSettingServiceImpl.getInstance().setDayId(menuItemId);
    if (menuItemId === ContextMenuDayId.SPECIFIED_DAY) {
        RadioActionServiceImpl.showCalendarWindow();
    }
};

const executeNormalAction = async (
    tabId: number,
    setting: UserSetting,
    menuItemId: ContextMenuActionId | string
): Promise<void> => {
    const normalActionService = new NormalActionServiceImpl(
        new ScheduleEventsLogicImpl(new GaroonDataSourceImpl(currentDomain))
    );

    if (menuItemId === ContextMenuActionId.MYGROUP_UPDATE) {
        await normalActionService.updateContextMenus();
        return;
    }

    const dateRange = await normalActionService.findDateRangeByDateId(setting.dayId, setting.specifiedDate);
    switch (menuItemId) {
        case ContextMenuActionId.MYSELF: {
            const events = await normalActionService.getEventsByMySelf(setting.filterSetting, dateRange);
            chrome.tabs.sendMessage(tabId, {
                actionId: ContextMenuActionId.MYSELF,
                events: events,
                specificDateStr: dateRange.startDate.toJSON(),
            });
            break;
        }
        case ContextMenuActionId.TEMPLATE: {
            const events = await normalActionService.getEventsByTemplate(setting.filterSetting, setting.templateText);
            const templateText = await UserSettingServiceImpl.getInstance().getTemplateText();
            chrome.tabs.sendMessage(tabId, {
                actionId: ContextMenuActionId.TEMPLATE,
                events: events,
                templateText: templateText,
            });
            break;
        }
        default: {
            const myGroupEvents = await normalActionService.getEventsByMyGroup(
                menuItemId,
                setting.filterSetting,
                dateRange
            );
            chrome.tabs.sendMessage(tabId, {
                actionId: ContextMenuActionId.MYGROUP,
                events: myGroupEvents,
                specificDateStr: dateRange.startDate.toJSON(),
            });
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
    const userSetting = await UserSettingServiceImpl.getInstance().getUserSetting();
    if (ContextMenuHelper.isContextMenuDayId(menuItemId)) {
        await executeRadioAction(menuItemId);
        return;
    }

    try {
        noticeStateToContent(tabId, NoticeStateType.NOW_LOADING);
        await executeNormalAction(tabId, userSetting, menuItemId);
    } catch (error) {
        throw new Error(`UserInput: ${error.message}`);
    } finally {
        noticeStateToContent(tabId, NoticeStateType.FINISHED);
    }
});
