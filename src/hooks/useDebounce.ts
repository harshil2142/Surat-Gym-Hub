import { useEffect, useState } from 'react';

/**
 * Custom hook that debounces a value by the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 400)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 400);
 *
 * useEffect(() => {
 *   // API call with debouncedSearch
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
