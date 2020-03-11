import { Box, Tab, Tabs, ThemeProvider } from '@material-ui/core';
import { grey, blue } from '@material-ui/core/colors';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import SettingsIcon from '@material-ui/icons/Settings';
import React from 'react';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { Calendar } from './calendar';
import { Setting } from './setting';
import { TabPanel } from './tabpanel';

export type Props = {
    selectedDate: Date;
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    isPostMarkdown: boolean;
    templateText: string;
    openAlert: boolean;
    selectedTabIndex: number;
    handleDayClicked: (day: any) => void;
    handleChangeFilterSettingSwitch: (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangePostMarkdownSwitch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeText: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveBtnClicked: () => void;
    handleCloseAlert: (event?: React.SyntheticEvent, reason?: string) => void;
    handleChangeTab: (event, tabIndex) => void;
};

export const IndexMain: React.FC<Props> = (props: Props) => {
    const { selectedTabIndex, handleChangeTab } = props;
    return (
        <ThemeProvider theme={theme}>
            <PopupBox padding={0}>
                <CustomTabs
                    value={selectedTabIndex}
                    onChange={handleChangeTab}
                    variant="fullWidth"
                    style={{ backgroundColor: '${blue[500]}' }}
                    aria-label="日付と設定を切り替えるタブ"
                >
                    <Tab label="日付" icon={<CalendarIcon />} />
                    <Tab label="設定" icon={<SettingsIcon />} />
                </CustomTabs>

                <TabPanel selectedTabIndex={selectedTabIndex} index={0}>
                    <Calendar {...props}></Calendar>
                </TabPanel>

                <TabPanel selectedTabIndex={selectedTabIndex} index={1}>
                    <Setting {...props}></Setting>
                </TabPanel>
            </PopupBox>
        </ThemeProvider>
    );
};

const PopupBox = styled(Box)`
    min-width: 360px;
    background-color: ${grey[50]};
    &::-webkit-scrollbar {
        display: none;
    }
`;

const CustomTabs = styled(Tabs)`
    background-color: ${theme.palette.primary.main};
    color: ${grey[50]};
`;
