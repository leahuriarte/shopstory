// Local storage utilities for behavior tracking and data persistence
import type { StyleProfile, BehaviorEvent, ProductSet, ShoppingSession } from '../types'

const STORAGE_KEYS = {
  STYLE_PROFILE: 'shop-story-style-profile',
  BEHAVIOR_EVENTS: 'shop-story-behavior-events',
  PRODUCT_SETS: 'shop-story-product-sets',
  USER_PREFERENCES: 'shop-story-user-preferences',
  SHOPPING_SESSIONS: 'shop-story-shopping-sessions',
  LAST_SYNC: 'shop-story-last-sync'
} as const

const STORAGE_VERSION = '1.0.0'
const MAX_EVENTS_STORED = 1000
const MAX_SESSIONS_STORED = 50

export const saveStyleProfile = (profile: StyleProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STYLE_PROFILE, JSON.stringify(profile))
  } catch (error) {
    console.error('Failed to save style profile:', error)
  }
}

export const loadStyleProfile = (): StyleProfile | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STYLE_PROFILE)
    if (!stored) return null
    
    const profile = JSON.parse(stored)
    // Convert date strings back to Date objects
    profile.lastUpdated = new Date(profile.lastUpdated)
    return profile
  } catch (error) {
    console.error('Failed to load style profile:', error)
    return null
  }
}

export const saveBehaviorEvents = (events: BehaviorEvent[]): void => {
  try {
    const serializedEvents = events.map(event => ({
      ...event,
      timestamp: event.timestamp.toISOString()
    }))
    localStorage.setItem(STORAGE_KEYS.BEHAVIOR_EVENTS, JSON.stringify(serializedEvents))
  } catch (error) {
    console.error('Failed to save behavior events:', error)
  }
}

export const loadBehaviorEvents = (): BehaviorEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BEHAVIOR_EVENTS)
    if (!stored) return []
    
    const events = JSON.parse(stored)
    return events.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load behavior events:', error)
    return []
  }
}

export const saveProductSets = (sets: ProductSet[]): void => {
  try {
    const serializedSets = sets.map(set => ({
      ...set,
      createdAt: set.createdAt.toISOString(),
      expiresAt: set.expiresAt?.toISOString()
    }))
    localStorage.setItem(STORAGE_KEYS.PRODUCT_SETS, JSON.stringify(serializedSets))
  } catch (error) {
    console.error('Failed to save product sets:', error)
  }
}

export const loadProductSets = (): ProductSet[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_SETS)
    if (!stored) return []
    
    const sets = JSON.parse(stored)
    return sets.map((set: any) => ({
      ...set,
      createdAt: new Date(set.createdAt),
      expiresAt: set.expiresAt ? new Date(set.expiresAt) : undefined
    }))
  } catch (error) {
    console.error('Failed to load product sets:', error)
    return []
  }
}

/**
 * Save shopping session data
 */
export const saveShoppingSession = (session: ShoppingSession): void => {
  try {
    const sessions = loadShoppingSessions()
    const updatedSessions = [session, ...sessions.filter(s => s.sessionId !== session.sessionId)]
      .slice(0, MAX_SESSIONS_STORED)
    
    const serializedSessions = updatedSessions.map(s => ({
      ...s,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime?.toISOString(),
      events: s.events.map(event => ({
        ...event,
        timestamp: event.timestamp.toISOString()
      }))
    }))
    
    localStorage.setItem(STORAGE_KEYS.SHOPPING_SESSIONS, JSON.stringify(serializedSessions))
  } catch (error) {
    console.error('Failed to save shopping session:', error)
  }
}

/**
 * Load shopping session data
 */
export const loadShoppingSessions = (): ShoppingSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING_SESSIONS)
    if (!stored) return []
    
    const sessions = JSON.parse(stored)
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      events: session.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }))
    }))
  } catch (error) {
    console.error('Failed to load shopping sessions:', error)
    return []
  }
}

/**
 * Add behavior event with automatic cleanup
 */
export const addBehaviorEvent = (event: BehaviorEvent): void => {
  try {
    const events = loadBehaviorEvents()
    const updatedEvents = [event, ...events].slice(0, MAX_EVENTS_STORED)
    saveBehaviorEvents(updatedEvents)
  } catch (error) {
    console.error('Failed to add behavior event:', error)
  }
}

/**
 * Get behavior events within date range
 */
export const getBehaviorEventsByDateRange = (startDate: Date, endDate: Date): BehaviorEvent[] => {
  const events = loadBehaviorEvents()
  return events.filter(event => 
    event.timestamp >= startDate && event.timestamp <= endDate
  )
}

/**
 * Get behavior events by type
 */
export const getBehaviorEventsByType = (eventType: BehaviorEvent['eventType']): BehaviorEvent[] => {
  const events = loadBehaviorEvents()
  return events.filter(event => event.eventType === eventType)
}

/**
 * Save user preferences
 */
export const saveUserPreferences = (preferences: Record<string, any>): void => {
  try {
    const existing = loadUserPreferences()
    const updated = { ...existing, ...preferences, lastUpdated: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save user preferences:', error)
  }
}

/**
 * Load user preferences
 */
export const loadUserPreferences = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load user preferences:', error)
    return {}
  }
}

/**
 * Save last sync timestamp
 */
export const saveLastSyncTime = (timestamp: Date = new Date()): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toISOString())
  } catch (error) {
    console.error('Failed to save last sync time:', error)
  }
}

/**
 * Load last sync timestamp
 */
export const loadLastSyncTime = (): Date | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    return stored ? new Date(stored) : null
  } catch (error) {
    console.error('Failed to load last sync time:', error)
    return null
  }
}

/**
 * Check if data needs sync (older than 1 hour)
 */
export const needsSync = (): boolean => {
  const lastSync = loadLastSyncTime()
  if (!lastSync) return true
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  return lastSync < oneHourAgo
}

/**
 * Get storage usage statistics
 */
export const getStorageStats = () => {
  const stats = {
    styleProfile: 0,
    behaviorEvents: 0,
    productSets: 0,
    shoppingSessions: 0,
    userPreferences: 0,
    total: 0
  }
  
  try {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey)
      if (data) {
        const size = new Blob([data]).size
        const keyName = key.toLowerCase().replace('_', '') as keyof typeof stats
        if (keyName in stats) {
          stats[keyName] = size
        }
        stats.total += size
      }
    })
  } catch (error) {
    console.error('Failed to calculate storage stats:', error)
  }
  
  return stats
}

/**
 * Clean up old data to free storage space
 */
export const cleanupOldData = (daysToKeep: number = 30): void => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    
    // Clean old behavior events
    const events = loadBehaviorEvents()
    const recentEvents = events.filter(event => event.timestamp > cutoffDate)
    saveBehaviorEvents(recentEvents)
    
    // Clean old shopping sessions
    const sessions = loadShoppingSessions()
    const recentSessions = sessions.filter(session => session.startTime > cutoffDate)
    localStorage.setItem(STORAGE_KEYS.SHOPPING_SESSIONS, JSON.stringify(
      recentSessions.map(s => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime?.toISOString(),
        events: s.events.map(event => ({
          ...event,
          timestamp: event.timestamp.toISOString()
        }))
      }))
    ))
    
    // Clean expired product sets
    const productSets = loadProductSets()
    const validSets = productSets.filter(set => 
      !set.expiresAt || set.expiresAt > new Date()
    )
    saveProductSets(validSets)
    
    console.log(`Cleaned up data older than ${daysToKeep} days`)
  } catch (error) {
    console.error('Failed to cleanup old data:', error)
  }
}

/**
 * Export all user data for backup
 */
export const exportUserData = () => {
  try {
    const data = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      styleProfile: loadStyleProfile(),
      behaviorEvents: loadBehaviorEvents(),
      productSets: loadProductSets(),
      shoppingSessions: loadShoppingSessions(),
      userPreferences: loadUserPreferences()
    }
    
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('Failed to export user data:', error)
    return null
  }
}

/**
 * Import user data from backup
 */
export const importUserData = (dataString: string): boolean => {
  try {
    const data = JSON.parse(dataString)
    
    if (data.version !== STORAGE_VERSION) {
      console.warn('Data version mismatch, attempting migration')
    }
    
    if (data.styleProfile) {
      saveStyleProfile(data.styleProfile)
    }
    
    if (data.behaviorEvents && Array.isArray(data.behaviorEvents)) {
      saveBehaviorEvents(data.behaviorEvents)
    }
    
    if (data.productSets && Array.isArray(data.productSets)) {
      saveProductSets(data.productSets)
    }
    
    if (data.shoppingSessions && Array.isArray(data.shoppingSessions)) {
      // Save shopping sessions individually
      data.shoppingSessions.forEach((session: any) => {
        saveShoppingSession(session)
      })
    }
    
    if (data.userPreferences) {
      saveUserPreferences(data.userPreferences)
    }
    
    return true
  } catch (error) {
    console.error('Failed to import user data:', error)
    return false
  }
}

/**
 * Clear all stored data
 */
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('All Shop Story data cleared')
  } catch (error) {
    console.error('Failed to clear all data:', error)
  }
}

/**
 * Check if storage is available and working
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = 'shop-story-test'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get stored events for a specific user
 */
export const getStoredEvents = (userId: string): BehaviorEvent[] => {
  try {
    const events = loadBehaviorEvents()
    return events.filter(event => event.userId === userId)
  } catch (error) {
    console.error('Failed to get stored events for user:', error)
    return []
  }
}

/**
 * Store events for a specific user
 */
export const storeEvents = (userId: string, userEvents: BehaviorEvent[]): void => {
  try {
    const allEvents = loadBehaviorEvents()
    const otherUserEvents = allEvents.filter(event => event.userId !== userId)
    const updatedEvents = [...otherUserEvents, ...userEvents].slice(0, MAX_EVENTS_STORED)
    saveBehaviorEvents(updatedEvents)
  } catch (error) {
    console.error('Failed to store events for user:', error)
  }
}

/**
 * Get current session for a user
 */
export const getCurrentSession = (userId: string): ShoppingSession | null => {
  try {
    const sessions = loadShoppingSessions()
    return sessions.find(session => session.userId === userId && !session.endTime) || null
  } catch (error) {
    console.error('Failed to get current session:', error)
    return null
  }
}

/**
 * Update session for a user
 */
export const updateSession = (userId: string, session: ShoppingSession): void => {
  try {
    saveShoppingSession(session)
  } catch (error) {
    console.error('Failed to update session:', error)
  }
}