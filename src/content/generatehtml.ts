import { EventInfo, MyGroupEvent, Participant } from 'src/types/event';
import moment, { Moment } from 'moment';
import { pickEventMenuColor } from './eventmenucolor';

export interface GenerateHtml {
    constructHtmlScheduleTitle(specificDateStr: string | undefined): string;
    constructHtmlForEvents(events: EventInfo[]): string;
    constructHtmlForMyGroupEvents(events: MyGroupEvent[], specificDateStr?: string): string;
}

export class GenerateHtmlImpl implements GenerateHtml {
    private createHtmlScheduleTitle(moment: moment.Moment): string {
        return `<div>【 ${moment.format('YYYY-MM-DD')} の予定 】</div>`;
    }

    private createEventMenu(planName: string): string {
        const rgb = pickEventMenuColor(planName);
        return `<span 
                style="background-color: rgb(${rgb.R}, ${rgb.G}, ${rgb.B}); 
                display: inline-block; 
                margin-right: 3px; 
                padding: 2px 2px 1px; 
                color: rgb(255, 255, 255); 
                font-size: 11.628px; 
                border-radius: 2px; 
                line-height: 1.1;"
            >${planName}</span>`;
    }

    private createHtmlForTimeRange(eventInfo: EventInfo): string {
        const startTime = moment(eventInfo.startTime).format('HH:mm');
        if (eventInfo.isStartOnly || eventInfo.endTime == null) {
            return `<span>${startTime}</span>`;
        } else {
            const endTime = moment(eventInfo.endTime).format('HH:mm');
            return `<span>${startTime}-${endTime}</span>`;
        }
    }

    private createHtmlForEventName(eventInfo: EventInfo): string {
        return `<a href="https://bozuman.cybozu.com/g/schedule/view.csp?event=${eventInfo.id}">${eventInfo.subject}</a>`;
    }

    private createHtmlForEventParticipant(moment: moment.Moment, participants: Participant[]): string {
        const formattedDate = moment.format('YYYY-MM-DD');

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
    }

    private constructHtmlForAllDayEvent(eventInfo: EventInfo): string {
        let body = '';
        body += this.createEventMenu('終日');
        if (eventInfo.eventMenu !== '') {
            body += this.createEventMenu(eventInfo.eventMenu);
        }

        body += ` ${this.createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整
        return `<div>${body}</div>`;
    }

    private constructHtmlForRegularEvent(eventInfo: EventInfo): string {
        let body = '';
        body += this.createHtmlForTimeRange(eventInfo);

        if (eventInfo.eventMenu !== '') {
            body += ` ${this.createEventMenu(eventInfo.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
        }
        body += ` ${this.createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整

        return `<div>${body}</div>`;
    }

    private constructHtmlForRegularEventIncludeParticipant(
        eventInfo: EventInfo,
        dateStr?: string,
        participants: Participant[] = []
    ): string {
        let body = '';
        body += this.createHtmlForTimeRange(eventInfo);

        if (eventInfo.eventMenu !== '') {
            body += ` ${this.createEventMenu(eventInfo.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
        }
        body += ` ${this.createHtmlForEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整

        if (participants.length !== 0 && dateStr !== undefined) {
            body += this.createHtmlForEventParticipant(moment(dateStr), participants);
        }
        return `<div>${body}</div>`;
    }

    public constructHtmlForEvents(eventInfoList: EventInfo[]): string {
        const regularAndRepeatingEvents: EventInfo[] = eventInfoList.filter(
            eventInfo => eventInfo.eventType === 'REGULAR' || eventInfo.eventType === 'REPEATING'
        );

        let body = '';
        body += regularAndRepeatingEvents
            .map(eventInfo => {
                if (eventInfo.isAllDay) {
                    return this.constructHtmlForAllDayEvent(eventInfo);
                } else {
                    return this.constructHtmlForRegularEvent(eventInfo);
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructHtmlForMyGroupEvents(myGroupEventList: MyGroupEvent[], specificDateStr?: string): string {
        const regularAndRepeatingEvents: MyGroupEvent[] = myGroupEventList.filter(
            groupEvent => groupEvent.eventInfo.eventType === 'REGULAR' || groupEvent.eventInfo.eventType === 'REPEATING'
        );

        let body = '';
        body += regularAndRepeatingEvents
            .map(groupEvent => {
                if (groupEvent.eventInfo.isAllDay) {
                    return this.constructHtmlForAllDayEvent(groupEvent.eventInfo);
                } else {
                    return this.constructHtmlForRegularEventIncludeParticipant(
                        groupEvent.eventInfo,
                        specificDateStr,
                        groupEvent.participants
                    );
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructHtmlScheduleTitle(specificDateStr: string | undefined): string {
        if (specificDateStr) {
            return this.createHtmlScheduleTitle(moment(specificDateStr));
        }
        return '日付の取得に失敗しました';
    }
}
