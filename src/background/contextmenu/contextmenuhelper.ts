import { ContextMenu } from 'src/types/contextmenu';

export class ContextMenuHelper {
    static add(menu: ContextMenu): Promise<void> {
        return new Promise((): void =>
            chrome.contextMenus.create(
                {
                    id: menu.id,
                    title: menu.title,
                    parentId: menu.parentId,
                    type: menu.type,
                    contexts: ['editable'],
                },
                () => Promise.resolve()
            )
        );
    }

    static addAll(menus: ContextMenu[]): void {
        menus.forEach(menu => ContextMenuHelper.add(menu));
    }

    static removeAll(): Promise<void> {
        return new Promise(() => chrome.contextMenus.removeAll(() => Promise.resolve()));
    }
}
