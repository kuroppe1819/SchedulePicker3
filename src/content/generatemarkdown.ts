import moment from 'moment';
import { Event, Participant, MyGroupEvent, TemplateEventsInfo, SpecialTemplateCharactor } from 'src/types/event';
import { GenerateEvents } from './generateevents';
import { replaceText } from './replacetext';

export class GenerateMarkdownImpl implements GenerateEvents {
    private createScheduleTitle(moment: moment.Moment): string {
        return `【 ${moment.format('YYYY-MM-DD')} の予定 】`;
    }

    private createEventMenu(planName: string): string {
        return `[${planName}]`;
    }

    private createTimeRange(event: Event): string {
        const startTime = moment(event.startTime).format('HH:mm');
        if (event.isStartOnly || event.endTime == null) {
            return startTime.toString();
        } else {
            const endTime = moment(event.endTime).format('HH:mm');
            return `${startTime}-${endTime}`;
        }
    }

    private createEventName(event: Event): string {
        return `[${event.subject}](https://bozuman.cybozu.com/g/schedule/view.csp?event=${event.id})`;
    }

    private createEventParticipant(moment: moment.Moment, participants: Participant[]): string {
        const formattedDate = moment.format('YYYY-MM-DD');
        return `${participants
            .map(
                participant =>
                    ` ([${
                        participant.name.split(' ')[0]
                    }](https://bozuman.cybozu.com/g/schedule/personal_day.csp?bdate=${formattedDate}&uid=${
                        participant.id
                    }))`
            )
            .join('')}`;
    }

    private bundleEventMenuAndName(event: Event): string {
        let body = '';
        if (event.eventMenu !== '') {
            body += ` ${this.createEventMenu(event.eventMenu)}`;
        }
        body += ` ${this.createEventName(event)}`;
        return body;
    }

    private constructAllDayEvent(event: Event): string {
        let body = this.createEventMenu('終日');
        body += this.bundleEventMenuAndName(event);
        return body + '\n';
    }

    private constructLastForDaysEvent(event: Event): string {
        let body = this.createTimeRange(event);
        body += ` ${this.createEventMenu('日跨ぎ')}`;
        body += this.bundleEventMenuAndName(event);
        return body + '\n';
    }

    private constructRegularEvent(event: Event): string {
        let body = this.createTimeRange(event);
        body += this.bundleEventMenuAndName(event);
        return body + '\n';
    }

    private constructRegularEventIncludeParticipant(
        event: Event,
        dateStr?: string,
        participants: Participant[] = []
    ): string {
        let body = this.createTimeRange(event);
        body += this.bundleEventMenuAndName(event);

        if (participants.length !== 0 && dateStr !== undefined) {
            body += ` ${this.createEventParticipant(moment(dateStr), participants)}`;
        }
        return body + '\n';
    }

    public constructEvents(events: Event[]): string {
        const regularAndRepeatingEvents: Event[] = events.filter(
            event => event.eventType === 'REGULAR' || event.eventType === 'REPEATING'
        );

        return regularAndRepeatingEvents
            .map(event => {
                if (event.isAllDay) {
                    return this.constructAllDayEvent(event);
                } else if (event.isLastForDays) {
                    return this.constructLastForDaysEvent(event);
                } else {
                    return this.constructRegularEvent(event);
                }
            })
            .join('')
            .trim();
    }

    public constructMyGroupEvents(myGroupEventList: MyGroupEvent[], specificDateStr?: string): string {
        const regularAndRepeatingEvents: MyGroupEvent[] = myGroupEventList.filter(
            groupEvent => groupEvent.event.eventType === 'REGULAR' || groupEvent.event.eventType === 'REPEATING'
        );

        return regularAndRepeatingEvents
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
            .join('')
            .trim();
    }

    public constructTemplateEvents(templateText: string, templateEventsInfo: TemplateEventsInfo): string {
        if (templateEventsInfo.todayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.todayStr);
            const body = this.constructEvents(templateEventsInfo.todayEvents);
            templateText = replaceText(templateText, SpecialTemplateCharactor.TODAY, title + body);
        }

        if (templateEventsInfo.nextDayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.nextDayStr);
            const body = this.constructEvents(templateEventsInfo.nextDayEvents);
            templateText = replaceText(templateText, SpecialTemplateCharactor.NEXT_BUSINESS_DAY, title + body);
        }

        if (templateEventsInfo.previousDayEvents.length !== 0) {
            const title = this.constructScheduleTitle(templateEventsInfo.specifiedDate.previousDayStr);
            const body = this.constructEvents(templateEventsInfo.previousDayEvents);
            templateText = replaceText(templateText, SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY, title + body);
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
