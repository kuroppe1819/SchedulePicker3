import { defaultMenuItems } from 'src/background/contextmenu/defaultcontextmenu';
import { ContextMenuHelper } from 'src/background/contextmenu/contextmenuhelper';
import { UserSetting, StorageKeys } from 'src/types/storage';
import { ContextMenuDateId } from 'src/types/contextmenu';

chrome.runtime.onInstalled.addListener(async () => {
    const getDefaultValueFromStorage = (): Promise<UserSetting> =>
        new Promise((): void =>
            chrome.storage.sync.get(
                [
                    StorageKeys.DATE_TYPE,
                    StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                    StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                    StorageKeys.TEMPLATE_TEXT,
                ],
                items => Promise.resolve(items)
            )
        );

    const setDefaultValueToStrage = (items: UserSetting): Promise<void> =>
        new Promise((): void =>
            chrome.storage.sync.set(
                {
                    dateType: items[StorageKeys.DATE] || ContextMenuDateId.TODAY,
                    isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT] || true,
                    isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT] || true,
                    templateText:
                        items[StorageKeys.TEMPLATE_TEXT] ||
                        `今日の予定を取得できるよ<br>{%TODAY%}<div><br><div>翌営業日の予定を取得できるよ<br>{%NEXT_BUSINESS_DAY%}</div><div><br></div><div>前営業日の予定を取得できるよ<br>{%PREVIOUS_BUSINESS_DAY%}</div></div>`,
                },
                () => Promise.resolve()
            )
        );
    const items = await getDefaultValueFromStorage();
    await setDefaultValueToStrage(items);
    ContextMenuHelper.addAll(defaultMenuItems);
});
