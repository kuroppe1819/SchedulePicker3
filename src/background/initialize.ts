import { UserSettingServiceImpl } from 'src/storage/usersettingservice';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { defaultMenuItems } from './helper/defaultcontextmenu';

chrome.runtime.onInstalled.addListener(async () => {
    await UserSettingServiceImpl.getInstance().initialDefaultValue();
    await ContextMenuHelper.addAll(defaultMenuItems);
});
