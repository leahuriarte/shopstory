import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { 
  useCommerceIntelligence, 
  useCommerceTracking, 
  useCompleteTheSet 
} from '../useCommerceIntelligence'
import type { StyleProfile, BehaviorEvent } from '../../types/analytics'
import type { ProductSet } from '../../types/commerce'
import type { Product } from '../../types/story'

// Mock the commerce intelligence engine
vi.mock('../../utils/commerceIntelligence', () => ({
  createCommerceIntelligence: vi.fn(() => ({
    generateSets: vi.fn(),
    updateRecommendations: vi.fn(),
    optimizePricing: vi.fn(),
    trackPerformance: vi.fn()
  }))
}))

describe('useCommerceIntelligence', () => {
  let mockStyleProfile: StyleProfile
  let mockBehaviorEvents: BehaviorEvent[]
  let mockEngine: any

  beforeEach(async () => {
    mockStyleProfile = {
      userId: 'user-123',
      dominantColors: [{ color: '#90EE90', name: 'Sage Green', frequency: 0.8 }],
      preferredBrands: [{ brandName: 'Everlane', affinity: 0.9, frequency: 15 }],
      categoryPreferences: [{ category: 'Shirts', weight: 0.8, frequency: 12 }],
      priceRanges: [],
      seasonalTrends: [],
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
        metadata: { source: 'browse' }
      }
    ]

    // Get the mocked engine
    const { createCommerceIntelligence } = await import('../../utils/commerceIntelligence')
    mockEngine = createCommerceIntelligence()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('initializes with empty state', () => {
      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123'
        })
      )

      expect(result.current.productSets).toEqual([])
      expect(result.current.recommendations).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('generates product sets when style profile is provided', async () => {
      const mockSets: ProductSet[] = [
        {
          id: 'set-1',
          name: 'Test Set',
          insight: 'Test insight',
          products: [],
          originalPrice: 100,
          urgencyLevel: 'medium',
          completionStatus: 0.7,
          createdAt: new Date(),
          tags: ['test'],
          category: 'test'
        }
      ]

      mockEngine.generateSets.mockResolvedValue(mockSets)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      await waitFor(() => {
        expect(result.current.productSets).toEqual(mockSets)
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockEngine.generateSets).toHaveBeenCalledWith(mockStyleProfile)
    })

    it('updates recommendations when behavior events are provided', async () => {
      const mockRecommendations = [
        {
          productId: 'prod-1',
          reason: 'Test recommendation',
          confidence: 0.8,
          type: 'style-match' as const,
          metadata: { styleMatch: 0.8 }
        }
      ]

      mockEngine.updateRecommendations.mockResolvedValue(mockRecommendations)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile,
          behaviorEvents: mockBehaviorEvents
        })
      )

      await waitFor(() => {
        expect(result.current.recommendations).toEqual(mockRecommendations)
      })

      expect(mockEngine.updateRecommendations).toHaveBeenCalledWith('user-123', mockBehaviorEvents)
    })

    it('handles loading state correctly', async () => {
      // Make generateSets return a promise that we can control
      let resolveGenerateSets: (value: ProductSet[]) => void
      const generateSetsPromise = new Promise<ProductSet[]>((resolve) => {
        resolveGenerateSets = resolve
      })
      mockEngine.generateSets.mockReturnValue(generateSetsPromise)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      // Should be loading initially
      expect(result.current.isLoading).toBe(true)

      // Resolve the promise
      act(() => {
        resolveGenerateSets!([])
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles errors gracefully', async () => {
      const errorMessage = 'Failed to generate sets'
      mockEngine.generateSets.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.productSets).toEqual([])
      })
    })
  })

  describe('refreshSets function', () => {
    it('refreshes product sets when called', async () => {
      const initialSets = [{ id: 'set-1' }] as ProductSet[]
      const updatedSets = [{ id: 'set-1' }, { id: 'set-2' }] as ProductSet[]

      mockEngine.generateSets
        .mockResolvedValueOnce(initialSets)
        .mockResolvedValueOnce(updatedSets)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      await waitFor(() => {
        expect(result.current.productSets).toEqual(initialSets)
      })

      await act(async () => {
        await result.current.refreshSets()
      })

      expect(result.current.productSets).toEqual(updatedSets)
      expect(mockEngine.generateSets).toHaveBeenCalledTimes(2)
    })

    it('does not call generateSets when no style profile is provided', async () => {
      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123'
        })
      )

      await act(async () => {
        await result.current.refreshSets()
      })

      expect(mockEngine.generateSets).not.toHaveBeenCalled()
      expect(result.current.productSets).toEqual([])
    })
  })

  describe('updateRecommendations function', () => {
    it('updates recommendations with new behavior events', async () => {
      const newRecommendations = [
        {
          productId: 'prod-2',
          reason: 'New recommendation',
          confidence: 0.9,
          type: 'trending' as const,
          metadata: { trendScore: 0.9 }
        }
      ]

      mockEngine.updateRecommendations.mockResolvedValue(newRecommendations)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      const newEvents: BehaviorEvent[] = [
        {
          id: 'event-2',
          userId: 'user-123',
          eventType: 'purchase',
          productId: 'prod-2',
          timestamp: new Date(),
          sessionId: 'session-2',
          metadata: { source: 'recommendation' }
        }
      ]

      await act(async () => {
        await result.current.updateRecommendations(newEvents)
      })

      expect(result.current.recommendations).toEqual(newRecommendations)
      expect(mockEngine.updateRecommendations).toHaveBeenCalledWith('user-123', newEvents)
    })

    it('clears recommendations when empty events array is provided', async () => {
      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      await act(async () => {
        await result.current.updateRecommendations([])
      })

      expect(result.current.recommendations).toEqual([])
      expect(mockEngine.updateRecommendations).not.toHaveBeenCalled()
    })
  })

  describe('optimizePricing function', () => {
    it('returns optimized pricing options', async () => {
      const mockProductSet: ProductSet = {
        id: 'set-1',
        name: 'Test Set',
        insight: 'Test insight',
        products: [],
        originalPrice: 100,
        urgencyLevel: 'medium',
        completionStatus: 0.7,
        createdAt: new Date(),
        tags: ['test'],
        category: 'test'
      }

      const mockPricingOptions = [
        {
          type: 'individual' as const,
          price: 100,
          currency: 'USD',
          description: 'Buy separately',
          available: true
        },
        {
          type: 'bundle' as const,
          price: 85,
          currency: 'USD',
          savings: 15,
          description: 'Bundle discount',
          available: true
        }
      ]

      mockEngine.optimizePricing.mockResolvedValue(mockPricingOptions)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      let pricingOptions: any
      await act(async () => {
        pricingOptions = await result.current.optimizePricing(mockProductSet)
      })

      expect(pricingOptions).toEqual(mockPricingOptions)
      expect(mockEngine.optimizePricing).toHaveBeenCalledWith(mockProductSet)
    })

    it('returns fallback pricing when optimization fails', async () => {
      const mockProductSet: ProductSet = {
        id: 'set-1',
        name: 'Test Set',
        insight: 'Test insight',
        products: [],
        originalPrice: 100,
        urgencyLevel: 'medium',
        completionStatus: 0.7,
        createdAt: new Date(),
        tags: ['test'],
        category: 'test'
      }

      mockEngine.optimizePricing.mockRejectedValue(new Error('Pricing failed'))

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      let pricingOptions: any
      await act(async () => {
        pricingOptions = await result.current.optimizePricing(mockProductSet)
      })

      expect(pricingOptions).toEqual([{
        type: 'individual',
        price: 100,
        currency: 'USD',
        description: 'Buy items separately',
        available: true
      }])
    })
  })

  describe('trackEvent function', () => {
    it('tracks commerce events', async () => {
      mockEngine.trackPerformance.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      await act(async () => {
        await result.current.trackEvent('set-1', 'view', 'prod-1')
      })

      expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
        type: 'view',
        setId: 'set-1',
        productId: 'prod-1',
        userId: 'user-123',
        timestamp: expect.any(Date)
      })
    })

    it('does not throw when tracking fails', async () => {
      mockEngine.trackPerformance.mockRejectedValue(new Error('Tracking failed'))

      const { result } = renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile
        })
      )

      // Should not throw
      await act(async () => {
        await result.current.trackEvent('set-1', 'view')
      })

      expect(mockEngine.trackPerformance).toHaveBeenCalled()
    })
  })

  describe('auto-refresh functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('auto-refreshes sets at specified interval', async () => {
      mockEngine.generateSets.mockResolvedValue([])

      renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile,
          autoRefresh: true,
          refreshInterval: 5000 // 5 seconds
        })
      )

      // Initial call
      expect(mockEngine.generateSets).toHaveBeenCalledTimes(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(mockEngine.generateSets).toHaveBeenCalledTimes(2)
      })
    })

    it('does not auto-refresh when disabled', async () => {
      mockEngine.generateSets.mockResolvedValue([])

      renderHook(() =>
        useCommerceIntelligence({
          userId: 'user-123',
          styleProfile: mockStyleProfile,
          autoRefresh: false
        })
      )

      // Initial call
      expect(mockEngine.generateSets).toHaveBeenCalledTimes(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should not have been called again
      expect(mockEngine.generateSets).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useCommerceTracking', () => {
  let mockEngine: any

  beforeEach(async () => {
    const { createCommerceIntelligence } = await import('../../utils/commerceIntelligence')
    mockEngine = createCommerceIntelligence()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('provides tracking functions', () => {
    const { result } = renderHook(() => useCommerceTracking('user-123'))

    expect(typeof result.current.trackSetView).toBe('function')
    expect(typeof result.current.trackProductClick).toBe('function')
    expect(typeof result.current.trackAddToCart).toBe('function')
    expect(typeof result.current.trackPurchase).toBe('function')
    expect(typeof result.current.trackShare).toBe('function')
  })

  it('tracks set view events', async () => {
    mockEngine.trackPerformance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommerceTracking('user-123'))

    await act(async () => {
      await result.current.trackSetView('set-1')
    })

    expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
      type: 'view',
      setId: 'set-1',
      userId: 'user-123',
      timestamp: expect.any(Date)
    })
  })

  it('tracks product click events', async () => {
    mockEngine.trackPerformance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommerceTracking('user-123'))

    await act(async () => {
      await result.current.trackProductClick('set-1', 'prod-1')
    })

    expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
      type: 'click',
      setId: 'set-1',
      productId: 'prod-1',
      userId: 'user-123',
      timestamp: expect.any(Date)
    })
  })

  it('tracks add to cart events with price', async () => {
    mockEngine.trackPerformance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommerceTracking('user-123'))

    await act(async () => {
      await result.current.trackAddToCart('set-1', 'prod-1', 89.99)
    })

    expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
      type: 'add_to_cart',
      setId: 'set-1',
      productId: 'prod-1',
      userId: 'user-123',
      timestamp: expect.any(Date),
      value: 89.99
    })
  })

  it('tracks purchase events with price', async () => {
    mockEngine.trackPerformance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommerceTracking('user-123'))

    await act(async () => {
      await result.current.trackPurchase('set-1', 'prod-1', 89.99)
    })

    expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
      type: 'purchase',
      setId: 'set-1',
      productId: 'prod-1',
      userId: 'user-123',
      timestamp: expect.any(Date),
      value: 89.99
    })
  })

  it('tracks share events', async () => {
    mockEngine.trackPerformance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommerceTracking('user-123'))

    await act(async () => {
      await result.current.trackShare('set-1')
    })

    expect(mockEngine.trackPerformance).toHaveBeenCalledWith('set-1', {
      type: 'share',
      setId: 'set-1',
      userId: 'user-123',
      timestamp: expect.any(Date)
    })
  })
})

describe('useCompleteTheSet', () => {
  let mockEngine: any
  let mockCartItems: Product[]

  beforeEach(async () => {
    const { createCommerceIntelligence } = await import('../../utils/commerceIntelligence')
    mockEngine = createCommerceIntelligence()

    mockCartItems = [
      {
        id: 'prod-1',
        title: 'Test Product',
        images: [],
        price: { amount: '89.99', currencyCode: 'USD' }
      }
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('generates complete-the-set recommendations from cart items', async () => {
    const mockRecommendations = [
      {
        productId: 'prod-2',
        reason: 'Complete your look',
        confidence: 0.9,
        type: 'complete-set' as const,
        metadata: { complementaryItems: ['prod-1'] }
      }
    ]

    mockEngine.updateRecommendations.mockResolvedValue(mockRecommendations)

    const { result } = renderHook(() => 
      useCompleteTheSet('user-123', mockCartItems)
    )

    await waitFor(() => {
      expect(result.current.recommendations).toEqual(mockRecommendations)
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockEngine.updateRecommendations).toHaveBeenCalledWith(
      'user-123',
      expect.arrayContaining([
        expect.objectContaining({
          userId: 'user-123',
          eventType: 'add_to_cart',
          productId: 'prod-1',
          metadata: expect.objectContaining({
            source: 'cart',
            priceAtTime: 89.99
          })
        })
      ])
    )
  })

  it('clears recommendations when cart is empty', async () => {
    const { result } = renderHook(() => 
      useCompleteTheSet('user-123', [])
    )

    expect(result.current.recommendations).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockEngine.updateRecommendations).not.toHaveBeenCalled()
  })

  it('filters to only complete-set recommendations', async () => {
    const allRecommendations = [
      {
        productId: 'prod-2',
        reason: 'Complete your look',
        confidence: 0.9,
        type: 'complete-set' as const,
        metadata: {}
      },
      {
        productId: 'prod-3',
        reason: 'Similar style',
        confidence: 0.8,
        type: 'style-match' as const,
        metadata: {}
      }
    ]

    mockEngine.updateRecommendations.mockResolvedValue(allRecommendations)

    const { result } = renderHook(() => 
      useCompleteTheSet('user-123', mockCartItems)
    )

    await waitFor(() => {
      expect(result.current.recommendations).toHaveLength(1)
      expect(result.current.recommendations[0].type).toBe('complete-set')
    })
  })

  it('provides refresh function', async () => {
    const mockRecommendations = [
      {
        productId: 'prod-2',
        reason: 'Complete your look',
        confidence: 0.9,
        type: 'complete-set' as const,
        metadata: {}
      }
    ]

    mockEngine.updateRecommendations.mockResolvedValue(mockRecommendations)

    const { result } = renderHook(() => 
      useCompleteTheSet('user-123', mockCartItems)
    )

    await waitFor(() => {
      expect(result.current.recommendations).toHaveLength(1)
    })

    // Clear the mock and call refresh
    mockEngine.updateRecommendations.mockClear()
    mockEngine.updateRecommendations.mockResolvedValue([])

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockEngine.updateRecommendations).toHaveBeenCalledTimes(1)
  })

  it('handles errors gracefully', async () => {
    mockEngine.updateRecommendations.mockRejectedValue(new Error('Failed to get recommendations'))

    const { result } = renderHook(() => 
      useCompleteTheSet('user-123', mockCartItems)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.recommendations).toEqual([])
    })
  })
})