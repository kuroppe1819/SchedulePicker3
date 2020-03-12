import { ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';
import { EventsInfo, MyGroupEventsInfo } from 'src/types/event';
import { NoticeStateType, RecieveEventMessage, RecieveStateMessage } from 'src/types/notice';
import { UserSetting } from 'src/types/storage';
import { UserSettingServiceImpl } from '../storage/usersettingservice';
import { GaroonDataSourceImpl } from './data/garoondatasource';
import { ScheduleEventsLogicImpl } from './data/scheduleeventslogic';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { NormalActionService, NormalActionServiceImpl } from './service/normalactionservice';

let currentDomain = '';

const changeDomain = (message: { domain: string }): void => {
    if (message.domain === currentDomain) {
        return;
    }
    currentDomain = message.domain;
};

const noticeStateToContent = (tabId: number, state: NoticeStateType): void => {
    const message: RecieveStateMessage = { state: state };
    chrome.tabs.sendMessage(tabId, message);
};

const executeTemplateAction = async (
    normalActionService: NormalActionService,
    tabId: number,
    setting: UserSetting
): Promise<void> => {
    const userSetting = UserSettingServiceImpl.getInstance();
    const isPostMarkdown = await userSetting.getPostMarkdownFlag();
    const eventsInfo = await normalActionService.getEventsByTemplate(setting.filterSetting, setting.templateText);
    const templateText = await userSetting.getTemplateText();
    const message: RecieveEventMessage = {
        actionId: ContextMenuActionId.TEMPLATE,
        eventsInfo: eventsInfo,
        userSetting: {
            isPostMarkdown: isPostMarkdown,
            templateText: templateText,
        },
    };
    chrome.tabs.sendMessage(tabId, message);
};

const executeMySelfAction = async (
    normalActionService: NormalActionService,
    tabId: number,
    setting: UserSetting,
    dayId: ContextMenuDayId
): Promise<void> => {
    const userSetting = UserSettingServiceImpl.getInstance();
    const isPostMarkdown = await userSetting.getPostMarkdownFlag();
    const dateRange = await normalActionService.findDateRangeByDateId(dayId, setting.specifiedDate);
    const events = await normalActionService.getEventsByMySelf(setting.filterSetting, dateRange);
    const eventsInfo: EventsInfo = {
        specifiedDateStr: dateRange.startDate.toJSON(),
        events: events,
    };
    const message: RecieveEventMessage = {
        actionId: ContextMenuActionId.MYSELF,
        eventsInfo: eventsInfo,
        userSetting: {
            isPostMarkdown: isPostMarkdown,
        },
    };
    chrome.tabs.sendMessage(tabId, message);
};

const executeMyGroupAction = async (
    normalActionService: NormalActionService,
    tabId: number,
    setting: UserSetting,
    dayId: ContextMenuDayId,
    groupId: string
): Promise<void> => {
    const userSetting = UserSettingServiceImpl.getInstance();
    const isPostMarkdown = await userSetting.getPostMarkdownFlag();
    const dateRange = await normalActionService.findDateRangeByDateId(dayId, setting.specifiedDate);
    const events = await normalActionService.getEventsByMyGroup(groupId, setting.filterSetting, dateRange);
    const eventsInfo: MyGroupEventsInfo = {
        specifiedDateStr: dateRange.startDate.toJSON(),
        myGroupEvents: events,
    };
    const message: RecieveEventMessage = {
        actionId: ContextMenuActionId.MYGROUP,
        eventsInfo: eventsInfo,
        userSetting: {
            isPostMarkdown: isPostMarkdown,
        },
    };
    chrome.tabs.sendMessage(tabId, message);
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener(changeDomain);
});

chrome.runtime.onStartup.addListener(() => {
    chrome.runtime.onMessage.addListener(changeDomain);
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (tab === undefined || tab.id === undefined) {
        return;
    }

    const tabId = tab.id;
    const pureMenuItemId = ContextMenuHelper.removeSuffixOfId(info.menuItemId);
    const userSetting = await UserSettingServiceImpl.getInstance().getUserSetting();
    const normalActionService = new NormalActionServiceImpl(
        new ScheduleEventsLogicImpl(new GaroonDataSourceImpl(currentDomain))
    );

    try {
        noticeStateToContent(tabId, NoticeStateType.NOW_LOADING);
        if (pureMenuItemId === ContextMenuActionId.MYGROUP_UPDATE) {
            await normalActionService.updateContextMenus();
        } else if (pureMenuItemId === ContextMenuActionId.TEMPLATE) {
            await executeTemplateAction(normalActionService, tabId, userSetting);
        } else if (pureMenuItemId === ContextMenuActionId.MYSELF) {
            await executeMySelfAction(normalActionService, tabId, userSetting, info.parentMenuItemId);
        } else {
            await executeMyGroupAction(normalActionService, tabId, userSetting, info.parentMenuItemId, pureMenuItemId);
        }
    } catch (error) {
        throw new Error(`UserInput: ${error.message}`);
    } finally {
        noticeStateToContent(tabId, NoticeStateType.FINISHED);
    }
});
