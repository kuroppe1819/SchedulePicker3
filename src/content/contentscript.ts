import { ContextMenuActionId } from 'src/types/contextmenu';
import { NoticeStateType, RecieveEventMessage } from 'src/types/notice';
import { EventInfo, MyGroupEvent, TemplateEvent } from '../types/event';
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
    const command = message.isPostMarkdown ? 'insertText' : 'insertHtml';

    if (message.actionId === ContextMenuActionId.MYSELF) {
        const title = generateEvents.constructScheduleTitle(message.specificDateStr);
        const body = generateEvents.constructEvents(message.events as EventInfo[]);
        document.execCommand(command, false, title + body);
    }

    if (message.actionId === ContextMenuActionId.MYGROUP) {
        const title = generateEvents.constructScheduleTitle(message.specificDateStr);
        const body = generateEvents.constructMyGroupEvents(message.events as MyGroupEvent[], message.specificDateStr);
        document.execCommand(command, false, title + body);
    }

    if (message.actionId === ContextMenuActionId.TEMPLATE && message.templateText) {
        const body = generateEvents.constructTemplateEvents(message.templateText, message.events as TemplateEvent);
        document.execCommand(command, false, body);
    }
};

chrome.runtime.sendMessage({ domain: document.domain });

// messageの中の参照型はすべてstringで帰ってくるので注意！！
chrome.runtime.onMessage.addListener((message: RecieveEventMessage) => {
    if (message.state !== undefined) {
        changeProgress(message.state);
        return;
    }

    try {
        assertActiveElementIsNotNull();
    } catch (error) {
        return;
    }

    const generateEvents = message.isPostMarkdown ? new GenerateMarkdownImpl() : new GenerateHtmlImpl();
    pasteEvents(message, generateEvents);
});

changeProgress(NoticeStateType.FINISHED);
