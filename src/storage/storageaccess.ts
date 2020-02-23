import { UserSetting, StorageKeys } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';

export class StorageAccess {
    public static getUserSetting(): Promise<UserSetting> {
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
    }

    public static setUserSetting(setting: UserSetting): Promise<void> {
        return new Promise(resolve =>
            chrome.storage.sync.set(
                {
                    dayId: setting.dayId,
                    selectedDate: setting.selectedDate,
                    isIncludePrivateEvent: setting.isIncludePrivateEvent,
                    isIncludeAllDayEvent: setting.isIncludeAllDayEvent,
                    templateText: setting.templateText,
                },
                () => resolve()
            )
        );
    }

    public static setDayId(dayId: ContextMenuDayId): Promise<void> {
        return new Promise(resolve => chrome.storage.sync.set({ dayId: dayId }, () => resolve()));
    }
}
