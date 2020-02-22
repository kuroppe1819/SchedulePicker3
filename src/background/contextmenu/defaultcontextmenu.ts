import {
    ContextMenuRootId,
    ContextMenuParentId,
    ContextMenuActionId,
    ContextMenuDateId,
    ContextMenu,
} from 'src/types/contextmenu';

export const defaultMenuItems: ContextMenu[] = [
    { id: ContextMenuParentId.ROOT, title: 'SchedulePicker', parentId: ContextMenuRootId.DEFAULT, type: 'normal' },
    {
        id: ContextMenuDateId.TODAY,
        title: '今日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuDateId.NEXT_BUSINESS_DAY,
        title: '翌営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuDateId.PREVIOUS_BUSINESS_DAY,
        title: '前営業日',
        parentId: ContextMenuParentId.ROOT,
        type: 'radio',
    },
    {
        id: ContextMenuDateId.SELECT_DAY,
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
