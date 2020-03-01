export type EventInfo = {
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

export type Participant = {
    id: string;
    name: string;
};

export type MyGroupEvent = {
    eventInfo: EventInfo;
    participants: Participant[];
};

export type TemplateEvent = {
    specifiedDayEventInfoList: EventInfo[];
    nextDayEventInfoList: EventInfo[];
    previousDayEventInfoList: EventInfo[];
};

export type TemplateCharactorInText = {
    isIncludeToday: boolean;
    isIncludeNextDay: boolean;
    isIncludePreviousDay: boolean;
};

export const enum SpecialTemplateCharactor {
    SPECIFIED_DAY = '{%指定日%}',
    NEXT_BUSINESS_DAY = '{%翌営業日%}',
    PREVIOUS_BUSINESS_DAY = '{%前営業日%}',
}
