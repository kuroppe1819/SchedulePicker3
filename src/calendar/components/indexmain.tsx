import React from 'react';
import DayPicker from 'react-day-picker';

import 'react-day-picker/lib/style.css';
import { Box } from '@material-ui/core';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS_SHORT = ['日', '月', '火', '水', '木', '金', '土'];

export type Props = {
    selectedDate: Date;
    handleDayClicked: (day: any) => void;
};

export const IndexMain: React.FC<Props> = (props: Props) => {
    const { selectedDate, handleDayClicked } = props;
    return (
        <Box p={2}>
            <DayPicker
                selectedDays={selectedDate}
                onDayClick={handleDayClicked}
                months={MONTHS}
                weekdaysShort={WEEKDAYS_SHORT}
            />
        </Box>
    );
};
