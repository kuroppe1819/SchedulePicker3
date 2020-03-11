import { Typography, Box } from '@material-ui/core';
import React from 'react';

type TabPanelProps = {
    children: React.ReactNode;
    selectedTabIndex: number;
    index: number;
};

export const TabPanel: React.FC<TabPanelProps> = props => {
    const { children, selectedTabIndex, index } = props;
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={selectedTabIndex !== index}
            aria-labelledby={`tab-panel-${index}`}
        >
            {selectedTabIndex === index && <Box padding={2}>{children}</Box>}
        </Typography>
    );
};
