import { ContextMenuActionId } from './contextmenu';
import { EventInfo, MyGroupEvent, TemplateEvent } from './event';

export const enum NoticeStateType {
    NOW_LOADING,
    FINISHED,
}

export type RecieveEventMessage = {
    actionId: ContextMenuActionId;
    events: EventInfo[] | MyGroupEvent[] | TemplateEvent;
    isPostMarkdown: boolean;
    templateText?: string;
    specificDateStr?: string;
    state?: NoticeStateType;
};
