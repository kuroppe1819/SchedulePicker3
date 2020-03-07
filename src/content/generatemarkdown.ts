import moment from 'moment';
import { EventInfo, Participant, MyGroupEvent, TemplateEvent, SpecialTemplateCharactor } from 'src/types/event';
import { GenerateEvents } from './generateevents';
import { replaceText } from './replacetext';

export class GenerateMarkdownImpl implements GenerateEvents {
    private createScheduleTitle(moment: moment.Moment): string {
        return `【 ${moment.format('YYYY-MM-DD')} の予定 】`;
    }

    private createEventMenu(planName: string): string {
        return `[${planName}]`;
    }

    private createTimeRange(eventInfo: EventInfo): string {
        const startTime = moment(eventInfo.startTime).format('HH:mm');
        if (eventInfo.isStartOnly || eventInfo.endTime == null) {
            return startTime.toString();
        } else {
            const endTime = moment(eventInfo.endTime).format('HH:mm');
            return `${startTime}-${endTime}`;
        }
    }

    private createEventName(eventInfo: EventInfo): string {
        return `[${eventInfo.subject}](https://bozuman.cybozu.com/g/schedule/view.csp?event=${eventInfo.id})`;
    }

    private createEventParticipant(moment: moment.Moment, participants: Participant[]): string {
        const formattedDate = moment.format('YYYY-MM-DD');
        return `${participants
            .map(
                participant =>
                    `([${
                        participant.name.split(' ')[0]
                    }](https://bozuman.cybozu.com/g/schedule/personal_day.csp?bdate=${formattedDate}&uid=${
                        participant.id
                    }))`
            )
            .join('')}`;
    }

    private bundleEventMenuAndName(eventInfo: EventInfo): string {
        let body = '';
        if (eventInfo.eventMenu !== '') {
            body += ` ${this.createEventMenu(eventInfo.eventMenu)}`;
        }
        body += ` ${this.createEventName(eventInfo)}`;
        return body;
    }

    private constructAllDayEvent(eventInfo: EventInfo): string {
        let body = this.createEventMenu('終日');
        body += this.bundleEventMenuAndName(eventInfo);
        return body + '\n';
    }

    private constructRegularEvent(eventInfo: EventInfo): string {
        let body = this.createTimeRange(eventInfo);
        body += this.bundleEventMenuAndName(eventInfo);
        return body + '\n';
    }

    private constructRegularEventIncludeParticipant(
        eventInfo: EventInfo,
        dateStr?: string,
        participants: Participant[] = []
    ): string {
        let body = this.createTimeRange(eventInfo);
        body += this.bundleEventMenuAndName(eventInfo);

        if (participants.length !== 0 && dateStr !== undefined) {
            body += ` ${this.createEventParticipant(moment(dateStr), participants)}`;
        }
        return body + '\n';
    }

    public constructEvents(eventInfoList: EventInfo[]): string {
        const regularAndRepeatingEvents: EventInfo[] = eventInfoList.filter(
            eventInfo => eventInfo.eventType === 'REGULAR' || eventInfo.eventType === 'REPEATING'
        );

        return regularAndRepeatingEvents
            .map(eventInfo => {
                if (eventInfo.isAllDay) {
                    return this.constructAllDayEvent(eventInfo);
                } else {
                    return this.constructRegularEvent(eventInfo);
                }
            })
            .join('')
            .trim();
    }

    public constructMyGroupEvents(myGroupEventList: MyGroupEvent[], specificDateStr?: string): string {
        const regularAndRepeatingEvents: MyGroupEvent[] = myGroupEventList.filter(
            groupEvent => groupEvent.eventInfo.eventType === 'REGULAR' || groupEvent.eventInfo.eventType === 'REPEATING'
        );

        return regularAndRepeatingEvents
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
            .join('')
            .trim();
    }

    public constructTemplateEvents(templateText: string, templateEvent: TemplateEvent): string {
        if (templateEvent.todayEventInfoList.length !== 0) {
            const body = this.constructEvents(templateEvent.todayEventInfoList);
            templateText = replaceText(templateText, SpecialTemplateCharactor.TODAY, body);
        }

        if (templateEvent.nextDayEventInfoList.length !== 0) {
            const body = this.constructEvents(templateEvent.nextDayEventInfoList);
            templateText = replaceText(templateText, SpecialTemplateCharactor.NEXT_BUSINESS_DAY, body);
        }

        if (templateEvent.previousDayEventInfoList.length !== 0) {
            const body = this.constructEvents(templateEvent.previousDayEventInfoList);
            templateText = replaceText(templateText, SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY, body);
        }
        return templateText.trim();
    }

    public constructScheduleTitle(specificDateStr: string | undefined): string {
        if (specificDateStr) {
            return this.createScheduleTitle(moment(specificDateStr)) + '\n';
        }
        return '日付の取得に失敗しました';
    }
}
