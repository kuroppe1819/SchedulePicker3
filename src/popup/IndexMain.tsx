import { Button, FormControlLabel, Snackbar, Switch, TextField, Container } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';

export const IndexMain: React.FC = () => {
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

    return (
        <PopupContainer maxWidth="false" padding={0}>
            <FormControlLabel
                control={
                    <Switch
                        checked={filterState.isIncludePrivateEvent}
                        onChange={handleChangeSwitch('isIncludePrivateEvent')}
                        value="PrivateEventFilter"
                        color="primary"
                    />
                }
                labelPlacement="end"
                label="非公開予定を含む"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={filterState.isIncludeAllDayEvent}
                        onChange={handleChangeSwitch('isIncludeAllDayEvent')}
                        value="AllDayEventFilter"
                        color="primary"
                    />
                }
                labelPlacement="end"
                label="終日予定を含む"
            />
            <TextField
                className="template-multiline-text"
                label="テンプレート"
                multiline
                rows="10"
                defaultValue="Template Text"
                variant="outlined"
            />
            <Button onClick={handleSaveBtnClick} variant="contained" color="primary" disableElevation>
                設定を保存する
            </Button>
            <Snackbar open={openAlert} autoHideDuration={1500} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} variant="filled" severity="success">
                    設定を保存しました
                </Alert>
            </Snackbar>
        </PopupContainer>
    );
};

const PopupContainer = styled(Container)`
    min-width: 360px;
    height: 800px;
`;
