import dayjs from 'dayjs';

/**
 * Calculates the number of days remaining until a given date.
 * @param endDate - The target end date (ISO string)
 * @returns Number of days remaining (negative if past)
 */
export function getDaysRemaining(endDate: string): number {
  const end = dayjs(endDate).startOf('day');
  const today = dayjs().startOf('day');
  return end.diff(today, 'day');
}
