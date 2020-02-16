import { ContextMenu, ContextMenuActionId, ContextMenuDateId } from 'src/types/contextmenu';

export class ContextMenuHelper {
    public static add(menu: ContextMenu): Promise<void> {
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

    public static addAll(menus: ContextMenu[]): void {
        menus.forEach(menu => ContextMenuHelper.add(menu));
    }

    public static removeAll(): Promise<void> {
        return new Promise(() => chrome.contextMenus.removeAll(() => Promise.resolve()));
    }

    public static isContextMenuDateId = (menuId: ContextMenuActionId | ContextMenuDateId): boolean => {
        return (
            menuId === ContextMenuDateId.TODAY ||
            menuId === ContextMenuDateId.NEXT_BUSINESS_DAY ||
            menuId === ContextMenuDateId.PREVIOUS_BUSINESS_DAY ||
            menuId === ContextMenuDateId.SELECT_DAY
        );
    };
}
