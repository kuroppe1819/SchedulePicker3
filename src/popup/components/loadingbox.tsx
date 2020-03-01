import React from 'react';
import { CircularProgress, Box } from '@material-ui/core';

export const LoadingBox: React.FC = () => {
    return (
        <Box p={1} bgcolor="primary.main">
            <CircularProgress size={16} color="secondary" />
        </Box>
    );
};
