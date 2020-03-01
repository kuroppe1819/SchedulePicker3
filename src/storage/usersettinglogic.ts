import { UserSetting, FilterSetting } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';
import { UserSettingRepository } from './usersettingrepository';
import { UserSettingConverter } from './usersettingconverter';

export interface UserSettingLogic {
    setUserSetting(setting: UserSetting): Promise<void>;
    getUserSetting(): Promise<UserSetting>;
    setDayId(dayId: ContextMenuDayId): Promise<void>;
    setSpecifiedDate(specifiedDate?: Date): Promise<void>;
    getSpecifiedDate(): Promise<Date | undefined>;
    setTemplateText(templateText?: string): Promise<void>;
    getTemplateText(): Promise<string>;
    setFilterSetting(filterSetting: FilterSetting): Promise<void>;
    getFilterSetting(): Promise<FilterSetting>;
}

export class UserSettingLogicImpl implements UserSettingLogic {
    private userSettingRepository: UserSettingRepository;

    constructor(userSettingRepository: UserSettingRepository) {
        this.userSettingRepository = userSettingRepository;
    }

    public async setUserSetting(setting: UserSetting): Promise<void> {
        const item = UserSettingConverter.convertToStorageItem(setting);
        await this.userSettingRepository.setStorageItem(item);
    }

    public async getUserSetting(): Promise<UserSetting> {
        const item = await this.userSettingRepository.getStorageItem();
        return UserSettingConverter.convertToUserSetting(item);
    }

    public async setDayId(dayId: ContextMenuDayId): Promise<void> {
        await this.userSettingRepository.setDayId(dayId);
    }

    public async setSpecifiedDate(specifiedDate?: Date | undefined): Promise<void> {
        const specifiedDateStr = UserSettingConverter.convertToSpecifiedDateStr(specifiedDate);
        await this.userSettingRepository.setSpecifiedDateStr(specifiedDateStr);
    }

    public async getSpecifiedDate(): Promise<Date | undefined> {
        const specifiedDateStr = await this.userSettingRepository.getSpecifiedDateStr();
        return UserSettingConverter.convertToSpecifiedDate(specifiedDateStr);
    }

    public async setTemplateText(templateText?: string | undefined): Promise<void> {
        await this.userSettingRepository.setTemplateText(templateText);
    }

    public async getTemplateText(): Promise<string> {
        return (await this.userSettingRepository.getTemplateText()) || '';
    }

    public async setFilterSetting(filterSetting: FilterSetting): Promise<void> {
        await this.userSettingRepository.setFilterSetting(filterSetting);
    }

    public async getFilterSetting(): Promise<FilterSetting> {
        return await this.userSettingRepository.getFilterSetting();
    }
}
