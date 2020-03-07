import { ContextMenuActionId } from './contextmenu';
import { EventsInfo, MyGroupEventsInfo, TemplateEventsInfo } from './event';

export const enum NoticeStateType {
    NOW_LOADING,
    FINISHED,
}

export type RecieveStateMessage = {
    state: NoticeStateType;
};

export type RecieveEventMessage = {
    actionId: ContextMenuActionId;
    eventsInfo: EventsInfo | MyGroupEventsInfo | TemplateEventsInfo;
    userSetting: {
        isPostMarkdown: boolean;
        templateText?: string;
    };
};
