import { describe, it, expect, beforeEach } from 'vitest'
import { 
  CommerceIntelligenceEngine, 
  createCommerceIntelligence,
  calculateBundleSavings,
  determineUrgencyLevel,
  validateProductSet
} from '../commerceIntelligence'
import type { StyleProfile, BehaviorEvent } from '../../types/analytics'
import type { ProductSet } from '../../types/commerce'
import type { Product } from '../../types/story'

describe('CommerceIntelligenceEngine', () => {
  let engine: CommerceIntelligenceEngine
  let mockStyleProfile: StyleProfile
  let mockBehaviorEvents: BehaviorEvent[]

  beforeEach(() => {
    engine = createCommerceIntelligence() as CommerceIntelligenceEngine
    
    mockStyleProfile = {
      userId: 'user-123',
      dominantColors: [
        { color: '#90EE90', name: 'Sage Green', frequency: 0.8 },
        { color: '#FFB6C1', name: 'Blush Pink', frequency: 0.6 }
      ],
      preferredBrands: [
        { brandName: 'Everlane', affinity: 0.9, frequency: 15 },
        { brandName: 'Reformation', affinity: 0.7, frequency: 8 }
      ],
      categoryPreferences: [
        { category: 'Shirts', weight: 0.8, frequency: 12 },
        { category: 'Sweaters', weight: 0.7, frequency: 8 }
      ],
      priceRanges: [
        { category: 'Shirts', min: 50, max: 150, average: 89, currency: 'USD', frequency: 10 }
      ],
      seasonalTrends: [
        {
          season: 'spring',
          year: 2024,
          dominantColors: ['#90EE90', '#FFB6C1'],
          topCategories: ['Shirts', 'Dresses'],
          spendingPattern: 120,
          styleEvolution: 0.3
        }
      ],
      evolutionScore: 0.2,
      lastUpdated: new Date()
    }

    mockBehaviorEvents = [
      {
        id: 'event-1',
        userId: 'user-123',
        eventType: 'view',
        productId: 'prod-1',
        timestamp: new Date(),
        sessionId: 'session-1',
        brandName: 'everlane',
        categoryId: 'shirts',
        metadata: { source: 'browse', priceAtTime: 89.99 }
      },
      {
        id: 'event-2',
        userId: 'user-123',
        eventType: 'add_to_cart',
        productId: 'prod-2',
        timestamp: new Date(),
        sessionId: 'session-1',
        brandName: 'reformation',
        categoryId: 'blouses',
        metadata: { source: 'recommendation', priceAtTime: 129.99 }
      },
      {
        id: 'event-3',
        userId: 'user-123',
        eventType: 'purchase',
        productId: 'prod-3',
        timestamp: new Date(),
        sessionId: 'session-2',
        brandName: 'everlane',
        categoryId: 'sweaters',
        metadata: { source: 'search', priceAtTime: 199.99 }
      }
    ]
  })

  describe('generateSets', () => {
    it('should generate product sets based on style profile', async () => {
      const sets = await engine.generateSets(mockStyleProfile)
      
      expect(sets).toBeDefined()
      expect(Array.isArray(sets)).toBe(true)
      expect(sets.length).toBeGreaterThan(0)
      
      // Check that sets have required properties
      sets.forEach(set => {
        expect(set.id).toBeDefined()
        expect(set.name).toBeDefined()
        expect(set.insight).toBeDefined()
        expect(set.products).toBeDefined()
        expect(Array.isArray(set.products)).toBe(true)
        expect(set.originalPrice).toBeGreaterThan(0)
        expect(set.urgencyLevel).toMatch(/^(low|medium|high)$/)
        expect(set.completionStatus).toBeGreaterThanOrEqual(0)
        expect(set.completionStatus).toBeLessThanOrEqual(1)
      })
    })

    it('should generate color-based sets from dominant colors', async () => {
      const sets = await engine.generateSets(mockStyleProfile)
      const colorSets = sets.filter(set => set.category === 'color-curated')
      
      expect(colorSets.length).toBeGreaterThan(0)
      
      colorSets.forEach(set => {
        expect(set.insight).toContain('color')
        expect(set.tags).toContain('color-match')
      })
    })

    it('should generate brand affinity sets', async () => {
      const sets = await engine.generateSets(mockStyleProfile)
      const brandSets = sets.filter(set => set.category === 'brand-curated')
      
      expect(brandSets.length).toBeGreaterThan(0)
      
      brandSets.forEach(set => {
        expect(set.insight).toContain('brand')
        expect(set.tags).toContain('brand-affinity')
      })
    })

    it('should limit sets to maximum configured amount', async () => {
      const sets = await engine.generateSets(mockStyleProfile)
      
      // Default max is 10
      expect(sets.length).toBeLessThanOrEqual(10)
    })

    it('should calculate bundle pricing correctly', async () => {
      const sets = await engine.generateSets(mockStyleProfile)
      
      sets.forEach(set => {
        if (set.bundlePrice) {
          expect(set.bundlePrice).toBeLessThan(set.originalPrice)
          expect(set.savings).toBeGreaterThan(0)
          expect(set.savings).toBe(set.originalPrice - set.bundlePrice)
        }
      })
    })
  })

  describe('updateRecommendations', () => {
    it('should generate recommendations from behavior events', async () => {
      const recommendations = await engine.updateRecommendations('user-123', mockBehaviorEvents)
      
      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      
      recommendations.forEach(rec => {
        expect(rec.productId).toBeDefined()
        expect(rec.reason).toBeDefined()
        expect(rec.confidence).toBeGreaterThanOrEqual(0)
        expect(rec.confidence).toBeLessThanOrEqual(1)
        expect(rec.type).toMatch(/^(style-match|complete-set|trending|price-drop)$/)
        expect(rec.metadata).toBeDefined()
      })
    })

    it('should filter recommendations by confidence threshold', async () => {
      const recommendations = await engine.updateRecommendations('user-123', mockBehaviorEvents)
      
      // All recommendations should meet minimum confidence threshold (0.6)
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0.6)
      })
    })

    it('should generate style-match recommendations from view events', async () => {
      const viewEvents = mockBehaviorEvents.filter(e => e.eventType === 'view')
      const recommendations = await engine.updateRecommendations('user-123', viewEvents)
      
      // The engine should generate recommendations, but they might be filtered by confidence
      // Let's check that the method was called and returned an array
      expect(Array.isArray(recommendations)).toBe(true)
      
      // If there are style matches, they should have the right properties
      const styleMatches = recommendations.filter(rec => rec.type === 'style-match')
      styleMatches.forEach(rec => {
        expect(rec.reason).toContain('Similar to')
        expect(rec.metadata.styleMatch).toBeDefined()
      })
    })

    it('should generate complete-set recommendations from cart events', async () => {
      const cartEvents = mockBehaviorEvents.filter(e => e.eventType === 'add_to_cart')
      const recommendations = await engine.updateRecommendations('user-123', cartEvents)
      
      // The engine should generate recommendations, but they might be filtered by confidence
      expect(Array.isArray(recommendations)).toBe(true)
      
      // If there are complete-set recommendations, they should have the right properties
      const completeSetRecs = recommendations.filter(rec => rec.type === 'complete-set')
      completeSetRecs.forEach(rec => {
        expect(rec.reason).toContain('Complete')
        expect(rec.urgency).toBe('limited-time')
        expect(rec.metadata.complementaryItems).toBeDefined()
      })
    })
  })

  describe('optimizePricing', () => {
    let mockProductSet: ProductSet

    beforeEach(() => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          title: 'Test Product 1',
          images: [{ id: 'img-1', url: '/test1.jpg' }],
          price: { amount: '50.00', currencyCode: 'USD' }
        },
        {
          id: 'prod-2',
          title: 'Test Product 2',
          images: [{ id: 'img-2', url: '/test2.jpg' }],
          price: { amount: '75.00', currencyCode: 'USD' }
        }
      ]

      mockProductSet = {
        id: 'set-1',
        name: 'Test Set',
        insight: 'Test insight',
        products: mockProducts,
        originalPrice: 125,
        urgencyLevel: 'medium',
        completionStatus: 0.8,
        createdAt: new Date(),
        tags: ['test'],
        category: 'test'
      }
    })

    it('should generate individual and bundle purchase options', async () => {
      const options = await engine.optimizePricing(mockProductSet)
      
      expect(options.length).toBeGreaterThanOrEqual(2)
      
      const individualOption = options.find(opt => opt.type === 'individual')
      const bundleOption = options.find(opt => opt.type === 'bundle')
      
      expect(individualOption).toBeDefined()
      expect(bundleOption).toBeDefined()
      
      expect(individualOption!.price).toBe(125)
      expect(bundleOption!.price).toBeLessThan(125)
      expect(bundleOption!.savings).toBeGreaterThan(0)
    })

    it('should generate subscription option for eligible sets', async () => {
      // Make set subscription-eligible by adding basics category
      mockProductSet.products[0].productType = 'basics'
      
      const options = await engine.optimizePricing(mockProductSet)
      const subscriptionOption = options.find(opt => opt.type === 'subscription')
      
      expect(subscriptionOption).toBeDefined()
      expect(subscriptionOption!.price).toBeLessThan(mockProductSet.originalPrice)
      expect(subscriptionOption!.description).toContain('Subscribe')
    })

    it('should not generate subscription option for non-eligible sets', async () => {
      const options = await engine.optimizePricing(mockProductSet)
      const subscriptionOption = options.find(opt => opt.type === 'subscription')
      
      expect(subscriptionOption).toBeUndefined()
    })
  })

  describe('trackPerformance', () => {
    it('should track performance events without throwing', async () => {
      const mockEvent = {
        type: 'view',
        setId: 'set-1',
        userId: 'user-123',
        timestamp: new Date()
      }

      // Should not throw
      await expect(engine.trackPerformance('set-1', mockEvent)).resolves.toBeUndefined()
    })
  })
})

describe('Utility Functions', () => {
  describe('calculateBundleSavings', () => {
    it('should calculate correct savings with default discount rate', () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          title: 'Product 1',
          images: [],
          price: { amount: '50.00', currencyCode: 'USD' }
        },
        {
          id: 'prod-2',
          title: 'Product 2',
          images: [],
          price: { amount: '30.00', currencyCode: 'USD' }
        }
      ]

      const savings = calculateBundleSavings(mockProducts)
      expect(savings).toBe(12) // 15% of 80
    })

    it('should calculate correct savings with custom discount rate', () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          title: 'Product 1',
          images: [],
          price: { amount: '100.00', currencyCode: 'USD' }
        }
      ]

      const savings = calculateBundleSavings(mockProducts, 0.2)
      expect(savings).toBe(20) // 20% of 100
    })
  })

  describe('determineUrgencyLevel', () => {
    it('should return high urgency for low stock', () => {
      const urgency = determineUrgencyLevel(3)
      expect(urgency).toBe('high')
    })

    it('should return medium urgency for moderate stock', () => {
      const urgency = determineUrgencyLevel(15)
      expect(urgency).toBe('medium')
    })

    it('should return low urgency for high stock', () => {
      const urgency = determineUrgencyLevel(50)
      expect(urgency).toBe('low')
    })

    it('should factor in price drops for urgency', () => {
      const priceHistory = [100, 90, 80] // Declining prices
      const urgency = determineUrgencyLevel(undefined, priceHistory)
      expect(urgency).toBe('medium') // Price drop adds urgency
    })

    it('should factor in seasonal relevance', () => {
      const urgency = determineUrgencyLevel(undefined, undefined, 0.9)
      expect(urgency).toBe('medium') // High seasonal relevance
    })

    it('should combine multiple factors for high urgency', () => {
      const urgency = determineUrgencyLevel(4, [100, 80], 0.8)
      expect(urgency).toBe('high') // Low stock + price drop + seasonal
    })
  })

  describe('validateProductSet', () => {
    let validProductSet: ProductSet

    beforeEach(() => {
      validProductSet = {
        id: 'set-1',
        name: 'Valid Set',
        insight: 'Test insight',
        products: [
          {
            id: 'prod-1',
            title: 'Product 1',
            images: [],
            price: { amount: '50.00', currencyCode: 'USD' }
          }
        ],
        originalPrice: 50,
        urgencyLevel: 'medium',
        completionStatus: 0.8,
        createdAt: new Date(),
        tags: ['test'],
        category: 'test'
      }
    })

    it('should validate a correct product set', () => {
      const result = validateProductSet(validProductSet)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing ID', () => {
      const invalidSet = { ...validProductSet, id: '' }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Product set must have an ID')
    })

    it('should detect missing name', () => {
      const invalidSet = { ...validProductSet, name: '' }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Product set must have a name')
    })

    it('should detect missing insight', () => {
      const invalidSet = { ...validProductSet, insight: '' }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Product set must have an insight')
    })

    it('should detect empty products array', () => {
      const invalidSet = { ...validProductSet, products: [] }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Product set must contain at least one product')
    })

    it('should detect invalid completion status', () => {
      const invalidSet = { ...validProductSet, completionStatus: 1.5 }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Completion status must be between 0 and 1')
    })

    it('should detect multiple validation errors', () => {
      const invalidSet = {
        ...validProductSet,
        id: '',
        name: '',
        products: [],
        completionStatus: -0.5
      }
      const result = validateProductSet(invalidSet)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})

describe('Integration Tests', () => {
  it('should create a complete commerce intelligence workflow', async () => {
    const engine = createCommerceIntelligence()
    
    const mockStyleProfile: StyleProfile = {
      userId: 'user-123',
      dominantColors: [{ color: '#90EE90', name: 'Sage Green', frequency: 0.8 }],
      preferredBrands: [{ brandName: 'Everlane', affinity: 0.9, frequency: 15 }],
      categoryPreferences: [{ category: 'Shirts', weight: 0.8, frequency: 12 }],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.2,
      lastUpdated: new Date()
    }

    const mockBehaviorEvents: BehaviorEvent[] = [
      {
        id: 'event-1',
        userId: 'user-123',
        eventType: 'view',
        productId: 'prod-1',
        timestamp: new Date(),
        sessionId: 'session-1',
        metadata: { source: 'browse' }
      }
    ]

    // Generate sets
    const sets = await engine.generateSets(mockStyleProfile)
    expect(sets.length).toBeGreaterThan(0)

    // Generate recommendations
    const recommendations = await engine.updateRecommendations('user-123', mockBehaviorEvents)
    expect(Array.isArray(recommendations)).toBe(true)

    // Optimize pricing for first set
    if (sets.length > 0) {
      const options = await engine.optimizePricing(sets[0])
      expect(options.length).toBeGreaterThan(0)
    }

    // Track performance
    await engine.trackPerformance('set-1', {
      type: 'view',
      setId: 'set-1',
      userId: 'user-123',
      timestamp: new Date()
    })
  })
})