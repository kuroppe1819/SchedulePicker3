import React from 'react';
import { CircularProgress, Box } from '@material-ui/core';

export const LoadingBox: React.FC = () => {
    return (
        <Box m={1}>
            <CircularProgress size={16} />
        </Box>
    );
};
