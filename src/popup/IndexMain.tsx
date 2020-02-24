import { Box, Tab, Tabs, TextField, Typography, FormControlLabel, Switch, Button, Snackbar } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import CalendarIcon from '@material-ui/icons/Today';
import React, { useState } from 'react';
import styled from 'styled-components';
import Alert from '@material-ui/lab/Alert';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

interface TabPanelProps {
    children: React.ReactNode;
    selectedTabIndex: number;
    index: number;
}

const TabPanel: React.FC<TabPanelProps> = props => {
    const { children, selectedTabIndex, index } = props;
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={selectedTabIndex !== index}
            aria-labelledby={`tab-panel-${index}`}
        >
            {selectedTabIndex === index && <Box padding={3}>{children}</Box>}
        </Typography>
    );
};

export const IndexMain: React.FC = () => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const [filterState, setFilterState] = useState({
        isIncludePrivateEvent: true,
        isIncludeAllDayEvent: true,
    });
    const [openAlert, setOpenAlert] = useState(false);

    const handleChangeTab = (event, tabIndex): void => setSelectedTabIndex(tabIndex);

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
        <PopupBox maxWidth="false" padding={0}>
            <Tabs
                value={selectedTabIndex}
                onChange={handleChangeTab}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="日付と設定を切り替えるタブ"
            >
                <Tab label="日付" icon={<CalendarIcon />} />
                <Tab label="設定" icon={<SettingsIcon />} />
            </Tabs>

            <TabPanel selectedTabIndex={selectedTabIndex} index={0}>
                <DayPicker />
            </TabPanel>

            <TabPanel selectedTabIndex={selectedTabIndex} index={1}>
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
            </TabPanel>
            <Snackbar open={openAlert} autoHideDuration={1500} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} variant="filled" severity="success">
                    設定を保存しました
                </Alert>
            </Snackbar>
        </PopupBox>
    );
};

const PopupBox = styled(Box)`
    min-width: 360px;
    height: 800px;
`;
