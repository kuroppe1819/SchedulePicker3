import React, { useState } from 'react';
import { FilterSetting } from 'src/types/storage';
import { UserSettingServiceImpl } from '../storage/usersettingservice';
import { IndexMain, Props as IndexProps } from './components/indexmain';

export type IndexContainerProps = {
    initFilterSetting: FilterSetting;
    initTemplateText: string;
};

export const IndexContainer: React.FC<IndexContainerProps> = (props: IndexContainerProps) => {
    const { initFilterSetting, initTemplateText } = props;
    const [filterSetting, setFilterSetting] = useState(initFilterSetting);
    const [templateText, setTemplateText] = useState(initTemplateText);
    const [openAlert, setOpenAlert] = useState(false);

    const handleChangeSwitch = (name: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFilterSetting({ ...filterSetting, [name]: event.target.checked });
    };

    const handleChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTemplateText(event.target.value);
    };

    const handleSaveBtnClick = async (): Promise<void> => {
        setOpenAlert(true);
        const userSetting = UserSettingServiceImpl.getInstance();
        await userSetting.setFilterSetting(filterSetting);
        await userSetting.setTemplateText(templateText);
    };

    const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const indexProps: IndexProps = {
        isIncludePrivateEvent: filterSetting.isIncludePrivateEvent,
        isIncludeAllDayEvent: filterSetting.isIncludeAllDayEvent,
        templateText: templateText,
        openAlert: openAlert,
        handleChangeSwitch: handleChangeSwitch,
        handleChangeText: handleChangeText,
        handleSaveBtnClicked: handleSaveBtnClick,
        handleCloseAlert: handleCloseAlert,
    };

    return <IndexMain {...indexProps} />;
};
