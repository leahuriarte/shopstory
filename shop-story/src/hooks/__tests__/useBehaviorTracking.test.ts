// Unit tests for useBehaviorTracking hook
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBehaviorTracking } from '../useBehaviorTracking'
import * as storage from '../../utils/storage'

// Mock the storage utilities
vi.mock('../../utils/storage', () => ({
  getStoredEvents: vi.fn(() => []),
  storeEvents: vi.fn(),
  getCurrentSession: vi.fn(() => null),
  updateSession: vi.fn()
}))

describe('useBehaviorTracking', () => {
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    
    // Reset mocks to return empty data by default
    vi.mocked(storage.getStoredEvents).mockReturnValue([])
    vi.mocked(storage.getCurrentSession).mockReturnValue(null)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    expect(result.current.events).toEqual([])
    expect(result.current.currentSession).toBeNull()
    expect(result.current.isTracking).toBe(false)
  })

  it('should load stored events on mount', () => {
    const mockEvents = [
      {
        id: 'event-1',
        userId: mockUserId,
        eventType: 'view' as const,
        timestamp: new Date(),
        sessionId: 'session-1',
        metadata: { source: 'browse' as const }
      }
    ]

    vi.mocked(storage.getStoredEvents).mockReturnValue(mockEvents)

    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    expect(result.current.events).toEqual(mockEvents)
    expect(storage.getStoredEvents).toHaveBeenCalledWith(mockUserId)
  })

  it('should start a new session', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    expect(result.current.isTracking).toBe(true)
    expect(result.current.currentSession).not.toBeNull()
    expect(result.current.currentSession?.userId).toBe(mockUserId)
    expect(storage.updateSession).toHaveBeenCalled()
  })

  it('should end current session', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.endSession()
    })

    expect(result.current.isTracking).toBe(false)
    expect(result.current.currentSession?.endTime).toBeDefined()
    expect(storage.updateSession).toHaveBeenCalledTimes(2) // Once for start, once for end
  })

  it('should track events when session is active', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.trackEvent('view', 'product-123', { source: 'story' })
    })

    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0]).toMatchObject({
      userId: mockUserId,
      eventType: 'view',
      productId: 'product-123',
      metadata: expect.objectContaining({
        source: 'story'
      })
    })
    expect(storage.storeEvents).toHaveBeenCalled()
  })

  it('should not track events when session is inactive', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.trackEvent('view', 'product-123')
    })

    expect(result.current.events).toHaveLength(0)
    expect(consoleSpy).toHaveBeenCalledWith('Cannot track event: no active session')
    
    consoleSpy.mockRestore()
  })

  it('should update session metrics when tracking events', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.trackEvent('view', 'product-1')
    })

    act(() => {
      result.current.trackEvent('purchase', 'product-1')
    })

    expect(result.current.currentSession?.itemsViewed).toBe(1)
    expect(result.current.currentSession?.itemsPurchased).toBe(1)
    expect(result.current.currentSession?.events).toHaveLength(2)
  })

  it('should clear events', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    act(() => {
      result.current.trackEvent('view', 'product-1')
    })

    expect(result.current.events).toHaveLength(1)

    act(() => {
      result.current.clearEvents()
    })

    expect(result.current.events).toHaveLength(0)
    expect(storage.storeEvents).toHaveBeenCalledWith(mockUserId, [])
  })

  it('should restore active session on mount', () => {
    const mockSession = {
      sessionId: 'session-123',
      userId: mockUserId,
      startTime: new Date(),
      events: [],
      insights: [],
      totalValue: 0,
      itemsViewed: 0,
      itemsPurchased: 0
      // No endTime - session is active
    }

    vi.mocked(storage.getCurrentSession).mockReturnValue(mockSession)

    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    expect(result.current.currentSession).toEqual(mockSession)
    expect(result.current.isTracking).toBe(true)
  })

  it('should not restore ended session on mount', () => {
    const mockSession = {
      sessionId: 'session-123',
      userId: mockUserId,
      startTime: new Date(),
      endTime: new Date(), // Session has ended
      events: [],
      insights: [],
      totalValue: 0,
      itemsViewed: 0,
      itemsPurchased: 0
    }

    vi.mocked(storage.getCurrentSession).mockReturnValue(mockSession)

    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    expect(result.current.currentSession).toBeNull()
    expect(result.current.isTracking).toBe(false)
  })

  it('should handle different event types correctly', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    const eventTypes: Array<'view' | 'add_to_cart' | 'purchase' | 'share' | 'save'> = [
      'view', 'add_to_cart', 'purchase', 'share', 'save'
    ]

    eventTypes.forEach((eventType, index) => {
      act(() => {
        result.current.trackEvent(eventType, `product-${index}`)
      })
    })

    expect(result.current.events).toHaveLength(5)
    expect(result.current.events.map(e => e.eventType)).toEqual(eventTypes)
  })

  it('should include metadata in tracked events', () => {
    const { result } = renderHook(() => useBehaviorTracking(mockUserId))

    act(() => {
      result.current.startSession()
    })

    const metadata = {
      source: 'recommendation' as const,
      duration: 5000,
      scrollDepth: 0.8,
      priceAtTime: 99.99
    }

    act(() => {
      result.current.trackEvent('view', 'product-123', metadata)
    })

    expect(result.current.events[0].metadata).toMatchObject(metadata)
    expect(result.current.events[0].metadata.sessionId).toBe(result.current.currentSession?.sessionId)
  })
})