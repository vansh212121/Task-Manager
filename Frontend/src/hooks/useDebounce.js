import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes before the delay is over
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // This effect re-runs only when the input value or delay changes

    return debouncedValue;
}