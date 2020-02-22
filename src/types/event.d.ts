import { ContextMenuActionId, ContextMenuDateId } from './contextmenu';
import { NoticeEventType } from './notice';

export interface EventInfo {
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
}

export interface Participant {
    id: string;
    name: string;
}

export interface MyGroupEvent {
    eventInfo: EventInfo;
    participants: Participant[];
}

export interface TemplateEvent {
    todayEventInfoList: EventInfo[];
    nextDayEventInfoList: EventInfo[];
    previousDayEventInfoList: EventInfo[];
    includes: TemplateCharactorInText;
}

export interface EventMenuColor {
    r: number;
    g: number;
    b: number;
}

export type TemplateCharactorInText = {
    isIncludeToday: boolean;
    isIncludeNextDay: boolean;
    isIncludePreviousDay: boolean;
};

export enum SpecialTemplateCharactor {
    TODAY = '{%TODAY%}',
    NEXT_BUSINESS_DAY = '{%NEXT_BUSINESS_DAY%}',
    PREVIOUS_BUSINESS_DAY = '{%PREVIOUS_BUSINESS_DAY%}',
}
