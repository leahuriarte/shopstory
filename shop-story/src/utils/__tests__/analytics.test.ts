// Unit tests for analytics functions
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createBehaviorEvent,
  generateId,
  getCurrentSessionId,
  calculateStyleEvolution,
  generateSessionInsights,
  extractColorPreferences,
  calculateBrandAffinities,
  calculateCategoryPreferences,
  detectBehaviorPatterns,
  generateStoryInsights
} from '../analytics'
import type { 
  BehaviorEvent, 
  StyleProfile, 
  SessionInsight,
  ColorProfile,
  BrandAffinity,
  CategoryWeight
} from '../../types/analytics'

describe('Analytics Utilities', () => {
  const mockUserId = 'test-user-123'
  const mockSessionId = 'test-session-456'

  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear()
  })

  describe('createBehaviorEvent', () => {
    it('should create a valid behavior event', () => {
      const event = createBehaviorEvent(mockUserId, 'view', 'product-123', {
        source: 'story',
        duration: 5000
      })

      expect(event).toMatchObject({
        userId: mockUserId,
        eventType: 'view',
        productId: 'product-123',
        metadata: {
          source: 'story',
          duration: 5000
        }
      })
      expect(event.id).toBeDefined()
      expect(event.timestamp).toBeInstanceOf(Date)
      expect(event.sessionId).toBeDefined()
    })

    it('should create event without optional parameters', () => {
      const event = createBehaviorEvent(mockUserId, 'purchase')

      expect(event).toMatchObject({
        userId: mockUserId,
        eventType: 'purchase',
        metadata: {
          source: 'browse'
        }
      })
      expect(event.productId).toBeUndefined()
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('getCurrentSessionId', () => {
    it('should create and persist session ID', () => {
      // Mock sessionStorage for this test
      const mockStorage = new Map<string, string>()
      const originalGetItem = sessionStorage.getItem
      const originalSetItem = sessionStorage.setItem
      
      sessionStorage.getItem = vi.fn((key: string) => mockStorage.get(key) || null)
      sessionStorage.setItem = vi.fn((key: string, value: string) => {
        mockStorage.set(key, value)
      })
      
      const sessionId1 = getCurrentSessionId()
      const sessionId2 = getCurrentSessionId()
      
      expect(sessionId1).toBe(sessionId2)
      expect(sessionId1).toMatch(/^session-\d+-[a-z0-9]+$/)
      
      // Restore original methods
      sessionStorage.getItem = originalGetItem
      sessionStorage.setItem = originalSetItem
    })

    it('should create new session ID after clearing storage', () => {
      const sessionId1 = getCurrentSessionId()
      sessionStorage.clear()
      const sessionId2 = getCurrentSessionId()
      
      expect(sessionId1).not.toBe(sessionId2)
    })
  })

  describe('calculateStyleEvolution', () => {
    const createMockProfile = (colors: string[], brands: string[], categories: string[]): StyleProfile => ({
      userId: mockUserId,
      dominantColors: colors.map((color, i) => ({
        color,
        name: `Color ${i}`,
        frequency: 0.5,
        confidence: 0.8
      })),
      preferredBrands: brands.map(brand => ({
        brandName: brand,
        affinity: 0.7,
        purchaseCount: 3,
        averageSpend: 100,
        lastPurchase: new Date(),
        categories: ['clothing']
      })),
      categoryPreferences: categories.map(category => ({
        category,
        weight: 0.6,
        purchaseFrequency: 2,
        averageSpend: 80,
        trendDirection: 'stable' as const
      })),
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0,
      lastUpdated: new Date()
    })

    it('should calculate evolution score for similar profiles', () => {
      const profile1 = createMockProfile(['#FF0000', '#00FF00'], ['Nike', 'Adidas'], ['shoes', 'clothing'])
      const profile2 = createMockProfile(['#FF0000', '#00FF00'], ['Nike', 'Adidas'], ['shoes', 'clothing'])
      
      const evolution = calculateStyleEvolution(profile1, profile2)
      expect(evolution).toBe(0) // No change
    })

    it('should calculate evolution score for different profiles', () => {
      const profile1 = createMockProfile(['#FF0000'], ['Nike'], ['shoes'])
      const profile2 = createMockProfile(['#0000FF'], ['Puma'], ['clothing'])
      
      const evolution = calculateStyleEvolution(profile1, profile2)
      expect(evolution).toBeGreaterThan(0) // Significant change
    })

    it('should return 0 for null profiles', () => {
      const profile = createMockProfile(['#FF0000'], ['Nike'], ['shoes'])
      
      expect(calculateStyleEvolution(null as any, profile)).toBe(0)
      expect(calculateStyleEvolution(profile, null as any)).toBe(0)
    })
  })

  describe('generateSessionInsights', () => {
    const createMockEvent = (
      eventType: BehaviorEvent['eventType'],
      productId?: string,
      categoryId?: string,
      brandName?: string
    ): BehaviorEvent => ({
      id: generateId(),
      userId: mockUserId,
      eventType,
      productId,
      categoryId,
      brandName,
      timestamp: new Date(),
      sessionId: mockSessionId,
      metadata: { source: 'browse' }
    })

    it('should generate purchase intent insight', () => {
      const events = [
        createMockEvent('view', 'product-1'),
        createMockEvent('purchase', 'product-1')
      ]

      const insights = generateSessionInsights(events)
      
      expect(insights).toHaveLength(1)
      expect(insights[0]).toMatchObject({
        type: 'intent',
        confidence: 0.9,
        description: 'High purchase intent - completed 1 purchase(s)',
        data: { purchaseCount: 1 }
      })
    })

    it('should generate category preference insight', () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes'),
        createMockEvent('view', 'product-2', 'shoes'),
        createMockEvent('view', 'product-3', 'clothing')
      ]

      const insights = generateSessionInsights(events)
      
      const categoryInsight = insights.find(i => i.type === 'preference' && i.description.includes('category'))
      expect(categoryInsight).toBeDefined()
      expect(categoryInsight?.data.category).toBe('shoes')
    })

    it('should generate brand affinity insight', () => {
      const events = [
        createMockEvent('view', 'product-1', 'shoes', 'Nike'),
        createMockEvent('view', 'product-2', 'shoes', 'Nike'),
        createMockEvent('view', 'product-3', 'shoes', 'Nike')
      ]

      const insights = generateSessionInsights(events)
      
      const brandInsight = insights.find(i => i.type === 'preference' && i.description.includes('Brand affinity'))
      expect(brandInsight).toBeDefined()
      expect(brandInsight?.data.brand).toBe('Nike')
    })

    it('should return empty array for no events', () => {
      const insights = generateSessionInsights([])
      expect(insights).toHaveLength(0)
    })
  })

  describe('extractColorPreferences', () => {
    it('should return mock color preferences', () => {
      const events = [createBehaviorEvent(mockUserId, 'view')]
      const colors = extractColorPreferences(events)
      
      expect(colors).toHaveLength(5)
      expect(colors[0]).toMatchObject({
        color: '#2D5016',
        name: 'Forest Green',
        frequency: 0.3,
        confidence: 0.8,
        season: 'fall'
      })
    })
  })

  describe('calculateBrandAffinities', () => {
    const createEventWithBrand = (eventType: BehaviorEvent['eventType'], brandName: string, price?: number): BehaviorEvent => ({
      id: generateId(),
      userId: mockUserId,
      eventType,
      brandName,
      categoryId: 'clothing',
      timestamp: new Date(),
      sessionId: mockSessionId,
      metadata: { 
        source: 'browse',
        priceAtTime: price
      }
    })

    it('should calculate brand affinities from events', () => {
      const events = [
        createEventWithBrand('view', 'Nike'),
        createEventWithBrand('view', 'Nike'),
        createEventWithBrand('purchase', 'Nike', 100),
        createEventWithBrand('view', 'Adidas')
      ]

      const affinities = calculateBrandAffinities(events)
      
      expect(affinities).toHaveLength(2)
      expect(affinities[0].brandName).toBe('Nike')
      expect(affinities[0].purchaseCount).toBe(1)
      expect(affinities[0].averageSpend).toBe(100)
      expect(affinities[0].affinity).toBeGreaterThan(affinities[1].affinity)
    })

    it('should handle events without brand names', () => {
      const events = [
        createBehaviorEvent(mockUserId, 'view'),
        createBehaviorEvent(mockUserId, 'purchase')
      ]

      const affinities = calculateBrandAffinities(events)
      expect(affinities).toHaveLength(0)
    })
  })

  describe('calculateCategoryPreferences', () => {
    const createEventWithCategory = (eventType: BehaviorEvent['eventType'], categoryId: string, price?: number): BehaviorEvent => ({
      id: generateId(),
      userId: mockUserId,
      eventType,
      categoryId,
      timestamp: new Date(),
      sessionId: mockSessionId,
      metadata: { 
        source: 'browse',
        priceAtTime: price
      }
    })

    it('should calculate category preferences from events', () => {
      const events = [
        createEventWithCategory('view', 'shoes'),
        createEventWithCategory('view', 'shoes'),
        createEventWithCategory('purchase', 'shoes', 150),
        createEventWithCategory('view', 'clothing')
      ]

      const preferences = calculateCategoryPreferences(events)
      
      expect(preferences).toHaveLength(2)
      expect(preferences[0].category).toBe('shoes')
      expect(preferences[0].purchaseFrequency).toBe(1)
      expect(preferences[0].averageSpend).toBe(150)
      expect(preferences[0].weight).toBeGreaterThan(preferences[1].weight)
    })

    it('should determine trend direction', () => {
      const now = new Date()
      const oldDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      
      const events = [
        { ...createEventWithCategory('view', 'shoes'), timestamp: oldDate },
        { ...createEventWithCategory('view', 'shoes'), timestamp: now },
        { ...createEventWithCategory('view', 'shoes'), timestamp: now }
      ]

      const preferences = calculateCategoryPreferences(events)
      
      expect(preferences[0].trendDirection).toBe('increasing')
    })
  })

  describe('detectBehaviorPatterns', () => {
    it('should detect seasonal patterns', () => {
      const events = Array.from({ length: 10 }, () => 
        createBehaviorEvent(mockUserId, 'purchase')
      )

      const patterns = detectBehaviorPatterns(events)
      
      const seasonalPattern = patterns.find(p => p.pattern === 'seasonal-shift')
      expect(seasonalPattern).toBeDefined()
      expect(seasonalPattern?.strength).toBeGreaterThan(0)
    })

    it('should detect brand loyalty patterns', () => {
      const events = Array.from({ length: 5 }, () => ({
        ...createBehaviorEvent(mockUserId, 'purchase'),
        brandName: 'Nike'
      }))

      const patterns = detectBehaviorPatterns(events)
      
      const loyaltyPattern = patterns.find(p => p.pattern === 'brand-loyalty')
      expect(loyaltyPattern).toBeDefined()
      expect(loyaltyPattern?.strength).toBeGreaterThan(0.5)
    })
  })

  describe('generateStoryInsights', () => {
    const mockProfile: StyleProfile = {
      userId: mockUserId,
      dominantColors: [{
        color: '#FF0000',
        name: 'Red',
        frequency: 0.4,
        confidence: 0.9
      }],
      preferredBrands: [{
        brandName: 'Nike',
        affinity: 0.8,
        purchaseCount: 5,
        averageSpend: 120,
        lastPurchase: new Date(),
        categories: ['shoes', 'clothing']
      }],
      categoryPreferences: [{
        category: 'shoes',
        weight: 0.7,
        purchaseFrequency: 3,
        averageSpend: 150,
        trendDirection: 'increasing'
      }],
      priceRanges: [{
        category: 'shoes',
        min: 50,
        max: 200,
        average: 125,
        currency: 'USD',
        frequency: 3
      }],
      seasonalTrends: [{
        season: 'fall',
        year: 2024,
        dominantColors: ['#8B4513'],
        topCategories: ['shoes'],
        spendingPattern: 100,
        styleEvolution: 0.2
      }],
      evolutionScore: 0.3,
      lastUpdated: new Date()
    }

    it('should generate color preference insights', () => {
      const insights = generateStoryInsights(mockProfile)
      
      const colorInsight = insights.find(i => i.type === 'color-preference')
      expect(colorInsight).toBeDefined()
      expect(colorInsight?.title).toContain('Red')
      expect(colorInsight?.visualType).toBe('color-palette')
    })

    it('should generate brand affinity insights', () => {
      const insights = generateStoryInsights(mockProfile)
      
      const brandInsight = insights.find(i => i.type === 'brand-affinity')
      expect(brandInsight).toBeDefined()
      expect(brandInsight?.title).toContain('Nike')
      expect(brandInsight?.visualType).toBe('brand-cloud')
    })

    it('should generate category trend insights', () => {
      const insights = generateStoryInsights(mockProfile)
      
      const categoryInsight = insights.find(i => i.type === 'category-trend')
      expect(categoryInsight).toBeDefined()
      expect(categoryInsight?.title).toContain('shoes')
      expect(categoryInsight?.visualType).toBe('chart')
    })

    it('should generate price pattern insights', () => {
      const insights = generateStoryInsights(mockProfile)
      
      const priceInsight = insights.find(i => i.type === 'price-pattern')
      expect(priceInsight).toBeDefined()
      expect(priceInsight?.description).toContain('$125')
      expect(priceInsight?.visualType).toBe('chart')
    })

    it('should generate seasonal insights', () => {
      const insights = generateStoryInsights(mockProfile)
      
      const seasonalInsight = insights.find(i => i.type === 'seasonal-shift')
      expect(seasonalInsight).toBeDefined()
      expect(seasonalInsight?.visualType).toBe('trend-line')
    })
  })
})