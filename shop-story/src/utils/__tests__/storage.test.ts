// Unit tests for storage utilities
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveStyleProfile,
  loadStyleProfile,
  saveBehaviorEvents,
  loadBehaviorEvents,
  addBehaviorEvent,
  getBehaviorEventsByDateRange,
  getBehaviorEventsByType,
  saveShoppingSession,
  loadShoppingSessions,
  cleanupOldData,
  exportUserData,
  importUserData,
  isStorageAvailable,
  getStorageStats
} from '../storage'
import type { StyleProfile, BehaviorEvent, ShoppingSession } from '../../types'

describe('storage', () => {
  const mockStyleProfile: StyleProfile = {
    userId: 'user-123',
    dominantColors: [
      { color: '#FF0000', name: 'Red', frequency: 0.5, confidence: 0.8 }
    ],
    preferredBrands: [
      { brandName: 'TestBrand', affinity: 0.7, purchaseCount: 5, averageSpend: 50, lastPurchase: new Date(), categories: ['clothing'] }
    ],
    categoryPreferences: [
      { category: 'clothing', weight: 0.6, purchaseFrequency: 10, averageSpend: 45, trendDirection: 'increasing' }
    ],
    priceRanges: [
      { category: 'clothing', min: 20, max: 100, average: 50, currency: 'USD', frequency: 0.8 }
    ],
    seasonalTrends: [
      { season: 'summer', year: 2024, dominantColors: ['red'], topCategories: ['clothing'], spendingPattern: 200, styleEvolution: 0.1 }
    ],
    evolutionScore: 0.5,
    lastUpdated: new Date('2024-01-15T10:00:00Z')
  }

  const mockBehaviorEvent: BehaviorEvent = {
    id: 'event-1',
    userId: 'user-123',
    eventType: 'view',
    productId: 'product-1',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    sessionId: 'session-1',
    metadata: {
      source: 'browse',
      priceAtTime: 50.00,
      context: { category: 'clothing' }
    }
  }

  const mockShoppingSession: ShoppingSession = {
    sessionId: 'session-1',
    userId: 'user-123',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    events: [mockBehaviorEvent],
    insights: [],
    totalValue: 50,
    itemsViewed: 1,
    itemsPurchased: 0
  }

  beforeEach(() => {
    // Clear localStorage mock
    vi.clearAllMocks()
  })

  describe('StyleProfile storage', () => {
    it('should save and load style profile', () => {
      const mockGetItem = vi.fn()
      const mockSetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true
      })

      saveStyleProfile(mockStyleProfile)
      
      expect(mockSetItem).toHaveBeenCalledWith(
        'shop-story-style-profile',
        JSON.stringify(mockStyleProfile)
      )

      // Mock the return value for loading
      mockGetItem.mockReturnValue(JSON.stringify({
        ...mockStyleProfile,
        lastUpdated: mockStyleProfile.lastUpdated.toISOString()
      }))

      const loaded = loadStyleProfile()
      
      expect(mockGetItem).toHaveBeenCalledWith('shop-story-style-profile')
      expect(loaded).toBeTruthy()
      expect(loaded!.userId).toBe('user-123')
      expect(loaded!.lastUpdated).toBeInstanceOf(Date)
    })

    it('should return null when no profile exists', () => {
      const mockGetItem = vi.fn().mockReturnValue(null)
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const result = loadStyleProfile()
      expect(result).toBeNull()
    })

    it('should handle JSON parse errors gracefully', () => {
      const mockGetItem = vi.fn().mockReturnValue('invalid-json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const result = loadStyleProfile()
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('BehaviorEvent storage', () => {
    it('should save and load behavior events', () => {
      const mockGetItem = vi.fn()
      const mockSetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true
      })

      const events = [mockBehaviorEvent]
      saveBehaviorEvents(events)

      const expectedSerialized = events.map(event => ({
        ...event,
        timestamp: event.timestamp.toISOString()
      }))

      expect(mockSetItem).toHaveBeenCalledWith(
        'shop-story-behavior-events',
        JSON.stringify(expectedSerialized)
      )

      // Mock loading
      mockGetItem.mockReturnValue(JSON.stringify(expectedSerialized))
      
      const loaded = loadBehaviorEvents()
      
      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe('event-1')
      expect(loaded[0].timestamp).toBeInstanceOf(Date)
    })

    it('should add behavior event with automatic cleanup', () => {
      const mockGetItem = vi.fn().mockReturnValue('[]')
      const mockSetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true
      })

      addBehaviorEvent(mockBehaviorEvent)

      expect(mockSetItem).toHaveBeenCalled()
      const savedData = JSON.parse(mockSetItem.mock.calls[0][1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].id).toBe('event-1')
    })

    it('should filter events by date range', () => {
      const events = [
        { ...mockBehaviorEvent, id: 'event-1', timestamp: new Date('2024-01-10') },
        { ...mockBehaviorEvent, id: 'event-2', timestamp: new Date('2024-01-15') },
        { ...mockBehaviorEvent, id: 'event-3', timestamp: new Date('2024-01-20') }
      ]

      const mockGetItem = vi.fn().mockReturnValue(JSON.stringify(
        events.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))
      ))
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const filtered = getBehaviorEventsByDateRange(
        new Date('2024-01-12'),
        new Date('2024-01-18')
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('event-2')
    })

    it('should filter events by type', () => {
      const events = [
        { ...mockBehaviorEvent, id: 'event-1', eventType: 'view' as const },
        { ...mockBehaviorEvent, id: 'event-2', eventType: 'purchase' as const },
        { ...mockBehaviorEvent, id: 'event-3', eventType: 'view' as const }
      ]

      const mockGetItem = vi.fn().mockReturnValue(JSON.stringify(
        events.map(e => ({ ...e, timestamp: e.timestamp.toISOString() }))
      ))
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const viewEvents = getBehaviorEventsByType('view')
      const purchaseEvents = getBehaviorEventsByType('purchase')

      expect(viewEvents).toHaveLength(2)
      expect(purchaseEvents).toHaveLength(1)
    })
  })

  describe('ShoppingSession storage', () => {
    it('should save and load shopping sessions', () => {
      const mockGetItem = vi.fn().mockReturnValue('[]')
      const mockSetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true
      })

      saveShoppingSession(mockShoppingSession)

      expect(mockSetItem).toHaveBeenCalled()
      
      // Mock loading
      const serializedSession = {
        ...mockShoppingSession,
        startTime: mockShoppingSession.startTime.toISOString(),
        endTime: mockShoppingSession.endTime!.toISOString(),
        events: mockShoppingSession.events.map(e => ({
          ...e,
          timestamp: e.timestamp.toISOString()
        }))
      }
      
      mockGetItem.mockReturnValue(JSON.stringify([serializedSession]))
      
      const loaded = loadShoppingSessions()
      
      expect(loaded).toHaveLength(1)
      expect(loaded[0].sessionId).toBe('session-1')
      expect(loaded[0].startTime).toBeInstanceOf(Date)
      expect(loaded[0].endTime).toBeInstanceOf(Date)
    })
  })

  describe('Data management', () => {
    it('should cleanup old data', () => {
      const oldEvent = {
        ...mockBehaviorEvent,
        id: 'old-event',
        timestamp: new Date('2023-01-01')
      }
      const recentEvent = {
        ...mockBehaviorEvent,
        id: 'recent-event',
        timestamp: new Date()
      }

      const mockGetItem = vi.fn()
      const mockSetItem = vi.fn()
      
      // Mock behavior events
      mockGetItem.mockImplementation((key) => {
        if (key === 'shop-story-behavior-events') {
          return JSON.stringify([oldEvent, recentEvent].map(e => ({
            ...e,
            timestamp: e.timestamp.toISOString()
          })))
        }
        return '[]'
      })
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem },
        writable: true
      })

      cleanupOldData(30)

      expect(mockSetItem).toHaveBeenCalled()
      // Should only keep recent events
      const savedEvents = JSON.parse(mockSetItem.mock.calls[0][1])
      expect(savedEvents).toHaveLength(1)
      expect(savedEvents[0].id).toBe('recent-event')
    })

    it('should export user data', () => {
      const mockGetItem = vi.fn()
      
      mockGetItem.mockImplementation((key) => {
        switch (key) {
          case 'shop-story-style-profile':
            return JSON.stringify(mockStyleProfile)
          case 'shop-story-behavior-events':
            return JSON.stringify([mockBehaviorEvent])
          default:
            return null
        }
      })
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const exported = exportUserData()
      
      expect(exported).toBeTruthy()
      const data = JSON.parse(exported!)
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('exportDate')
      expect(data).toHaveProperty('styleProfile')
      expect(data).toHaveProperty('behaviorEvents')
    })

    it('should import user data', () => {
      const mockSetItem = vi.fn()
      const mockGetItem = vi.fn().mockReturnValue('{}')
      
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem, getItem: mockGetItem },
        writable: true
      })

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        styleProfile: mockStyleProfile,
        behaviorEvents: [mockBehaviorEvent]
      }

      const success = importUserData(JSON.stringify(exportData))
      
      expect(success).toBe(true)
      expect(mockSetItem).toHaveBeenCalled()
    })
  })

  describe('Storage availability', () => {
    it('should detect storage availability', () => {
      const mockSetItem = vi.fn()
      const mockRemoveItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem, removeItem: mockRemoveItem },
        writable: true
      })

      const available = isStorageAvailable()
      
      expect(available).toBe(true)
      expect(mockSetItem).toHaveBeenCalledWith('shop-story-test', 'test')
      expect(mockRemoveItem).toHaveBeenCalledWith('shop-story-test')
    })

    it('should handle storage unavailability', () => {
      const mockSetItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage not available')
      })
      
      Object.defineProperty(window, 'localStorage', {
        value: { setItem: mockSetItem },
        writable: true
      })

      const available = isStorageAvailable()
      
      expect(available).toBe(false)
    })
  })

  describe('Storage statistics', () => {
    it('should calculate storage statistics', () => {
      const mockGetItem = vi.fn()
      
      mockGetItem.mockImplementation((key) => {
        switch (key) {
          case 'shop-story-style-profile':
            return JSON.stringify(mockStyleProfile)
          case 'shop-story-behavior-events':
            return JSON.stringify([mockBehaviorEvent])
          default:
            return null
        }
      })
      
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true
      })

      const stats = getStorageStats()
      
      expect(stats).toHaveProperty('styleProfile')
      expect(stats).toHaveProperty('behaviorEvents')
      expect(stats).toHaveProperty('total')
      expect(stats.total).toBeGreaterThan(0)
    })
  })
})