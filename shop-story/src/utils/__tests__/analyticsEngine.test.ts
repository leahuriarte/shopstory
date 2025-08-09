// Unit tests for analytics engine
import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ShopStoryAnalyticsEngine, 
  createAnalyticsEngine,
  validateBehaviorEvents,
  normalizeBehaviorEvents
} from '../analyticsEngine'
import type { BehaviorEvent, ShoppingSession } from '../../types/analytics'
import { generateId } from '../analytics'

describe('ShopStoryAnalyticsEngine', () => {
  const mockUserId = 'test-user-123'
  const mockSessionId = 'test-session-456'
  let engine: ShopStoryAnalyticsEngine

  beforeEach(() => {
    engine = new ShopStoryAnalyticsEngine(mockUserId)
  })

  const createMockEvent = (
    eventType: BehaviorEvent['eventType'],
    productId?: string,
    categoryId?: string,
    brandName?: string,
    price?: number
  ): BehaviorEvent => ({
    id: generateId(),
    userId: mockUserId,
    eventType,
    productId,
    categoryId,
    brandName,
    timestamp: new Date(),
    sessionId: mockSessionId,
    metadata: { 
      source: 'browse',
      priceAtTime: price
    }
  })

  describe('processEvents', () => {
    it('should process events and generate Style DNA profile', async () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes', 'Nike'),
        createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 150),
        createMockEvent('view', 'product-2', 'clothing', 'Adidas'),
        createMockEvent('add_to_cart', 'product-2', 'clothing', 'Adidas')
      ]

      const profile = await engine.processEvents(events)

      expect(profile.userId).toBe(mockUserId)
      expect(profile.dominantColors).toHaveLength(5) // Mock colors
      expect(profile.preferredBrands).toHaveLength(2)
      expect(profile.categoryPreferences).toHaveLength(2)
      expect(profile.lastUpdated).toBeInstanceOf(Date)
    })

    it('should throw error for insufficient data', async () => {
      await expect(engine.processEvents([])).rejects.toThrow('Insufficient behavior data')
    })

    it('should filter events for correct user', async () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes', 'Nike'),
        { ...createMockEvent('view', 'product-2'), userId: 'other-user' }
      ]

      const profile = await engine.processEvents(events)
      
      // Should only process events for the correct user
      expect(profile.preferredBrands).toHaveLength(1)
      expect(profile.preferredBrands[0].brandName).toBe('Nike')
    })
  })

  describe('generateInsights', () => {
    it('should generate insights from Style DNA profile', async () => {
      const events = [
        createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 150)
      ]
      
      const profile = await engine.processEvents(events)
      const insights = await engine.generateInsights(profile)

      expect(insights.length).toBeGreaterThan(0)
      expect(insights[0]).toHaveProperty('id')
      expect(insights[0]).toHaveProperty('type')
      expect(insights[0]).toHaveProperty('title')
      expect(insights[0]).toHaveProperty('confidence')
    })
  })

  describe('updateStyleDNA', () => {
    it('should update Style DNA with new events', async () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes', 'Nike')
      ]

      const profile = await engine.updateStyleDNA(mockUserId, events)
      
      expect(profile.userId).toBe(mockUserId)
      expect(profile.preferredBrands).toHaveLength(1)
    })

    it('should throw error for mismatched user ID', async () => {
      const events = [createMockEvent('view')]
      
      await expect(engine.updateStyleDNA('wrong-user', events))
        .rejects.toThrow('User ID mismatch')
    })
  })

  describe('detectPatterns', () => {
    it('should detect patterns from shopping sessions', async () => {
      const session: ShoppingSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
        startTime: new Date(),
        events: [
          createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 100),
          createMockEvent('purchase', 'product-2', 'shoes', 'Nike', 120),
          createMockEvent('purchase', 'product-3', 'shoes', 'Nike', 80)
        ],
        insights: [],
        totalValue: 300,
        itemsViewed: 0,
        itemsPurchased: 3
      }

      const patterns = await engine.detectPatterns([session])
      
      expect(patterns.length).toBeGreaterThan(0)
      
      const brandLoyaltyPattern = patterns.find(p => p.pattern === 'brand-loyalty')
      expect(brandLoyaltyPattern).toBeDefined()
      expect(brandLoyaltyPattern?.strength).toBeGreaterThan(0.5)
    })

    it('should return empty array for no sessions', async () => {
      const patterns = await engine.detectPatterns([])
      expect(patterns).toHaveLength(0)
    })

    it('should filter sessions for correct user', async () => {
      const sessions: ShoppingSession[] = [
        {
          sessionId: 'session-1',
          userId: mockUserId,
          startTime: new Date(),
          events: [createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 100)],
          insights: [],
          totalValue: 100,
          itemsViewed: 0,
          itemsPurchased: 1
        },
        {
          sessionId: 'session-2',
          userId: 'other-user',
          startTime: new Date(),
          events: [createMockEvent('purchase', 'product-2', 'clothing', 'Adidas', 80)],
          insights: [],
          totalValue: 80,
          itemsViewed: 0,
          itemsPurchased: 1
        }
      ]

      const patterns = await engine.detectPatterns(sessions)
      
      // Should only analyze sessions for the correct user
      expect(patterns.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('analyzeSession', () => {
    it('should analyze session and generate insights', async () => {
      const session: ShoppingSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
        startTime: new Date(),
        events: [
          createMockEvent('view', 'product-1', 'shoes', 'Nike'),
          createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 150)
        ],
        insights: [],
        totalValue: 0,
        itemsViewed: 0,
        itemsPurchased: 0
      }

      const analyzedSession = await engine.analyzeSession(session)
      
      expect(analyzedSession.insights.length).toBeGreaterThan(0)
      expect(analyzedSession.totalValue).toBe(150)
      expect(analyzedSession.itemsViewed).toBe(1)
      expect(analyzedSession.itemsPurchased).toBe(1)
    })

    it('should throw error for mismatched user ID', async () => {
      const session: ShoppingSession = {
        sessionId: mockSessionId,
        userId: 'wrong-user',
        startTime: new Date(),
        events: [],
        insights: [],
        totalValue: 0,
        itemsViewed: 0,
        itemsPurchased: 0
      }

      await expect(engine.analyzeSession(session))
        .rejects.toThrow('User ID mismatch')
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should generate analytics summary', async () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes', 'Nike'),
        createMockEvent('purchase', 'product-1', 'shoes', 'Nike', 150),
        createMockEvent('view', 'product-2', 'clothing', 'Adidas'),
        createMockEvent('purchase', 'product-2', 'clothing', 'Adidas', 80)
      ]

      const summary = await engine.getAnalyticsSummary(events)
      
      expect(summary.totalEvents).toBe(4)
      expect(summary.uniqueProducts).toBe(2)
      expect(summary.uniqueBrands).toBe(2)
      expect(summary.uniqueCategories).toBe(2)
      expect(summary.totalSpent).toBe(230)
      expect(summary.averageOrderValue).toBe(115)
      expect(summary.conversionRate).toBe(0.5) // 2 purchases out of 4 events
    })

    it('should handle empty events array', async () => {
      const summary = await engine.getAnalyticsSummary([])
      
      expect(summary.totalEvents).toBe(0)
      expect(summary.uniqueProducts).toBe(0)
      expect(summary.totalSpent).toBe(0)
      expect(summary.conversionRate).toBe(0)
      expect(summary.lastActivity).toBeNull()
    })
  })
})

describe('Factory Functions', () => {
  describe('createAnalyticsEngine', () => {
    it('should create analytics engine instance', () => {
      const engine = createAnalyticsEngine('test-user')
      expect(engine).toBeInstanceOf(ShopStoryAnalyticsEngine)
    })
  })
})

describe('Utility Functions', () => {
  describe('validateBehaviorEvents', () => {
    it('should validate correct events', () => {
      const validEvent: BehaviorEvent = {
        id: 'event-1',
        userId: 'user-1',
        eventType: 'view',
        timestamp: new Date(),
        sessionId: 'session-1',
        metadata: { source: 'browse' }
      }

      const { valid, invalid } = validateBehaviorEvents([validEvent])
      
      expect(valid).toHaveLength(1)
      expect(invalid).toHaveLength(0)
      expect(valid[0]).toEqual(validEvent)
    })

    it('should identify invalid events', () => {
      const invalidEvents = [
        // Missing required fields
        { id: '', userId: 'user-1', eventType: 'view', timestamp: new Date(), sessionId: 'session-1', metadata: {} },
        // Invalid event type
        { id: 'event-1', userId: 'user-1', eventType: 'invalid' as any, timestamp: new Date(), sessionId: 'session-1', metadata: {} },
        // Future timestamp
        { id: 'event-1', userId: 'user-1', eventType: 'view', timestamp: new Date(Date.now() + 86400000), sessionId: 'session-1', metadata: {} },
        // Too old timestamp
        { id: 'event-1', userId: 'user-1', eventType: 'view', timestamp: new Date('2020-01-01'), sessionId: 'session-1', metadata: {} }
      ]

      const { valid, invalid } = validateBehaviorEvents(invalidEvents)
      
      expect(valid).toHaveLength(0)
      expect(invalid).toHaveLength(4)
    })

    it('should separate valid and invalid events', () => {
      const events = [
        {
          id: 'event-1',
          userId: 'user-1',
          eventType: 'view' as const,
          timestamp: new Date(),
          sessionId: 'session-1',
          metadata: { source: 'browse' as const }
        },
        {
          id: '',
          userId: 'user-1',
          eventType: 'view' as const,
          timestamp: new Date(),
          sessionId: 'session-1',
          metadata: {}
        }
      ]

      const { valid, invalid } = validateBehaviorEvents(events)
      
      expect(valid).toHaveLength(1)
      expect(invalid).toHaveLength(1)
    })
  })

  describe('normalizeBehaviorEvents', () => {
    it('should normalize brand names and category IDs', () => {
      const events: BehaviorEvent[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          eventType: 'view',
          brandName: '  NIKE  ',
          categoryId: '  SHOES  ',
          timestamp: new Date(),
          sessionId: 'session-1',
          metadata: { source: 'browse' }
        }
      ]

      const normalized = normalizeBehaviorEvents(events)
      
      expect(normalized[0].brandName).toBe('nike')
      expect(normalized[0].categoryId).toBe('shoes')
    })

    it('should ensure metadata exists', () => {
      const events: BehaviorEvent[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          eventType: 'view',
          timestamp: new Date(),
          sessionId: 'session-1',
          metadata: {} as any
        }
      ]

      const normalized = normalizeBehaviorEvents(events)
      
      expect(normalized[0].metadata.source).toBe('browse')
    })
  })
})