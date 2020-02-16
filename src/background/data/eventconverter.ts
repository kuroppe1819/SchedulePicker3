import { EventInfo, MyGroupEvent, Participant } from '../../types/event';

export class EventConverter {
    static convertToMyGroupEvent(eventInfo: EventInfo, participants: Participant[]): MyGroupEvent {
        return {
            eventInfo: eventInfo,
            participants: participants,
        };
    }

    static convertToEventInfo(event: any): EventInfo {
        return {
            id: event.id,
            subject: event.subject,
            startTime: new Date(event.start.dateTime),
            endTime: 'end' in event ? new Date(event.end.dateTime) : null,
            eventType: event.eventType,
            eventMenu: event.eventMenu,
            attendees: event.attendees.map(attendee => {
                return { id: attendee.id, name: attendee.name };
            }),
            visibilityType: event.visibilityType,
            isAllDay: event.isAllDay,
            isStartOnly: event.isStartDay,
        };
    }
}
