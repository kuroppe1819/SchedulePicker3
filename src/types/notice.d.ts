import { ContextMenuActionId } from './contextmenu';
import { EventInfo, MyGroupEvent } from './event';

export enum NoticeEventType {
    NOW_LOADING,
    FINISHED,
    ERROR,
}

export type RecieveEventMessage = {
    actionId: ContextMenuActionId;
    state: NoticeEventType;
    selectedDate: Date;
    events: EventInfo[] | MyGroupEvent[];
    templateText: string;
};
