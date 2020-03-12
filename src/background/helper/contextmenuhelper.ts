import { ContextMenu, ContextMenuDayId } from 'src/types/contextmenu';

export class ContextMenuHelper {
    public static add(menu: ContextMenu): Promise<void> {
        return new Promise(resolve =>
            chrome.contextMenus.create(
                {
                    id: menu.id,
                    title: menu.title,
                    parentId: 'parentId' in menu ? menu.parentId : null,
                    type: menu.type,
                    contexts: ['editable'],
                },
                () => resolve()
            )
        );
    }

    public static async refresh(menus: ContextMenu[]): Promise<void> {
        this.removeAll();
        for (const menu of menus) {
            await this.add(menu);
        }
    }

    private static removeAll(): Promise<void> {
        return new Promise(resolve => chrome.contextMenus.removeAll(() => resolve()));
    }

    public static removeSuffixOfId(menuItemId: string): string {
        menuItemId = menuItemId.replace(ContextMenuDayId.TODAY, '');
        menuItemId = menuItemId.replace(ContextMenuDayId.NEXT_BUSINESS_DAY, '');
        menuItemId = menuItemId.replace(ContextMenuDayId.PREVIOUS_BUSINESS_DAY, '');
        menuItemId = menuItemId.replace(ContextMenuDayId.SPECIFIED_DAY, '');
        return menuItemId;
    }
}
