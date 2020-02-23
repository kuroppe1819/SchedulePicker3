import { ContextMenuDayId } from './contextmenu';

export type UserSetting = {
    dayId: ContextMenuDayId;
    selectedDate: Date | undefined;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string | undefined;
};

export type StorageItem = {
    dayId: ContextMenuDayId;
    selectedDateStr: string | undefined;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string | undefined;
};

export const enum StorageKeys {
    DAY_ID = 'dayId',
    SELECTED_DATE_STR = 'selectedDateStr',
    IS_INCLUDE_PRIVATE_EVENT = 'isIncludePrivateEvent',
    IS_INCLUDE_ALL_DAY_EVENT = 'isIncludeAllDayEvent',
    TEMPLATE_TEXT = 'templateText',
}
