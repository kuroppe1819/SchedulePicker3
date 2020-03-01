import React, { useState } from 'react';
import { IndexMain, Props as IndexProps } from './indexmain';

export const IndexContainer: React.FC = () => {
    const [filterState, setFilterState] = useState({
        isIncludePrivateEvent: true,
        isIncludeAllDayEvent: true,
    });
    const [openAlert, setOpenAlert] = useState(false);

    const handleChangeSwitch = (name: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFilterState({ ...filterState, [name]: event.target.checked });
    };

    const handleSaveBtnClick = (): void => {
        setOpenAlert(true);
    };

    const handleCloseAlert = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const props: IndexProps = {
        isIncludePrivateEvent: filterState.isIncludePrivateEvent,
        isIncludeAllDayEvent: filterState.isIncludeAllDayEvent,
        openAlert: openAlert,
        handleChangeSwitch: handleChangeSwitch,
        handleSaveBtnClicked: handleSaveBtnClick,
        handleCloseAlert: handleCloseAlert,
    };

    return <IndexMain {...props} />;
};
