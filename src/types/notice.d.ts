import { ContextMenuActionId } from './contextmenu';
import { EventInfo, MyGroupEvent, TemplateEvent } from './event';

export enum NoticeStateType {
    NOW_LOADING,
    FINISHED,
}

export type RecieveEventMessage = {
    actionId: ContextMenuActionId;
    state?: NoticeStateType;
    selectedDate: Date;
    events: EventInfo[] | MyGroupEvent[] | TemplateEvent;
    templateText: string;
};
