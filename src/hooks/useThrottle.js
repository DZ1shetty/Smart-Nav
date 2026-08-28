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
  const lastRanRef = useRef(Date.now())
  const timeoutRef = useRef(null)
  const valueRef = useRef(value)

  valueRef.current = value

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastRanRef.current

    if (elapsed >= limit) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      lastRanRef.current = now
      setThrottledValue(valueRef.current)
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastRanRef.current = Date.now()
        setThrottledValue(valueRef.current)
        timeoutRef.current = null
      }, limit - elapsed)
    }
  }, [value, limit])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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
  const lastArgsRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttled = useCallback(
    (...args) => {
      const now = Date.now()
      const elapsed = now - lastRanRef.current
      lastArgsRef.current = args

      if (elapsed >= limit) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        lastRanRef.current = now
        callbackRef.current(...lastArgsRef.current)
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastRanRef.current = Date.now()
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current)
          }
          timeoutRef.current = null
        }, limit - elapsed)
      }
    },
    [limit]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttled
}

export default useThrottle
