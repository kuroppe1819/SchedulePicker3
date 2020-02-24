import { Box, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import CalendarIcon from '@material-ui/icons/Today';
import React, { useState } from 'react';
import styled from 'styled-components';

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
    const handleChangeTab = (event, tabIndex): void => setSelectedTabIndex(tabIndex);

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
                <div>カレンダー実装予定</div>
            </TabPanel>

            <TabPanel selectedTabIndex={selectedTabIndex} index={1}>
                <TextField
                    className="template-multiline-text"
                    label="テンプレート"
                    multiline
                    rows="10"
                    defaultValue="Template Text"
                    variant="outlined"
                />
            </TabPanel>
        </PopupBox>
    );
};

const PopupBox = styled(Box)`
    min-width: 360px;
    height: 800px;
`;
