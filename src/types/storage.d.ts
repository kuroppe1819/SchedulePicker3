import { ContextMenuDateId } from './contextmenu';

export type UserSetting = {
    dateId: ContextMenuDateId;
    selectedDate: string;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string;
};
