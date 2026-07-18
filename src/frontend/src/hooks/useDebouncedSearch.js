import { useEffect, useState } from 'react';

/**
 * Debounces a search input value and exposes whether the user is still typing.
 * @param {string} initialValue
 * @param {number} delay ms (default 400)
 */
export function useDebouncedSearch(initialValue = '', delay = 400) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (value === debouncedValue) {
      setIsDebouncing(false);
      return undefined;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, debouncedValue, delay]);

  return {
    value,
    setValue,
    debouncedValue,
    isDebouncing,
  };
}
