import { ContextMenuDayId } from 'src/types/contextmenu';
import { SpecialTemplateCharactor } from 'src/types/event';
import { FilterSetting, UserSetting } from 'src/types/storage';
import { UserSettingLogic, UserSettingLogicImpl } from './usersettinglogic';
import { UserSettingRepositoryImpl } from './usersettingrepository';

export interface UserSettingService {
    initialDefaultValue(): Promise<void>;
    setUserSetting(setting: UserSetting): Promise<void>;
    getUserSetting(): Promise<UserSetting>;
    setSpecifiedDate(specifiedDate?: Date): Promise<void>;
    getSpecifiedDate(): Promise<Date | undefined>;
    setTemplateText(templateText?: string): Promise<void>;
    getTemplateText(): Promise<string>;
    setFilterSetting(filterSetting: FilterSetting): Promise<void>;
    getFilterSetting(): Promise<FilterSetting>;
    setPostMarkdownFlag(isPostMarkdown: boolean): Promise<void>;
    getPostMarkdownFlag(): Promise<boolean>;
}

export class UserSettingServiceImpl implements UserSettingService {
    private static instance: UserSettingService;
    private userSettingLogic: UserSettingLogic;
    private static DEFAULT_TEMPLATE_TEXT =
        '↓今日の予定↓\n' +
        SpecialTemplateCharactor.TODAY +
        '\n\n' +
        '↓翌営業日の予定↓\n' +
        SpecialTemplateCharactor.NEXT_BUSINESS_DAY +
        '\n\n' +
        '↓前営業日の予定↓\n' +
        SpecialTemplateCharactor.PREVIOUS_BUSINESS_DAY;

    constructor(callFunc: Function, userSettingLogic: UserSettingLogic) {
        if (callFunc === UserSettingServiceImpl.getInstance) {
            this.userSettingLogic = userSettingLogic;
            return;
        } else if (UserSettingServiceImpl.instance) {
            throw new Error('instance already exists');
        } else {
            throw new Error('IllegalArgumentException: コンストラクタの引数が不正です');
        }
    }

    public static getInstance(): UserSettingService {
        if (!this.instance) {
            this.instance = new UserSettingServiceImpl(
                UserSettingServiceImpl.getInstance,
                new UserSettingLogicImpl(new UserSettingRepositoryImpl())
            );
        }
        return this.instance;
    }

    public async initialDefaultValue(): Promise<void> {
        const setting = await this.userSettingLogic.getUserSetting();
        await this.userSettingLogic.setUserSetting({
            specifiedDate: setting.specifiedDate || new Date(),
            filterSetting: {
                isIncludePrivateEvent: setting.filterSetting.isIncludePrivateEvent || true,
                isIncludeAllDayEvent: setting.filterSetting.isIncludeAllDayEvent || true,
            },
            isPostMarkdown: setting.isPostMarkdown || false,
            templateText: setting.templateText || UserSettingServiceImpl.DEFAULT_TEMPLATE_TEXT,
        });
    }

    public async setUserSetting(setting: UserSetting): Promise<void> {
        await this.userSettingLogic.setUserSetting(setting);
    }

    public async getUserSetting(): Promise<UserSetting> {
        return await this.userSettingLogic.getUserSetting();
    }

    public async setSpecifiedDate(specifiedDate?: Date | undefined): Promise<void> {
        await this.userSettingLogic.setSpecifiedDate(specifiedDate);
    }

    public async getSpecifiedDate(): Promise<Date | undefined> {
        return await this.userSettingLogic.getSpecifiedDate();
    }

    public async setTemplateText(templateText?: string | undefined): Promise<void> {
        await this.userSettingLogic.setTemplateText(templateText);
    }

    public async getTemplateText(): Promise<string> {
        return await this.userSettingLogic.getTemplateText();
    }

    public async setFilterSetting(filterSetting: FilterSetting): Promise<void> {
        await this.userSettingLogic.setFilterSetting(filterSetting);
    }

    public async getFilterSetting(): Promise<FilterSetting> {
        return await this.userSettingLogic.getFilterSetting();
    }

    public async setPostMarkdownFlag(isPostMarkdown: boolean): Promise<void> {
        await this.userSettingLogic.setPostMarkdownFlag(isPostMarkdown);
    }

    public async getPostMarkdownFlag(): Promise<boolean> {
        return this.userSettingLogic.getPostMarkdownFlag();
    }
}
