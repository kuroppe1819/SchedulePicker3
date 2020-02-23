import { StorageItem, UserSetting } from 'src/types/storage';

export class UserSettingConverter {
    static convertToSelectedDate(selectedDateStr: string | undefined): Date | undefined {
        return selectedDateStr ? new Date(selectedDateStr) : undefined;
    }

    static convertToSelectedDateStr(selectedDate: Date | undefined): string | undefined {
        return selectedDate ? selectedDate.toJSON() : undefined;
    }

    static convertToUserSetting(item: StorageItem): UserSetting {
        const selectedDate = this.convertToSelectedDate(item.selectedDateStr);
        return {
            dayId: item.dayId,
            selectedDate: selectedDate,
            isIncludePrivateEvent: item.isIncludePrivateEvent,
            isIncludeAllDayEvent: item.isIncludeAllDayEvent,
            templateText: item.templateText,
        };
    }

    static convertToStorageItem(setting: UserSetting): StorageItem {
        const selectedDateStr = this.convertToSelectedDateStr(setting.selectedDate);
        return {
            dayId: setting.dayId,
            selectedDateStr: selectedDateStr,
            isIncludePrivateEvent: setting.isIncludePrivateEvent,
            isIncludeAllDayEvent: setting.isIncludeAllDayEvent,
            templateText: setting.templateText,
        };
    }
}
