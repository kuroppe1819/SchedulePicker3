import { ContextMenu } from 'src/types/contextmenu';

export class ContextMenuHelper {
    static addMenu(menu: ContextMenu): void {
        chrome.contextMenus.create({
            id: menu.id,
            title: menu.title,
            parentId: menu.parentId,
            type: menu.type,
            contexts: ['editable'],
        });
    }
}
