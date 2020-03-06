import moment from 'moment';
import { EventInfo, MyGroupEvent, Participant } from 'src/types/event';
import { pickEventMenuColor } from './eventmenucolor';

export interface GenerateHtml {
    constructScheduleTitle(specificDateStr: string | undefined): string;
    constructEvents(events: EventInfo[]): string;
    constructMyGroupEvents(events: MyGroupEvent[], specificDateStr?: string): string;
}

export class GenerateHtmlImpl implements GenerateHtml {
    private createScheduleTitle(moment: moment.Moment): string {
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

    private createTimeRange(eventInfo: EventInfo): string {
        const startTime = moment(eventInfo.startTime).format('HH:mm');
        if (eventInfo.isStartOnly || eventInfo.endTime == null) {
            return `<span>${startTime}</span>`;
        } else {
            const endTime = moment(eventInfo.endTime).format('HH:mm');
            return `<span>${startTime}-${endTime}</span>`;
        }
    }

    private createEventName(eventInfo: EventInfo): string {
        return `<a href="https://bozuman.cybozu.com/g/schedule/view.csp?event=${eventInfo.id}">${eventInfo.subject}</a>`;
    }

    private createEventParticipant(moment: moment.Moment, participants: Participant[]): string {
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

    private bundleEventMenuAndName(eventInfo: EventInfo): string {
        let body = '';
        if (eventInfo.eventMenu !== '') {
            body += ` ${this.createEventMenu(eventInfo.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
        }
        body += ` ${this.createEventName(eventInfo)}`; // スペース1つ分の余白を付けてデザインの微調整
        return body;
    }

    private constructAllDayEvent(eventInfo: EventInfo): string {
        let body = this.createEventMenu('終日');
        body += this.bundleEventMenuAndName(eventInfo);
        return `<div>${body}</div>`;
    }

    private constructRegularEvent(eventInfo: EventInfo): string {
        let body = this.createTimeRange(eventInfo);
        body += this.bundleEventMenuAndName(eventInfo);
        return `<div>${body}</div>`;
    }

    private constructRegularEventIncludeParticipant(
        eventInfo: EventInfo,
        dateStr?: string,
        participants: Participant[] = []
    ): string {
        let body = this.createTimeRange(eventInfo);
        body += this.bundleEventMenuAndName(eventInfo);

        if (participants.length !== 0 && dateStr !== undefined) {
            body += this.createEventParticipant(moment(dateStr), participants);
        }
        return `<div>${body}</div>`;
    }

    public constructEvents(eventInfoList: EventInfo[]): string {
        const regularAndRepeatingEvents: EventInfo[] = eventInfoList.filter(
            eventInfo => eventInfo.eventType === 'REGULAR' || eventInfo.eventType === 'REPEATING'
        );

        const body = regularAndRepeatingEvents
            .map(eventInfo => {
                if (eventInfo.isAllDay) {
                    return this.constructAllDayEvent(eventInfo);
                } else {
                    return this.constructRegularEvent(eventInfo);
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructMyGroupEvents(myGroupEventList: MyGroupEvent[], specificDateStr?: string): string {
        const regularAndRepeatingEvents: MyGroupEvent[] = myGroupEventList.filter(
            groupEvent => groupEvent.eventInfo.eventType === 'REGULAR' || groupEvent.eventInfo.eventType === 'REPEATING'
        );

        const body = regularAndRepeatingEvents
            .map(groupEvent => {
                if (groupEvent.eventInfo.isAllDay) {
                    return this.constructAllDayEvent(groupEvent.eventInfo);
                } else {
                    return this.constructRegularEventIncludeParticipant(
                        groupEvent.eventInfo,
                        specificDateStr,
                        groupEvent.participants
                    );
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructScheduleTitle(specificDateStr: string | undefined): string {
        if (specificDateStr) {
            return this.createScheduleTitle(moment(specificDateStr));
        }
        return '日付の取得に失敗しました';
    }
}
