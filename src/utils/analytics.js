import { db } from '../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const ANALYTICS_COLLECTION = 'analytics_log'

export const trackSearch = async (query, resultCount) => {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      type: 'search',
      query: query.toLowerCase().trim(),
      resultCount: resultCount || 0,
      timestamp: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[Analytics] Failed to track search:', err)
  }
}

export const trackRoomView = async (roomId, roomName, floorKey, buildingName) => {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      type: 'roomView',
      roomId,
      roomName,
      floorKey,
      buildingName: buildingName || 'Unknown',
      timestamp: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[Analytics] Failed to track room view:', err)
  }
}

export const trackFloorVisit = async (floorKey, buildingName) => {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      type: 'floorVisit',
      floorKey,
      buildingName: buildingName || 'Unknown',
      timestamp: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[Analytics] Failed to track floor visit:', err)
  }
}

export const trackChatbotQuery = async (query) => {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      type: 'chatbot',
      query: query.toLowerCase().trim(),
      timestamp: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[Analytics] Failed to track chatbot query:', err)
  }
}

export const trackDirection = async (fromRoom, toRoom, floorKey) => {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      type: 'direction',
      fromRoom: fromRoom || '',
      toRoom: toRoom || '',
      floorKey: floorKey || '',
      timestamp: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[Analytics] Failed to track direction:', err)
  }
}
