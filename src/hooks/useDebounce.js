import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook to debounce a value.
 * Delays updating the debounced value until after `delay` milliseconds
 * have elapsed since the last time the input value changed.
 *
 * @param {*} value The value to debounce.
 * @param {number} delay The delay in milliseconds (default: 300ms).
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

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

/**
 * Custom hook to debounce a callback function.
 *
 * @param {Function} callback The function to debounce.
 * @param {number} delay The delay in milliseconds (default: 300ms).
 * @returns {Function} The debounced function.
 */
export function useDebouncedCallback(callback, delay = 300) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args) => {
      const handler = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    },
    [delay]
  )
}

export default useDebounce
