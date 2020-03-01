import { ContextMenuDayId } from './contextmenu';

export type UserSetting = {
    dayId: ContextMenuDayId;
    specifiedDate: Date | undefined;
    filterSetting: FilterSetting;
    templateText: string | undefined;
};

export type StorageItem = {
    dayId: ContextMenuDayId;
    specifiedDateStr: string | undefined;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string | undefined;
};

export type FilterSetting = {
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
};

export const enum StorageKeys {
    DAY_ID = 'dayId',
    SPECIFIED_DATE_STR = 'specifiedDateStr',
    IS_INCLUDE_PRIVATE_EVENT = 'isIncludePrivateEvent',
    IS_INCLUDE_ALL_DAY_EVENT = 'isIncludeAllDayEvent',
    TEMPLATE_TEXT = 'templateText',
}
