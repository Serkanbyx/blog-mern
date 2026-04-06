import { useState, useCallback } from "react";

/**
 * Custom hook for reading/writing to localStorage with React state sync.
 * Falls back to initialValue if stored value is missing or corrupt.
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        console.warn(`Failed to save "${key}" to localStorage.`);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`Failed to remove "${key}" from localStorage.`);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
