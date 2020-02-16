import {
    ContextMenuParentId,
    ContextMenuActionId,
    ContextMenuDateId,
    ContextMenuRootId,
} from 'src/background/contextmenu/defaultcontextmenu';

export type ContextMenu = {
    id: string;
    title: string;
    parentId: ContextMenuRootId | ContextMenuParentId | ContextMenuActionId | ContextMenuDateId;
    type: string;
};
