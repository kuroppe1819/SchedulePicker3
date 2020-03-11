import { ContextMenuParentId, ContextMenuActionId, ContextMenuDayId, ContextMenu } from 'src/types/contextmenu';

export const defaultMenuItems: ContextMenu[] = [
    {
        id: ContextMenuParentId.ROOT,
        title: 'SchedulePicker',
        type: 'normal',
    },
    {
        id: ContextMenuDayId.TODAY,
        title: '今日',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuDayId.NEXT_BUSINESS_DAY,
        title: '翌営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
        title: '前営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuDayId.SPECIFIED_DAY,
        title: '指定日',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.TEMPLATE,
        title: 'テンプレート',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYGROUP_UPDATE,
        title: 'MYグループの更新',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYSELF + ContextMenuDayId.TODAY,
        title: '自分の予定',
        parentId: ContextMenuDayId.TODAY,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYSELF + ContextMenuDayId.NEXT_BUSINESS_DAY,
        title: '自分の予定',
        parentId: ContextMenuDayId.NEXT_BUSINESS_DAY,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYSELF + ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
        title: '自分の予定',
        parentId: ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYSELF + ContextMenuDayId.SPECIFIED_DAY,
        title: '自分の予定',
        parentId: ContextMenuDayId.SPECIFIED_DAY,
        type: 'normal',
    },
];
