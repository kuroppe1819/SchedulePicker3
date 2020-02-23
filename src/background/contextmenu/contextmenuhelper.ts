import { ContextMenu, ContextMenuActionId, ContextMenuDayId } from 'src/types/contextmenu';

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

    public async addAll(menus: ContextMenu[]): Promise<void> {
        for (const menu of menus) {
            await this.add(menu);
        }
    }

    public removeAll(): Promise<void> {
        return new Promise(resolve => chrome.contextMenus.removeAll(() => resolve()));
    }

    public isContextMenuDayId = (menuId: ContextMenuActionId | ContextMenuDayId): boolean => {
        return (
            menuId === ContextMenuDayId.TODAY ||
            menuId === ContextMenuDayId.NEXT_BUSINESS_DAY ||
            menuId === ContextMenuDayId.PREVIOUS_BUSINESS_DAY ||
            menuId === ContextMenuDayId.SELECT_DAY
        );
    };
}
