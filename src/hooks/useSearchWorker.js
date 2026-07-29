import { useEffect, useRef, useCallback } from 'react'
import { resolveNavigationQuery, updateSearchData } from '../data/searchEngine'

/**
 * Custom hook to manage Web Worker background search & pathfinding calculations.
 * Provides Promise-based async functions with automatic fallback to main-thread execution.
 */
export function useSearchWorker() {
  const workerRef = useRef(null)
  const pendingRequestsRef = useRef(new Map())
  const reqIdCounter = useRef(0)

  useEffect(() => {
    try {
      // Vite Web Worker instantiation
      const worker = new Worker(
        new URL('../workers/searchRouteWorker.js', import.meta.url),
        { type: 'module' }
      )

      worker.onmessage = (e) => {
        const { id, result } = e.data
        if (id && pendingRequestsRef.current.has(id)) {
          const resolve = pendingRequestsRef.current.get(id)
          pendingRequestsRef.current.delete(id)
          resolve(result)
        }
      }

      worker.onerror = (err) => {
        console.warn('Search Web Worker error, using fallback:', err)
      }

      workerRef.current = worker
    } catch (err) {
      console.warn('Web Worker initialization skipped, using fallback:', err)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  /**
   * Resolves a navigation query asynchronously via Web Worker or fallback.
   *
   * @param {string} query The search input string.
   * @param {string} currentFloor The current active floor key.
   * @param {Object} [dynamicData] Optional dynamic Firestore layouts data.
   * @returns {Promise<Object>} Resolved navigation query result.
   */
  const resolveQueryAsync = useCallback((query, currentFloor, dynamicData) => {
    return new Promise((resolve) => {
      if (workerRef.current) {
        const id = `req_${++reqIdCounter.current}`
        pendingRequestsRef.current.set(id, resolve)
        workerRef.current.postMessage({
          id,
          type: 'SEARCH_QUERY',
          query,
          currentFloor,
          dynamicData,
        })
      } else {
        // Main thread fallback
        if (dynamicData) updateSearchData(dynamicData)
        const res = resolveNavigationQuery(query, { currentFloor })
        resolve(res)
      }
    })
  }, [])

  return { resolveQueryAsync }
}

export default useSearchWorker
