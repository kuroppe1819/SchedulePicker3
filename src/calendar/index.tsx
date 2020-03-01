import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { UserSettingServiceImpl } from '../storage/usersettingservice';
import { IndexContainer, IndexContainerProps } from './indexcontainer';

(async (): Promise<void> => {
    const userSetting = UserSettingServiceImpl.getInstance();
    const specifiedDate = (await userSetting.getSpecifiedDate()) || new Date();
    const indexContainerProps: IndexContainerProps = {
        initSpecifiedDate: specifiedDate,
    };
    ReactDOM.render(<IndexContainer {...indexContainerProps} />, document.getElementById('calendar-main'));
})();
