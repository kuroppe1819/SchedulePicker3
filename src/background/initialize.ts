import { UserSetting, StorageKeys } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';
import { ContextMenuHelper } from './contextmenu/contextmenuhelper';
import { defaultMenuItems } from './contextmenu/defaultcontextmenu';

chrome.runtime.onInstalled.addListener(async () => {
    const getDefaultValueFromStorage = (): Promise<UserSetting> => {
        return new Promise(resolve =>
            chrome.storage.sync.get(
                [
                    StorageKeys.DAY_ID,
                    StorageKeys.SELECTED_DATE,
                    StorageKeys.IS_INCLUDE_ALL_DAY_EVENT,
                    StorageKeys.IS_INCLUDE_PRIVATE_EVENT,
                    StorageKeys.TEMPLATE_TEXT,
                ],
                items => {
                    return resolve({
                        dayId: items[StorageKeys.DAY_ID],
                        selectedDate: items[StorageKeys.SELECTED_DATE],
                        isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT],
                        isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT],
                        templateText: items[StorageKeys.TEMPLATE_TEXT],
                    });
                }
            )
        );
    };

    const setDefaultValueToStrage = (items: UserSetting): Promise<void> =>
        new Promise(resolve =>
            chrome.storage.sync.set(
                {
                    dayId: items[StorageKeys.DAY_ID] || ContextMenuDayId.TODAY,
                    selectedDate: items[StorageKeys.SELECTED_DATE] || '',
                    isIncludePrivateEvent: items[StorageKeys.IS_INCLUDE_PRIVATE_EVENT] || true,
                    isIncludeAllDayEvent: items[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT] || true,
                    templateText:
                        items[StorageKeys.TEMPLATE_TEXT] ||
                        `今日の予定を取得できるよ<br>{%TODAY%}<div><br><div>翌営業日の予定を取得できるよ<br>{%NEXT_BUSINESS_DAY%}</div><div><br></div><div>前営業日の予定を取得できるよ<br>{%PREVIOUS_BUSINESS_DAY%}</div></div>`,
                },
                () => resolve()
            )
        );
    const items = await getDefaultValueFromStorage();
    await setDefaultValueToStrage(items);
    await ContextMenuHelper.getInstance().addAll(defaultMenuItems);
});
