import { ContextMenu, ContextMenuActionId, ContextMenuDateId } from 'src/types/contextmenu';

export class ContextMenuHelper {
    private static instance: ContextMenuHelper;

    constructor(callFunc: Function) {
        if (callFunc === ContextMenuHelper.getInstance) {
            return;
        } else {
            throw new Error('instance already exists');
        }
    }

    public static getInstance(): ContextMenuHelper {
        if (!this.instance) {
            this.instance = new ContextMenuHelper(ContextMenuHelper.getInstance);
        }
        return this.instance;
    }

    public add(menu: ContextMenu): Promise<void> {
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

    public addAll(menus: ContextMenu[]): void {
        menus.forEach(menu => this.add(menu));
    }

    public removeAll(): Promise<void> {
        return new Promise(() => chrome.contextMenus.removeAll(() => Promise.resolve()));
    }

    public isContextMenuDateId = (menuId: ContextMenuActionId | ContextMenuDateId): boolean => {
        return (
            menuId === ContextMenuDateId.TODAY ||
            menuId === ContextMenuDateId.NEXT_BUSINESS_DAY ||
            menuId === ContextMenuDateId.PREVIOUS_BUSINESS_DAY ||
            menuId === ContextMenuDateId.SELECT_DAY
        );
    };
}
