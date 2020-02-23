import { UserSetting, StorageKeys } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { defaultMenuItems } from './helper/defaultcontextmenu';
import { StorageAccess } from '../storage/storageaccess';

chrome.runtime.onInstalled.addListener(async () => {
    const setDefaultValueToStrage = async (setting: UserSetting): Promise<void> =>
        await StorageAccess.setUserSetting({
            dayId: setting[StorageKeys.DAY_ID] || ContextMenuDayId.TODAY,
            selectedDate: setting[StorageKeys.SELECTED_DATE] || '',
            isIncludePrivateEvent: setting[StorageKeys.IS_INCLUDE_PRIVATE_EVENT] || true,
            isIncludeAllDayEvent: setting[StorageKeys.IS_INCLUDE_ALL_DAY_EVENT] || true,
            templateText:
                setting[StorageKeys.TEMPLATE_TEXT] ||
                `今日の予定を取得できるよ<br>{%TODAY%}<div><br><div>翌営業日の予定を取得できるよ<br>{%NEXT_BUSINESS_DAY%}</div><div><br></div><div>前営業日の予定を取得できるよ<br>{%PREVIOUS_BUSINESS_DAY%}</div></div>`,
        });

    const userSettng = await StorageAccess.getUserSetting();
    await setDefaultValueToStrage(userSettng);
    await ContextMenuHelper.addAll(defaultMenuItems);
});
