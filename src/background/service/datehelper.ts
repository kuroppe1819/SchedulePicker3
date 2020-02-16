import { DateRange } from 'src/types/date';
import * as moment from 'moment';

export class DateHelper {
    private static getIncrementDay(specificDate: Date, increment: number): Date {
        return new Date(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate() + increment);
    }

    public static makeDateRange(date: Date): DateRange {
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return { startDate: startDate, endDate: endDate };
    }

    public static assignBusinessDate(specificDate: Date, publicHolidays: string[], increment: number): Date {
        const incrementDate = this.getIncrementDay(specificDate, increment);
        const day = moment.weekdays(incrementDate.getDay());
        const incrementDateStr = incrementDate.toLocaleDateString();
        if (day === 'Saturday' || day === 'Sunday' || publicHolidays.indexOf(incrementDateStr) >= 0) {
            return this.assignBusinessDate(incrementDate, publicHolidays, increment);
        }
        return incrementDate;
    }
}
