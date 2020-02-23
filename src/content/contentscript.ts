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

const replacedText = (source: string, target: string, specialTemplateCharactor: SpecialTemplateCharactor): string => {
    const escapeRegExp = (text): string => {
        // eslint-disable-next-line no-useless-escape
        return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味する
    };
    const regex = new RegExp(escapeRegExp(specialTemplateCharactor), 'g');
    return source.replace(regex, target);
};

const pasteEventsByHtml = async (message: RecieveEventMessage): Promise<void> => {
    const generateHtml = new GenerateHtmlImpl();
    if (message.actionId === ContextMenuActionId.MYSELF) {
        const title = generateHtml.constructHtmlScheduleTitle(message.selectedDate);
        const body = generateHtml.constructHtmlForEvents(message.events as EventInfo[]);
        document.execCommand('insertHtml', false, title + body);
    }

    if (message.actionId === ContextMenuActionId.MYGROUP) {
        const title = generateHtml.constructHtmlScheduleTitle(message.selectedDate);
        const body = generateHtml.constructHtmlForMyGroupEvents(message.events as MyGroupEvent[], message.selectedDate);
        document.execCommand('insertHtml', false, title + body);
    }

    if (message.actionId === ContextMenuActionId.TEMPLATE) {
        const templateEvent = message.events as TemplateEvent;
        let templateText = message.templateText;
        if (templateEvent.selectedDayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.selectedDayEventInfoList);
            templateText = replacedText(templateText, body, SpecialTemplateCharactor.SELECTED_DAY);
        }

        if (templateEvent.nextDayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.nextDayEventInfoList);
            templateText = replacedText(templateText, body, SpecialTemplateCharactor.NEXT_BUSINESS_DAY);
        }

        if (templateEvent.previousDayEventInfoList.length !== 0) {
            const body = generateHtml.constructHtmlForEvents(templateEvent.selectedDayEventInfoList);
            templateText = replacedText(templateText, body, SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY);
        }
        document.execCommand('insertHTML', false, templateText);
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
