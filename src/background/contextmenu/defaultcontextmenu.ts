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
        type: 'radio',
    },
    {
        id: ContextMenuDayId.NEXT_BUSINESS_DAY,
        title: '翌営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuDayId.PREVIOUS_BUSINESS_DAY,
        title: '前営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuDayId.SELECT_DAY,
        title: '指定日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuActionId.MYSELF,
        title: '自分',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuParentId.MYGROUPS,
        title: 'MYグループ',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.MYGROUP_UPDATE,
        title: '【 MYグループの更新 】',
        parentId: ContextMenuParentId.MYGROUPS,
        type: 'normal',
    },
    {
        id: ContextMenuActionId.TEMPLATE,
        title: 'テンプレート',
        parentId: ContextMenuParentId.ROOT,
        type: 'normal',
    },
];
