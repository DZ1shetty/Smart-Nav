import { resolveNavigationQuery, updateSearchData } from '../data/searchEngine'

/**
 * Web Worker for background search query resolution and pathfinding calculations.
 * Runs in an isolated background CPU thread to preserve 120 FPS UI smoothness.
 */
self.onmessage = function (e) {
  const { id, type, query, currentFloor, dynamicData } = e.data

  if (type === 'UPDATE_DATA') {
    if (dynamicData) {
      updateSearchData(dynamicData)
    }
    self.postMessage({ id, type: 'DATA_UPDATED' })
    return
  }

  if (type === 'SEARCH_QUERY') {
    if (dynamicData) {
      updateSearchData(dynamicData)
    }
    const result = resolveNavigationQuery(query, { currentFloor })
    self.postMessage({
      id,
      type: 'SEARCH_RESULT',
      result,
    })
    return
  }
}
