import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === "undefined") {
                return initialValue;
            }
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            if (value instanceof Function) {
                // If it's a functional update (prev => ...), we must wait for React to provide the true previous state
                setStoredValue((prevStoredValue) => {
                    const valueToStore = value(prevStoredValue);
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore));
                        window.dispatchEvent(new StorageEvent("storage", { key: key, newValue: JSON.stringify(valueToStore) }));
                    }
                    return valueToStore;
                });
            } else {
                // If it's a direct primitive/object replacement, write it synchronously immediately
                // so subsequent immediate reads (like routing navigation) see the fresh state
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(value));
                    window.dispatchEvent(new StorageEvent("storage", { key: key, newValue: JSON.stringify(value) }));
                }
                setStoredValue(value);
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                setStoredValue(JSON.parse(e.newValue));
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [key]);

    return [storedValue, setValue] as const;
}
