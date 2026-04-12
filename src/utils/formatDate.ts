import dayjs from 'dayjs';

/**
 * Formats a date string into a human-readable format.
 * @param date - ISO date string or Date
 * @param format - dayjs format string (default: 'DD MMM YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format = 'DD MMM YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Formats a datetime string into a human-readable format.
 * @param datetime - ISO datetime string
 * @returns Formatted datetime string like "12 Apr 2026 02:30 PM"
 */
export function formatDateTime(datetime: string | Date): string {
  return dayjs(datetime).format('DD MMM YYYY hh:mm A');
}
