import moment from 'moment';
import { Event, MyGroupEvent, Participant, SpecialTemplateCharactor, TemplateEventsInfo } from 'src/types/event';
import { pickEventMenuColor } from './eventmenucolor';
import { GenerateEvents } from './generateevents';
import { replaceText } from './replacetext';

export class GenerateHtmlImpl implements GenerateEvents {
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

    private createTimeRange(event: Event): string {
        const startTime = moment(event.startTime).format('HH:mm');
        if (event.isStartOnly || event.endTime == null) {
            return `<span>${startTime}</span>`;
        } else {
            const endTime = moment(event.endTime).format('HH:mm');
            return `<span>${startTime}-${endTime}</span>`;
        }
    }

    private createEventName(event: Event): string {
        return `<a href="https://bozuman.cybozu.com/g/schedule/view.csp?event=${event.id}">${event.subject}</a>`;
    }

    private createEventParticipant(moment: moment.Moment, participants: Participant[]): string {
        const formattedDate = moment.format('YYYY-MM-DD');

        return `${participants
            .map(
                participant =>
                    `<a style="color: chocolate;" 
                        href="https://bozuman.cybozu.com/g/schedule/personal_day.csp?bdate=${formattedDate}&uid=${
                        participant.id
                    }"> (${participant.name.split(' ')[0]}) </a>`
            )
            .join('')}`;
    }

    private bundleEventMenuAndName(event: Event): string {
        let body = '';
        if (event.eventMenu !== '') {
            body += ` ${this.createEventMenu(event.eventMenu)}`; // スペース1つ分の余白を付けてデザインの微調整
        }
        body += ` ${this.createEventName(event)}`; // スペース1つ分の余白を付けてデザインの微調整
        return body;
    }

    private constructAllDayEvent(event: Event): string {
        let body = this.createEventMenu('終日');
        body += this.bundleEventMenuAndName(event);
        return `<div>${body}</div>`;
    }

    private constructLastForDaysEvent(event: Event): string {
        let body = this.createTimeRange(event);
        body += ` ${this.createEventMenu('日跨ぎ')}`;
        body += this.bundleEventMenuAndName(event);
        return `<div>${body}</div>`;
    }

    private constructRegularEvent(event: Event): string {
        let body = this.createTimeRange(event);
        body += this.bundleEventMenuAndName(event);
        return `<div>${body}</div>`;
    }

    private constructRegularEventIncludeParticipant(
        event: Event,
        dateStr?: string,
        participants: Participant[] = []
    ): string {
        let body = this.createTimeRange(event);
        body += this.bundleEventMenuAndName(event);

        if (participants.length !== 0 && dateStr !== undefined) {
            body += this.createEventParticipant(moment(dateStr), participants);
        }
        return `<div>${body}</div>`;
    }

    public constructEvents(eventList: Event[]): string {
        const regularAndRepeatingEvents: Event[] = eventList.filter(
            event => event.eventType === 'REGULAR' || event.eventType === 'REPEATING'
        );

        const body = regularAndRepeatingEvents
            .map(event => {
                if (event.isAllDay) {
                    return this.constructAllDayEvent(event);
                } else if (event.isLastForDays) {
                    return this.constructLastForDaysEvent(event);
                } else {
                    return this.constructRegularEvent(event);
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructMyGroupEvents(myGroupEventList: MyGroupEvent[], specificDateStr?: string): string {
        const regularAndRepeatingEvents: MyGroupEvent[] = myGroupEventList.filter(
            groupEvent => groupEvent.event.eventType === 'REGULAR' || groupEvent.event.eventType === 'REPEATING'
        );

        const body = regularAndRepeatingEvents
            .map(groupEvent => {
                if (groupEvent.event.isAllDay) {
                    return this.constructAllDayEvent(groupEvent.event);
                } else if (groupEvent.event.isLastForDays) {
                    return this.constructLastForDaysEvent(groupEvent.event);
                } else {
                    return this.constructRegularEventIncludeParticipant(
                        groupEvent.event,
                        specificDateStr,
                        groupEvent.participants
                    );
                }
            })
            .join('');
        return `${body}<div></div>`; // 挿入位置の下に文字列が入力されている時、入力されている文字列が予定の末尾にマージされてしまうので、div要素を無理矢理差し込んで改行する
    }

    public constructTemplateEvents(templateText: string, templateEventsInfo: TemplateEventsInfo): string {
        let templateHtml = templateText.replace(/\r?\n/g, '<br>');
        if (templateEventsInfo.todayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.todayStr);
            const body = this.constructEvents(templateEventsInfo.todayEvents);
            templateHtml = replaceText(templateHtml, `${SpecialTemplateCharactor.TODAY}<br>`, title + body);
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.TODAY, title + body);
        }

        if (templateEventsInfo.nextDayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.nextDayStr);
            const body = this.constructEvents(templateEventsInfo.nextDayEvents);
            templateHtml = replaceText(templateHtml, `${SpecialTemplateCharactor.NEXT_BUSINESS_DAY}<br>`, title + body);
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.NEXT_BUSINESS_DAY, title + body);
        }

        if (templateEventsInfo.previousDayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.previousDayStr);
            const body = this.constructEvents(templateEventsInfo.previousDayEvents);
            templateHtml = replaceText(
                templateHtml,
                `${SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY}<br>`,
                title + body
            );
            templateHtml = replaceText(templateHtml, SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY, title + body);
        }
        return templateHtml;
    }

    public constructScheduleTitle(specificDateStr: string | undefined): string {
        if (specificDateStr) {
            return this.createScheduleTitle(moment(specificDateStr));
        }
        return '日付の取得に失敗しました';
    }
}
