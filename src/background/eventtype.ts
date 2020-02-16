export enum DateType {
    TODAY,
    NEXT_BUSINESS_DAY,
    PREVIOUS_BUSINESS_DAY,
    SELECT_DAY,
}

export enum EventsType {
    MY_EVENTS,
    MY_GROUP_EVENTS,
    TEMPLATE,
    NOW_LOADING,
    ERROR,
}

export enum StorageKeys {
    IS_INCLUDE_PRIVATE_EVENT = 'isIncludePrivateEvent',
    IS_INCLUDE_ALL_DAY_EVENT = 'isIncludeAllDayEvent',
    DATE = 'date',
    TEMPLATE_TEXT = 'templateText',
    DATE_TYPE = 'dateType', // 日付のタイプ
}

export enum SpecialTemplateCharactor {
    TODAY = '{%TODAY%}',
    NEXT_BUSINESS_DAY = '{%NEXT_BUSINESS_DAY%}',
    PREVIOUS_BUSINESS_DAY = '{%PREVIOUS_BUSINESS_DAY%}',
}
