import React, { useState } from 'react';
import { IndexMain, Props as IndexProps } from './components/indexmain';
import { UserSettingServiceImpl } from '../storage/usersettingservice';

export type IndexContainerProps = {
    initSpecifiedDate: Date;
};

export const IndexContainer: React.FC<IndexContainerProps> = (props: IndexContainerProps) => {
    const { initSpecifiedDate } = props;
    const [selectedDate, setSelectedDate] = useState(initSpecifiedDate);
    const userSetting = UserSettingServiceImpl.getInstance();
    const handleDayClicked = (date: Date): void => {
        setSelectedDate(date);
        userSetting.setSpecifiedDate(date);
    };

    const indexProps: IndexProps = {
        selectedDate: selectedDate,
        handleDayClicked: handleDayClicked,
    };

    return <IndexMain {...indexProps} />;
};
