import { ContextMenuDayId } from 'src/types/contextmenu';
import { UserSetting } from 'src/types/storage';
import { StorageAccess } from '../storage/storageaccess';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { defaultMenuItems } from './helper/defaultcontextmenu';

chrome.runtime.onInstalled.addListener(async () => {
    const setDefaultValueToStrage = async (setting: UserSetting): Promise<void> => {
        console.log(setting);
        await StorageAccess.setUserSetting({
            dayId: setting.dayId || ContextMenuDayId.TODAY,
            selectedDate: setting.selectedDate || '',
            isIncludePrivateEvent: setting.isIncludePrivateEvent || true,
            isIncludeAllDayEvent: setting.isIncludeAllDayEvent || true,
            templateText:
                setting.templateText ||
                `今日の予定を取得できるよ<br>{%TODAY%}<div><br><div>翌営業日の予定を取得できるよ<br>{%NEXT_BUSINESS_DAY%}</div><div><br></div><div>前営業日の予定を取得できるよ<br>{%PREVIOUS_BUSINESS_DAY%}</div></div>`,
        });
    };

    const userSettng = await StorageAccess.getUserSetting();
    await setDefaultValueToStrage(userSettng);
    await ContextMenuHelper.addAll(defaultMenuItems);
});
