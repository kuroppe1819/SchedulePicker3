import { ContextMenuDateId } from './contextmenu';

export type UserSetting = {
    dateId: ContextMenuDateId;
    selectedDate: string;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    templateText: string;
};

export enum StorageKeys {
    IS_INCLUDE_PRIVATE_EVENT = 'isIncludePrivateEvent',
    IS_INCLUDE_ALL_DAY_EVENT = 'isIncludeAllDayEvent',
    DATE = 'date',
    TEMPLATE_TEXT = 'templateText',
    DATE_TYPE = 'dateType', // 日付のタイプ
}
