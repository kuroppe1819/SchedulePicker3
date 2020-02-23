import { UserSettingLogicImpl } from 'src/storage/usersettinglogic';
import { UserSettingRepositoryImpl } from 'src/storage/usersettingrepository';
import { UserSettingServiceImpl } from 'src/storage/usersettingservice';
import { ContextMenuHelper } from './helper/contextmenuhelper';
import { defaultMenuItems } from './helper/defaultcontextmenu';

chrome.runtime.onInstalled.addListener(async () => {
    const userSettingService = new UserSettingServiceImpl(new UserSettingLogicImpl(new UserSettingRepositoryImpl()));
    userSettingService.initialDefaultValue();
    await ContextMenuHelper.addAll(defaultMenuItems);
});
