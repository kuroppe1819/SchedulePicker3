export const enum ContextMenuRootId {
    DEFAULT = '',
}

export const enum ContextMenuParentId {
    ROOT = 'root',
    MYGROUPS = 'mygroups',
}

export const enum ContextMenuActionId {
    MYSELF = 'myself',
    MYGROUP = 'mygroup',
    MYGROUP_UPDATE = 'mygroup_update',
    TEMPLATE = 'template',
}

export const enum ContextMenuDateId {
    TODAY = 'today',
    NEXT_BUSINESS_DAY = 'next_business_day',
    PREVIOUS_BUSINESS_DAY = 'previous_business_day',
    SELECT_DAY = 'select_date',
}

export type ContextMenu = {
    id: string;
    title: string;
    parentId: ContextMenuRootId | ContextMenuParentId | ContextMenuActionId | ContextMenuDateId;
    type: string;
};
