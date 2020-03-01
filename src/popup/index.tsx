import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IndexContainer, IndexContainerProps } from './indexcontainer';
import { UserSettingServiceImpl } from '../storage/usersettingservice';

(async (): Promise<void> => {
    const userSetting = UserSettingServiceImpl.getInstance();
    const filterSetting = await userSetting.getFilterSetting();
    const templateText = await userSetting.getTemplateText();
    const indexContainerProps: IndexContainerProps = {
        initFilterSetting: filterSetting,
        initTemplateText: templateText,
    };
    ReactDOM.render(<IndexContainer {...indexContainerProps} />, document.getElementById('popup-main'));
})();
