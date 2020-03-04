import { StorageItem, StorageKeys, FilterSetting } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';

export interface UserSettingRepository {
    getStorageItem(): Promise<StorageItem>;
    setStorageItem(item: StorageItem): Promise<void>;
    setDayId(dayId: ContextMenuDayId): Promise<void>;
    setSpecifiedDateStr(specifiedDateStr?: string): Promise<void>;
    getSpecifiedDateStr(): Promise<string | undefined>;
    setTemplateText(templateText?: string): Promise<void>;
    getTemplateText(): Promise<string | undefined>;
    setFilterSetting(filterSetting: FilterSetting): Promise<void>;
    getFilterSetting(): Promise<FilterSetting>;
    setPostMarkdownFlag(isPostMarkdown: boolean): Promise<void>;
    getPostMarkdownFlag(): Promise<boolean>;
}

export class UserSettingRepositoryImpl implements UserSettingRepository {
    public getStorageItem(): Promise<StorageItem> {
        return new Promise(resolve =>
            chrome.storage.sync.get(
                [
                    StorageKeys.DAY_ID,
                    StorageKeys.SPECIFIED_DATE_STR,
                    StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                    StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                    StorageKeys.IS_POST_MARKDOWN,
                    StorageKeys.TEMPLATE_TEXT,
                ],
                items => {
                    return resolve({
                        dayId: items[StorageKeys.DAY_ID],
                        specifiedDateStr: items[StorageKeys.SPECIFIED_DATE_STR],
                        isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT],
                        isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT],
                        isPostMarkdown: items[StorageKeys.IS_POST_MARKDOWN],
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
                    specifiedDateStr: item.specifiedDateStr,
                    isIncludePrivateEvent: item.isIncludePrivateEvent,
                    isIncludeAllDayEvent: item.isIncludeAllDayEvent,
                    isPostMarkdown: item.isPostMarkdown,
                    templateText: item.templateText,
                },
                () => resolve()
            );
        });
    }

    public setDayId(dayId: ContextMenuDayId): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ dayId: dayId }, () => resolve()));
    }

    public setSpecifiedDateStr(specifiedDateStr?: string): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ specifiedDateStr: specifiedDateStr }, () => resolve()));
    }

    public getSpecifiedDateStr(): Promise<string | undefined> {
        return new Promise(resolve =>
            chrome.storage.sync.get([StorageKeys.SPECIFIED_DATE_STR], items =>
                resolve(items[StorageKeys.SPECIFIED_DATE_STR])
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

    public setFilterSetting(filterSetting: FilterSetting): Promise<void> {
        return new Promise(resolve =>
            chrome.storage.sync.set(
                {
                    isIncludePrivateEvent: filterSetting.isIncludePrivateEvent,
                    isIncludeAllDayEvent: filterSetting.isIncludeAllDayEvent,
                },
                () => resolve()
            )
        );
    }

    public getFilterSetting(): Promise<FilterSetting> {
        return new Promise(resolve =>
            chrome.storage.sync.get(
                [StorageKeys.IS_INCLUDE_PRIVATE_EVENT, StorageKeys.IS_INCLUDE_ALL_DAY_EVENT],
                items =>
                    resolve({
                        isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT],
                        isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT],
                    })
            )
        );
    }

    public setPostMarkdownFlag(isPostMarkdown: boolean): Promise<void> {
        return new Promise(resolve =>
            chrome.storage.sync.set(
                {
                    isPostMarkdown: isPostMarkdown,
                },
                () => resolve()
            )
        );
    }

    public getPostMarkdownFlag(): Promise<boolean> {
        return new Promise(resolve =>
            chrome.storage.sync.get([StorageKeys.IS_POST_MARKDOWN], items =>
                resolve(items[StorageKeys.IS_POST_MARKDOWN])
            )
        );
    }
}
