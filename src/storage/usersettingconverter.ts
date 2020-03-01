import { StorageItem, UserSetting } from 'src/types/storage';

export class UserSettingConverter {
    static convertToSpecifiedDate(specifiedDateStr: string | undefined): Date | undefined {
        return specifiedDateStr ? new Date(specifiedDateStr) : undefined;
    }

    static convertToSpecifiedDateStr(specifiedDate: Date | undefined): string | undefined {
        return specifiedDate ? specifiedDate.toJSON() : undefined;
    }

    static convertToUserSetting(item: StorageItem): UserSetting {
        const specifiedDate = this.convertToSpecifiedDate(item.specifiedDateStr);
        return {
            dayId: item.dayId,
            specifiedDate: specifiedDate,
            filterSetting: {
                isIncludePrivateEvent: item.isIncludePrivateEvent,
                isIncludeAllDayEvent: item.isIncludeAllDayEvent,
            },
            templateText: item.templateText,
        };
    }

    static convertToStorageItem(setting: UserSetting): StorageItem {
        const specifiedDateStr = this.convertToSpecifiedDateStr(setting.specifiedDate);
        return {
            dayId: setting.dayId,
            specifiedDateStr: specifiedDateStr,
            isIncludePrivateEvent: setting.filterSetting.isIncludePrivateEvent,
            isIncludeAllDayEvent: setting.filterSetting.isIncludeAllDayEvent,
            templateText: setting.templateText,
        };
    }
}
