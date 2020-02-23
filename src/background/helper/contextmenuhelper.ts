import { ContextMenu, ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';

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

    public static async addAll(menus: ContextMenu[]): Promise<void> {
        for (const menu of menus) {
            await this.add(menu);
        }
    }

    public static removeAll(): Promise<void> {
        return new Promise(resolve => chrome.contextMenus.removeAll(() => resolve()));
    }

    public static isContextMenuDayId(menuId: ContextMenuActionId | ContextMenuDayId): boolean {
        return (
            menuId === ContextMenuDayId.TODAY ||
            menuId === ContextMenuDayId.NEXT_BUSINESS_DAY ||
            menuId === ContextMenuDayId.PREVIOUS_BUSINESS_DAY ||
            menuId === ContextMenuDayId.SELECT_DAY
        );
    }
}
