import { useEffect, useState } from 'react'

/**
 * useDebounce Hook
 * 
 * Debounces a value by delaying updates until after a specified delay.
 * Useful for search inputs, filters, and other real-time user input scenarios.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   // This will only run 300ms after the user stops typing
 *   if (debouncedSearch) {
 *     fetchSearchResults(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
