import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDaysRemaining } from './getDaysRemaining';
import dayjs from 'dayjs';

describe('getDaysRemaining', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns positive days when end date is in the future', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01'));
    expect(getDaysRemaining('2026-04-08')).toBe(7);
  });

  it('returns 0 when end date is today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-12'));
    expect(getDaysRemaining('2026-04-12')).toBe(0);
  });

  it('returns negative days when end date has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15'));
    expect(getDaysRemaining('2026-04-12')).toBe(-3);
  });

  it('handles month boundary correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30'));
    expect(getDaysRemaining('2026-02-02')).toBe(3);
  });

  it('works with the current real date', () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    expect(getDaysRemaining(tomorrow)).toBe(1);
  });
});
