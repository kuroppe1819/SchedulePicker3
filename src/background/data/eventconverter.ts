import { Event, MyGroupEvent, Participant } from '../../types/event';
import moment from 'moment';

export class EventConverter {
    static convertToMyGroupEvent(event: Event, participants: Participant[]): MyGroupEvent {
        return {
            event: event,
            participants: participants,
        };
    }

    static convertToEvent(eventObj: any, rangeStart: string, rangeEnd: string): Event {
        const startTime = moment(eventObj.start.dateTime);
        const event: Event = {
            id: eventObj.id,
            subject: eventObj.subject,
            startTime: startTime.toDate(),
            endTime: null,
            eventType: eventObj.eventType,
            eventMenu: eventObj.eventMenu,
            attendees: eventObj.attendees.map(attendee => {
                return { id: attendee.id, name: attendee.name };
            }),
            visibilityType: eventObj.visibilityType,
            isAllDay: eventObj.isAllDay,
            isStartOnly: eventObj.isStartOnly,
            isLastForDays: false,
        };

        if (event.isStartOnly) {
            return event;
        }

        const endTime = moment(eventObj.end.dateTime);
        const rangeStartDate = moment(rangeStart);
        const rangeEndDate = moment(rangeEnd);

        const isSameStartDay =
            startTime.year() === rangeStartDate.year() &&
            startTime.month() === rangeStartDate.month() &&
            startTime.day() === rangeStartDate.day();

        const isSameEndDay =
            endTime.year() === rangeEndDate.year() &&
            endTime.month() === rangeEndDate.month() &&
            endTime.day() === rangeEndDate.day();

        if (!isSameStartDay) {
            event.startTime = startTime
                .hours(0)
                .minute(0)
                .second(0)
                .toDate();
        }

        if (isSameEndDay) {
            event.endTime = endTime.toDate();
        } else {
            event.endTime = endTime
                .hours(23)
                .minute(59)
                .second(59)
                .toDate();
        }
        event.isLastForDays = !(isSameStartDay && isSameEndDay);
        return event;
    }
}
