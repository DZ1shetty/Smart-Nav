import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook to throttle a value.
 * Updates the throttled value at most once per `limit` milliseconds.
 *
 * @param {*} value The value to throttle.
 * @param {number} limit The throttle interval in milliseconds (default: 30ms ~ 33fps).
 * @returns {*} The throttled value.
 */
export function useThrottle(value, limit = 30) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Custom hook to throttle a callback function.
 * Ensures the callback function is executed at most once per `limit` milliseconds.
 *
 * @param {Function} callback The function to throttle.
 * @param {number} limit The time limit in milliseconds (default: 16ms ~ 60fps).
 * @returns {Function} The throttled callback function.
 */
export function useThrottledCallback(callback, limit = 16) {
  const callbackRef = useRef(callback)
  const lastRanRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args) => {
      const now = Date.now()
      const elapsed = now - lastRanRef.current

      if (elapsed >= limit) {
        lastRanRef.current = now
        callbackRef.current(...args)
      } else {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          lastRanRef.current = Date.now()
          callbackRef.current(...args)
        }, limit - elapsed)
      }
    },
    [limit]
  )
}

export default useThrottle
