import { UserSetting } from 'src/types/storage';
import { ContextMenuDayId } from 'src/types/contextmenu';
import { UserSettingRepository } from './usersettingrepository';
import { UserSettingConverter } from './usersettingconverter';

export interface UserSettingLogic {
    setUserSetting(setting: UserSetting): Promise<void>;
    getUserSetting(): Promise<UserSetting>;
    setDayId(dayId: ContextMenuDayId): Promise<void>;
    setSelectedDate(selectedDate?: Date): Promise<void>;
    getSelectedDate(): Promise<Date | undefined>;
    setTemplateText(templateText?: string): Promise<void>;
    getTemplateText(): Promise<string | undefined>;
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

    public async setSelectedDate(selectedDate?: Date | undefined): Promise<void> {
        const selectedDateStr = UserSettingConverter.convertToSelectedDateStr(selectedDate);
        await this.userSettingRepository.setSelectedDateStr(selectedDateStr);
    }

    public async getSelectedDate(): Promise<Date | undefined> {
        const selectedDateStr = await this.userSettingRepository.getSelectedDateStr();
        return UserSettingConverter.convertToSelectedDate(selectedDateStr);
    }

    public async setTemplateText(templateText?: string | undefined): Promise<void> {
        await this.userSettingRepository.setTemplateText(templateText);
    }

    public async getTemplateText(): Promise<string | undefined> {
        return await this.userSettingRepository.getTemplateText();
    }
}
