import React, { useState } from 'react';
import { FilterSetting } from 'src/types/storage';
import { UserSettingServiceImpl } from '../storage/usersettingservice';
import { IndexMain, Props as IndexProps } from './components/indexmain';

export type IndexContainerProps = {
    initSpecifiedDate: Date;
    initFilterSetting: FilterSetting;
    initPostMarkdownFlag: boolean;
    initTemplateText: string;
};

export const IndexContainer: React.FC<IndexContainerProps> = (props: IndexContainerProps) => {
    const { initSpecifiedDate, initFilterSetting, initPostMarkdownFlag, initTemplateText } = props;
    const [filterSetting, setFilterSetting] = useState(initFilterSetting);
    const [templateText, setTemplateText] = useState(initTemplateText);
    const [isPostMarkdown, setPostMarkdownFlag] = useState(initPostMarkdownFlag);
    const [openAlert, setOpenAlert] = useState(false);
    const [selectedDate, setSelectedDate] = useState(initSpecifiedDate);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const userSetting = UserSettingServiceImpl.getInstance();

    const handleDayClicked = (date: Date): void => {
        setSelectedDate(date);
        userSetting.setSpecifiedDate(date);
    };

    const handleChangeFilterSettingSwitch = (name: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFilterSetting({ ...filterSetting, [name]: event.target.checked });
    };

    const handleChangePostMarkdownSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setPostMarkdownFlag(event.target.checked);
    };

    const handleChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTemplateText(event.target.value);
    };

    const handleSaveBtnClick = async (): Promise<void> => {
        setOpenAlert(true);
        await userSetting.setFilterSetting(filterSetting);
        await userSetting.setPostMarkdownFlag(isPostMarkdown);
        await userSetting.setTemplateText(templateText);
    };

    const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChangeTab = (event, tabIndex): void => setSelectedTabIndex(tabIndex);

    const indexProps: IndexProps = {
        selectedDate: selectedDate,
        isIncludePrivateEvent: filterSetting.isIncludePrivateEvent,
        isIncludeAllDayEvent: filterSetting.isIncludeAllDayEvent,
        isPostMarkdown: isPostMarkdown,
        templateText: templateText,
        openAlert: openAlert,
        selectedTabIndex: selectedTabIndex,
        handleDayClicked: handleDayClicked,
        handleChangeFilterSettingSwitch: handleChangeFilterSettingSwitch,
        handleChangePostMarkdownSwitch: handleChangePostMarkdownSwitch,
        handleChangeText: handleChangeText,
        handleSaveBtnClicked: handleSaveBtnClick,
        handleCloseAlert: handleCloseAlert,
        handleChangeTab: handleChangeTab,
    };

    return <IndexMain {...indexProps} />;
};
