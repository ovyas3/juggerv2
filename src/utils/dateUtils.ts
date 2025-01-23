import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
// dayjs.extend(timezone);

/**
 * Converts a date to UTC and returns it as an ISO string
 * @param date - Date string or dayjs object
 * @param startOfDay - If true, sets the time to start of day (00:00:00)
 * @returns UTC ISO string
 */
export const toUTCString = (date: string | dayjs.Dayjs, startOfDay: boolean = true): string => {
    const utcDate = dayjs(date).utc();
    return startOfDay ? utcDate.startOf('day').toISOString() : utcDate.toISOString();
};

/**
 * Formats a date string to display format
 * @param date - Date string
 * @param format - Output format (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
    return dayjs(date).format(format);
};

/**
 * Gets the day name for a given date
 * @param date - Date string
 * @param format - Output format (default: 'ddd' for short day name)
 * @returns Day name
 */
export const getDayName = (date: string, format: string = 'ddd'): string => {
    return dayjs(date).format(format);
};

/**
 * Generates an array of dates starting from a given date
 * @param startDate - Starting date (default: today)
 * @param days - Number of days to generate
 * @param format - Output format (default: 'YYYY-MM-DD')
 * @returns Array of formatted date strings
 */
export const generateDateRange = (
    startDate: string | dayjs.Dayjs = dayjs(),
    days: number = 7,
    format: string = 'YYYY-MM-DD'
): string[] => {
    const dates: string[] = [];
    const start = dayjs(startDate);
    
    for (let i = 0; i < days; i++) {
        dates.push(start.add(i, 'day').format(format));
    }
    
    return dates;
};

export function convertToUTC(date: string | dayjs.Dayjs): string {
    return dayjs(date).utc().format();
}