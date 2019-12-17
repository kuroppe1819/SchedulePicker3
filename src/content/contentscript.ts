import { EventsType, SpecialTemplateCharactor } from '../background/eventtype';
import { EventInfo, Participant, RecieveEventMessage, MyGroupEvent, TemplateEvent } from '../types/event';
import { formatDate } from '../background/dateutil';
import { eventMenuColor } from './eventmenucolor';

const isAlldayInRegularEvent = (eventInfo: EventInfo): boolean => {
    if (eventInfo.isStartOnly) {
        return false;
    }
    const startTime = formatDate(new Date(eventInfo.startTime), 'HH:mm');

    if (eventInfo.endTime == null) {
        return false;
    }
    const endTime = formatDate(new Date(eventInfo.endTime), 'HH:mm');
    return startTime === '00:00' && endTime === '23:59';
};

const createHtmlScheduleTitle = (date: Date): string => {
    return `<div>【 ${formatDate(date, 'yyyy-MM-dd')} の予定 】</div>`;
};

const createEventMenu = (planName: string): string => {
    const rgb = eventMenuColor(planName);
    return `<span 
                style="background-color: rgb(${rgb.r}, ${rgb.g}, ${rgb.b}); 
                display: inline-block; 
                margin-right: 3px; 
                padding: 2px 2px 1px; 
                color: rgb(255, 255, 255); 
                font-size: 11.628px; 
                border-radius: 2px; 
                line-height: 1.1;"
            >${planName}</span>`;
};

const createHtmlForTimeRange = (eventInfo: EventInfo): string => {
    const startTime = formatDate(new Date(eventInfo.startTime), 'HH:mm');
    if (eventInfo.isStartOnly || eventInfo.endTime == null) {
        return `<span>${startTime}</span>`;
    } else {
        const endTime = formatDate(new Date(eventInfo.endTime), 'HH:mm');
        return `<span>${startTime}-${endTime}</span>`;
    }
};

const createHtmlForEventName = (eventInfo: EventInfo): string => {
    return `<a href="https://bozuman.cybozu.com/g/schedule/view.csp?event=${eventInfo.id}">${eventInfo.subject}</a>`;
};

const createHtmlForEventParticipant = (date: Date, participants: Participant[]): string => {
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    return `
        ${participants
            .map(
                participant =>
                    `<a style="color: chocolate;" 
                        href="https://bozuman.cybozu.com/g/schedule/personal_day.csp?bdate=${formattedDate}&uid=${
                        participant.id
                    }"> (${participant.name.split(' ')[0]}) </a>`
            )
            .join('')}`;
};

const createHtmlForAllDayEvent = (eventInfo: EventInfo): string => {
    let body = '';
    if (eventInfo.eventMenu !== '') {
        body += createEventMenu(eventInfo.eventMenu);
    }

    body += ` ${createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整
    return `<div>${body}</div>`;
};

const createHtmlForRegularEvent = (eventInfo: EventInfo): string => {
    let body = '';
    body += createHtmlForTimeRange(eventInfo);

    if (eventInfo.eventMenu !== '') {
        body += ` ${createEventMenu(eventInfo.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
    }
    body += ` ${createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整

    return `<div>${body}</div>`;
};

const createHtmlForRegularEventIncludeParticipant = (
    eventInfo: EventInfo,
    date: Date,
    participants: Participant[] = []
): string => {
    let body = '';
    body += createHtmlForTimeRange(eventInfo);

    if (eventInfo.eventMenu !== '') {
        body += ` ${createEventMenu(eventInfo.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
    }
    body += ` ${createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整

    if (participants.length !== 0) {
        body += createHtmlForEventParticipant(date, participants);
    }
    return `<div>${body}</div>`;
};

const createHtmlForEventList = (eventInfoList: EventInfo[]): string => {
    const regularEventList: EventInfo[] = [];
    const allDayEventList: EventInfo[] = [];

    eventInfoList.forEach(eventInfo => {
        if (eventInfo.eventType === 'REGULAR' || eventInfo.eventType === 'REPEATING') {
            regularEventList.push(eventInfo);
        } else if (eventInfo.eventType === 'ALL_DAY') {
            allDayEventList.push(eventInfo);
        }
    });

    let body = '';
    body += regularEventList
        .map(eventInfo => {
            if (isAlldayInRegularEvent(eventInfo)) {
                return createHtmlForAllDayEvent(eventInfo);
            } else {
                return createHtmlForRegularEvent(eventInfo);
            }
        })
        .join('');

    if (allDayEventList.length !== 0) {
        body += '<br><div>［終日予定］</div>';
        body += allDayEventList.map(eventInfo => createHtmlForAllDayEvent(eventInfo)).join('');
    }
    return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
};

const createHtmlForMyGroupEventList = (myGroupEventList: MyGroupEvent[], date: Date): string => {
    const regularEventList: MyGroupEvent[] = [];
    const allDayEventList: MyGroupEvent[] = [];

    myGroupEventList.forEach(groupEvent => {
        if (groupEvent.eventInfo.eventType === 'REGULAR' || groupEvent.eventInfo.eventType === 'REPEATING') {
            regularEventList.push(groupEvent);
        } else if (groupEvent.eventInfo.eventType === 'ALL_DAY') {
            allDayEventList.push(groupEvent);
        }
    });

    let body = '';
    body += regularEventList
        .map(groupEvent => {
            if (isAlldayInRegularEvent(groupEvent.eventInfo)) {
                return createHtmlForAllDayEvent(groupEvent.eventInfo);
            } else {
                return createHtmlForRegularEventIncludeParticipant(groupEvent.eventInfo, date, groupEvent.participants);
            }
        })
        .join('');

    if (allDayEventList.length !== 0) {
        body += '<br><div>［終日予定］</div>';
        body += allDayEventList.map(groupEvent => createHtmlForAllDayEvent(groupEvent.eventInfo)).join('');
    }
    return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
};

const escapeRegExp = (text): string => {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味する
};

chrome.runtime.sendMessage({ domain: document.domain });

// messageの中の参照型はすべてstringで帰ってくるので注意！！
chrome.runtime.onMessage.addListener((message: RecieveEventMessage) => {
    if (message.eventType === EventsType.NOW_LOADING) {
        document.body.style.cursor = 'progress';
        return;
    }

    // 現在フォーカスが与えられている要素を取得する
    const target = document.activeElement;
    // フォーカスが外れているときactiveElementはnullかbodyを返す
    if (target === null || target.tagName === 'BODY' || message.eventType === EventsType.ERROR) {
        document.body.style.cursor = 'auto';
        return;
    }

    if (message.eventType === EventsType.MY_EVENTS) {
        const date = new Date(message.dateStr);
        const title = createHtmlScheduleTitle(date);
        const body = createHtmlForEventList(message.events);
        const html = title + body;
        document.execCommand('insertHtml', false, html);
    }

    if (message.eventType === EventsType.MY_GROUP_EVENTS) {
        const date = new Date(message.dateStr);
        const title = createHtmlScheduleTitle(date);
        const body = createHtmlForMyGroupEventList(message.events, date);
        const html = title + body;
        document.execCommand('insertHtml', false, html);
    }

    if (message.eventType === EventsType.TEMPLATE) {
        const templateEvent: TemplateEvent = message.events;
        let templateText = message.templateText;

        if (templateEvent.todayEventInfoList.length !== 0) {
            const html = createHtmlForEventList(templateEvent.todayEventInfoList);
            const regex = new RegExp(escapeRegExp(SpecialTemplateCharactor.TODAY), 'g');
            templateText = templateText.replace(regex, html);
        }

        if (templateEvent.nextDayEventInfoList.length !== 0) {
            const html = createHtmlForEventList(templateEvent.nextDayEventInfoList);
            const regex = new RegExp(escapeRegExp(SpecialTemplateCharactor.NEXT_BUSINESS_DAY), 'g');
            templateText = templateText.replace(regex, html);
        }

        if (templateEvent.previousDayEventInfoList.length !== 0) {
            const html = createHtmlForEventList(templateEvent.previousDayEventInfoList);
            const regex = new RegExp(escapeRegExp(SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY), 'g');
            templateText = templateText.replace(regex, html);
        }
        document.execCommand('insertHTML', false, templateText);
    }
    document.body.style.cursor = 'auto';
});
