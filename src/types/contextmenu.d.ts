import {
    ContextMenuParentId,
    ContextMenuActionId,
    ContextMenuDateId,
} from 'src/background/contextmenu/contextmenutype';

export type ContextMenu = {
    id: string;
    title: string;
    parentId: string;
    type: ContextMenuParentId | ContextMenuActionId | ContextMenuDateId;
};
