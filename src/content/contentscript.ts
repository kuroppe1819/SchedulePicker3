import { ContextMenuActionId } from 'src/types/contextmenu';
import { NoticeStateType, RecieveEventMessage } from 'src/types/notice';
import { EventInfo, MyGroupEvent, SpecialTemplateCharactor, TemplateEvent } from '../types/event';
import { GenerateHtmlImpl } from './generatehtml';

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
            throw new Error('RuntimeErrorException: 不正な通知イベントが発生しました');
        }
    }
};

const replaceText = (source: string, from: string, to: string): string => {
    const escapeRegExp = (text): string => {
        // eslint-disable-next-line no-useless-escape
        return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味する
    };
    const regex = new RegExp(escapeRegExp(from), 'g');
    return source.replace(regex, to);
};

const pasteEventsByHtml = async (message: RecieveEventMessage): Promise<void> => {
    const generateHtml = new GenerateHtmlImpl();
    if (message.actionId === ContextMenuActionId.MYSELF) {
        const title = generateHtml.constructHtmlScheduleTitle(message.specificDateStr);
        const body = generateHtml.constructHtmlForEvents(message.events as EventInfo[]);
        document.execCommand('insertHtml', false, title + body);
    }

    if (message.actionId === ContextMenuActionId.MYGROUP) {
        const title = generateHtml.constructHtmlScheduleTitle(message.specificDateStr);
        const body = generateHtml.constructHtmlForMyGroupEvents(
            message.events as MyGroupEvent[],
            message.specificDateStr
        );
        document.execCommand('insertHtml', false, title + body);
    }

    if (message.actionId === ContextMenuActionId.TEMPLATE) {
        const templateEvent = message.events as TemplateEvent;
        let templateHtml = message.templateText.replace(/\r?\n/g, '<br>');
        if (templateEvent.todayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.todayEventInfoList);
            templateHtml = replaceText(templateHtml, `${SpecialTemplateCharactor.TODAY}<br>`, body);
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.TODAY, body);
        }

        if (templateEvent.nextDayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.nextDayEventInfoList);
            templateHtml = replaceText(templateHtml, `${SpecialTemplateCharactor.NEXT_BUSINESS_DAY}<br>`, body);
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.NEXT_BUSINESS_DAY, body);
        }

        if (templateEvent.previousDayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.previousDayEventInfoList);
            templateHtml = replaceText(templateHtml, `${SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY}<br>`, body);
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY, body);
        }
        document.execCommand('insertHTML', false, templateHtml);
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
    pasteEventsByHtml(message);
});

changeProgress(NoticeStateType.FINISHED);
