import { ContextMenuDayId } from './contextmenu';

export type UserSetting = {
    dayId: ContextMenuDayId;
    selectedDate: string;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string;
};

export const enum StorageKeys {
    DAY_ID = 'day_id',
    SELECTED_DATE = 'selected_date',
    IS_INCLUDE_PRIVATE_EVENT = 'isIncludePrivateEvent',
    IS_INCLUDE_ALL_DAY_EVENT = 'isIncludeAllDayEvent',
    TEMPLATE_TEXT = 'templateText',
}
