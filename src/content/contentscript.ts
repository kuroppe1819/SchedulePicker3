import { ContextMenuActionId } from 'src/types/contextmenu';
import { NoticeStateType, RecieveEventMessage, RecieveStateMessage } from 'src/types/notice';
import { EventsInfo, MyGroupEventsInfo, TemplateEventsInfo } from '../types/event';
import { GenerateEvents } from './generateevents';
import { GenerateHtmlImpl } from './generatehtml';
import { GenerateMarkdownImpl } from './generatemarkdown';

const assertActiveElementIsNotNull = (): void => {
    // 現在フォーカスが与えられている要素を取得する
    const target = document.activeElement;
    // フォーカスが外れているときactiveElementはnullかbodyを返す
    if (target === null || target.tagName === 'BODY') {
        document.body.style.cursor = 'auto';
        throw new Error('NullPointerException: フォーカスが与えられている要素がありません');
    }
};

const changeProgress = (state: NoticeStateType): void => {
    switch (state) {
        case NoticeStateType.NOW_LOADING: {
            document.body.style.cursor = 'progress';
            break;
        }
        case NoticeStateType.FINISHED: {
            document.body.style.cursor = 'auto';
            break;
        }
        default: {
            throw new Error('ContentScript: 不正な通知イベントが発生しました');
        }
    }
};

const pasteEvents = async (message: RecieveEventMessage, generateEvents: GenerateEvents): Promise<void> => {
    const command = message.userSetting.isPostMarkdown ? 'insertText' : 'insertHtml';

    if (message.actionId === ContextMenuActionId.MYSELF) {
        const eventsInfo = message.eventsInfo as EventsInfo;
        const title = generateEvents.constructScheduleTitle(eventsInfo.specifiedDateStr);
        const body = generateEvents.constructEvents(eventsInfo.events);
        document.execCommand(command, false, title + body);
    }

    if (message.actionId === ContextMenuActionId.MYGROUP) {
        const myGroupEventsInfo = message.eventsInfo as MyGroupEventsInfo;
        const title = generateEvents.constructScheduleTitle(myGroupEventsInfo.specifiedDateStr);
        const body = generateEvents.constructMyGroupEvents(
            myGroupEventsInfo.myGroupEvents,
            myGroupEventsInfo.specifiedDateStr
        );
        document.execCommand(command, false, title + body);
    }

    if (message.actionId === ContextMenuActionId.TEMPLATE && message.userSetting.templateText) {
        const body = generateEvents.constructTemplateEvents(
            message.userSetting.templateText,
            message.eventsInfo as TemplateEventsInfo
        );
        document.execCommand(command, false, body);
    }
};

chrome.runtime.sendMessage({ domain: document.domain });

// messageの中の参照型はすべてstringで帰ってくるので注意！！
chrome.runtime.onMessage.addListener((message: RecieveEventMessage | RecieveStateMessage) => {
    if ('state' in message && message.state != undefined) {
        const stateMessage = message as RecieveStateMessage;
        changeProgress(stateMessage.state);
        return;
    }

    try {
        assertActiveElementIsNotNull();
    } catch (error) {
        return;
    }

    const eventMessage = message as RecieveEventMessage;
    const generateEvents = eventMessage.userSetting.isPostMarkdown
        ? new GenerateMarkdownImpl()
        : new GenerateHtmlImpl();
    pasteEvents(eventMessage, generateEvents);
});

changeProgress(NoticeStateType.FINISHED);
