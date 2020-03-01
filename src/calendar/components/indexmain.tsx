import React from 'react';
import DayPicker from 'react-day-picker';

import 'react-day-picker/lib/style.css';
import { Box } from '@material-ui/core';

export type Props = {
    selectedDate: Date;
    handleDayClicked: (day: any) => void;
};

export const IndexMain: React.FC<Props> = (props: Props) => {
    const { selectedDate, handleDayClicked } = props;
    return (
        <Box p={2}>
            <DayPicker selectedDays={selectedDate} onDayClick={handleDayClicked} />
        </Box>
    );
};
