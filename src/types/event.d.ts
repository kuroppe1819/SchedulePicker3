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
    indexes: SpecialTemplateCharactorIndexs;
}

export interface EventMenuColor {
    r: number;
    g: number;
    b: number;
}

export interface SpecialTemplateCharactorIndexs {
    todayIndexes: number[];
    nextDayIndexes: number[];
    previousDayIndexes: number[];
}

export type StorageItems = {
    dateId: ContextMenuDateId;
    selectedDate: string;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string;
};
