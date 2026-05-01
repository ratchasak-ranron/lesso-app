import { useEffect, useState } from 'react';

/**
 * Debounce a changing value. Returns the latest value after `delay` ms of
 * stability. Replaces inline `useState + useEffect + setTimeout` patterns
 * across the codebase (A2 review M8).
 */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
