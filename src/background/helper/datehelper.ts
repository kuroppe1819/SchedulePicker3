import { DateRange } from 'src/types/date';
import moment from 'moment';

export class DateHelper {
    public static makeDateRange(date: Date): DateRange {
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return { startDate: startDate, endDate: endDate };
    }

    public static assignBusinessDate(specificMoment: moment.Moment, publicHolidays: string[], increment: number): Date {
        const incremented = specificMoment.add(increment, 'days');
        const day = moment.weekdays(incremented.day());
        const incrementedDateStr = incremented.toDate().toLocaleDateString();
        if (day === 'Saturday' || day === 'Sunday' || publicHolidays.indexOf(incrementedDateStr) >= 0) {
            return this.assignBusinessDate(incremented, publicHolidays, increment);
        }
        return incremented.toDate();
    }
}
