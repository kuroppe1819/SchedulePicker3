import React from 'react';
import { CircularProgress, Box, ThemeProvider } from '@material-ui/core';
import { theme } from '../../theme/theme';

export const LoadingBox: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box p={1} bgcolor="primary.main">
                <CircularProgress size={16} color="secondary" />
            </Box>
        </ThemeProvider>
    );
};
