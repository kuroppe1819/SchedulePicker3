import { StorageItem, StorageKeys } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';

export interface UserSettingRepository {
    getStorageItem(): Promise<StorageItem>;
    setStorageItem(item: StorageItem): Promise<void>;
    setDayId(dayId: ContextMenuDayId): Promise<void>;
    setSelectedDateStr(selectedDateStr?: string): Promise<void>;
    getSelectedDateStr(): Promise<string | undefined>;
    setTemplateText(templateText?: string): Promise<void>;
    getTemplateText(): Promise<string | undefined>;
}

export class UserSettingRepositoryImpl implements UserSettingRepository {
    public getStorageItem(): Promise<StorageItem> {
        return new Promise(resolve =>
            chrome.storage.sync.get(
                [
                    StorageKeys.DAY_ID,
                    StorageKeys.SELECTED_DATE_STR,
                    StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                    StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                    StorageKeys.TEMPLATE_TEXT,
                ],
                items => {
                    return resolve({
                        dayId: items[StorageKeys.DAY_ID],
                        selectedDateStr: items[StorageKeys.SELECTED_DATE_STR],
                        isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT],
                        isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT],
                        templateText: items[StorageKeys.TEMPLATE_TEXT],
                    });
                }
            )
        );
    }

    public setStorageItem(item: StorageItem): Promise<void> {
        return new Promise(resolve => {
            chrome.storage.sync.set(
                {
                    dayId: item.dayId,
                    selectedDateStr: item.selectedDateStr,
                    isIncludePrivateEvent: item.isIncludePrivateEvent,
                    isIncludeAllDayEvent: item.isIncludeAllDayEvent,
                    templateText: item.templateText,
                },
                () => resolve()
            );
        });
    }

    public setDayId(dayId: ContextMenuDayId): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ dayId: dayId }, () => resolve()));
    }

    public setSelectedDateStr(selectedDateStr?: string): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ selectedDateStr: selectedDateStr }, () => resolve()));
    }

    public getSelectedDateStr(): Promise<string | undefined> {
        return new Promise(resolve =>
            chrome.storage.sync.get([StorageKeys.SELECTED_DATE_STR], items =>
                resolve(items[StorageKeys.SELECTED_DATE_STR])
            )
        );
    }

    public setTemplateText(templateText?: string): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ templateText: templateText }, () => resolve()));
    }

    public getTemplateText(): Promise<string | undefined> {
        return new Promise(resolve =>
            chrome.storage.sync.get([StorageKeys.TEMPLATE_TEXT], items => resolve(items[StorageKeys.TEMPLATE_TEXT]))
        );
    }
}
