import { useState, useCallback, useEffect } from 'react'
import type { BehaviorEvent, BehaviorMetadata, ShoppingSession } from '../types/analytics'
import { createBehaviorEvent, generateId } from '../utils/analytics'
import { getStoredEvents, storeEvents, getCurrentSession, updateSession } from '../utils/storage'

export interface UseBehaviorTrackingReturn {
  trackEvent: (
    eventType: BehaviorEvent['eventType'],
    productId?: string,
    metadata?: Partial<BehaviorMetadata>
  ) => void
  events: BehaviorEvent[]
  currentSession: ShoppingSession | null
  isTracking: boolean
  startSession: () => void
  endSession: () => void
  clearEvents: () => void
}

export const useBehaviorTracking = (userId: string): UseBehaviorTrackingReturn => {
  const [events, setEvents] = useState<BehaviorEvent[]>([])
  const [currentSession, setCurrentSession] = useState<ShoppingSession | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  // Load stored events on mount
  useEffect(() => {
    const storedEvents = getStoredEvents(userId)
    setEvents(storedEvents)
    
    const session = getCurrentSession(userId)
    if (session && !session.endTime) {
      setCurrentSession(session)
      setIsTracking(true)
    }
  }, [userId])

  const startSession = useCallback(() => {
    const sessionId = generateId()
    const newSession: ShoppingSession = {
      sessionId,
      userId,
      startTime: new Date(),
      events: [],
      insights: [],
      totalValue: 0,
      itemsViewed: 0,
      itemsPurchased: 0
    }
    
    setCurrentSession(newSession)
    setIsTracking(true)
    updateSession(userId, newSession)
  }, [userId])

  const endSession = useCallback(() => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date()
      }
      setCurrentSession(endedSession)
      setIsTracking(false)
      updateSession(userId, endedSession)
    }
  }, [currentSession, userId])

  const trackEvent = useCallback((
    eventType: BehaviorEvent['eventType'],
    productId?: string,
    metadata: Partial<BehaviorMetadata> = {}
  ) => {
    if (!isTracking || !currentSession) {
      console.warn('Cannot track event: no active session')
      return
    }

    const event = createBehaviorEvent(userId, eventType, productId, {
      ...metadata,
      sessionId: currentSession.sessionId
    })

    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    storeEvents(userId, updatedEvents)

    // Update current session
    const updatedSession = {
      ...currentSession,
      events: [...currentSession.events, event],
      itemsViewed: eventType === 'view' ? currentSession.itemsViewed + 1 : currentSession.itemsViewed,
      itemsPurchased: eventType === 'purchase' ? currentSession.itemsPurchased + 1 : currentSession.itemsPurchased
    }
    
    setCurrentSession(updatedSession)
    updateSession(userId, updatedSession)
  }, [userId, events, currentSession, isTracking])

  const clearEvents = useCallback(() => {
    setEvents([])
    storeEvents(userId, [])
  }, [userId])

  return {
    trackEvent,
    events,
    currentSession,
    isTracking,
    startSession,
    endSession,
    clearEvents
  }
}