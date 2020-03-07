export type Participant = {
    id: string;
    name: string;
};

export type Event = {
    id: string;
    subject: string;
    startTime: Date;
    endTime: Date | null;
    eventType: string;
    eventMenu: string;
    visibilityType: string;
    attendees: Participant[];
    isAllDay: boolean;
    isStartOnly: boolean;
};

export type MyGroupEvent = {
    event: Event;
    participants: Participant[];
};

export type EventsInfo = {
    specifiedDateStr: string;
    events: Event[];
};

export type MyGroupEventsInfo = {
    specifiedDateStr: string;
    myGroupEvents: MyGroupEvent[];
};

export type TemplateEventsInfo = {
    specifiedDate: {
        todayStr: string;
        nextDayStr: string;
        previousDayStr: string;
    };
    todayEvents: Event[];
    nextDayEvents: Event[];
    previousDayEvents: Event[];
};

export type TemplateCharactorInText = {
    isIncludeToday: boolean;
    isIncludeNextDay: boolean;
    isIncludePreviousDay: boolean;
};

export const enum SpecialTemplateCharactor {
    TODAY = '{%今日%}',
    NEXT_BUSINESS_DAY = '{%翌営業日%}',
    PREVIOUS_BUSINESS_DAY = '{%前営業日%}',
}
