import { useState, useEffect, useCallback } from 'react'
import { createCommerceIntelligence } from '../utils/commerceIntelligence'
import type { 
  ProductSet, 
  ProductRecommendation, 
  CommerceIntelligence,
  PurchaseOption 
} from '../types/commerce'
import type { StyleProfile, BehaviorEvent } from '../types/analytics'
import type { Product } from '../types/story'

interface UseCommerceIntelligenceOptions {
  userId: string
  styleProfile?: StyleProfile
  behaviorEvents?: BehaviorEvent[]
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCommerceIntelligenceReturn {
  productSets: ProductSet[]
  recommendations: ProductRecommendation[]
  isLoading: boolean
  error: string | null
  refreshSets: () => Promise<void>
  updateRecommendations: (events: BehaviorEvent[]) => Promise<void>
  optimizePricing: (productSet: ProductSet) => Promise<PurchaseOption[]>
  trackEvent: (setId: string, eventType: string, productId?: string) => Promise<void>
}

export const useCommerceIntelligence = (
  options: UseCommerceIntelligenceOptions
): UseCommerceIntelligenceReturn => {
  const [productSets, setProductSets] = useState<ProductSet[]>([])
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Create commerce intelligence engine instance
  const [engine] = useState<CommerceIntelligence>(() => createCommerceIntelligence())

  // Generate product sets from style profile
  const refreshSets = useCallback(async () => {
    if (!options.styleProfile) {
      setProductSets([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sets = await engine.generateSets(options.styleProfile)
      setProductSets(sets)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate product sets'
      setError(errorMessage)
      console.error('Error generating product sets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [engine, options.styleProfile])

  // Update recommendations based on behavior events
  const updateRecommendations = useCallback(async (events: BehaviorEvent[]) => {
    if (events.length === 0) {
      setRecommendations([])
      return
    }

    try {
      const recs = await engine.updateRecommendations(options.userId, events)
      setRecommendations(recs)
    } catch (err) {
      console.error('Error updating recommendations:', err)
      // Don't set error state for recommendations as it's not critical
    }
  }, [engine, options.userId])

  // Optimize pricing for a product set
  const optimizePricing = useCallback(async (productSet: ProductSet): Promise<PurchaseOption[]> => {
    try {
      return await engine.optimizePricing(productSet)
    } catch (err) {
      console.error('Error optimizing pricing:', err)
      // Return basic pricing options as fallback
      return [{
        type: 'individual',
        price: productSet.originalPrice,
        currency: 'USD',
        description: 'Buy items separately',
        available: true
      }]
    }
  }, [engine])

  // Track commerce events
  const trackEvent = useCallback(async (
    setId: string, 
    eventType: string, 
    productId?: string
  ) => {
    try {
      await engine.trackPerformance(setId, {
        type: eventType,
        setId,
        productId,
        userId: options.userId,
        timestamp: new Date()
      })
    } catch (err) {
      console.error('Error tracking commerce event:', err)
      // Don't throw error for tracking failures
    }
  }, [engine, options.userId])

  // Initial load and refresh when style profile changes
  useEffect(() => {
    refreshSets()
  }, [refreshSets])

  // Update recommendations when behavior events change
  useEffect(() => {
    if (options.behaviorEvents && options.behaviorEvents.length > 0) {
      updateRecommendations(options.behaviorEvents)
    }
  }, [updateRecommendations, options.behaviorEvents])

  // Auto-refresh functionality
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return

    const interval = setInterval(() => {
      refreshSets()
    }, options.refreshInterval)

    return () => clearInterval(interval)
  }, [options.autoRefresh, options.refreshInterval, refreshSets])

  return {
    productSets,
    recommendations,
    isLoading,
    error,
    refreshSets,
    updateRecommendations,
    optimizePricing,
    trackEvent
  }
}

// Utility hook for tracking commerce interactions
export const useCommerceTracking = (userId: string) => {
  const [engine] = useState<CommerceIntelligence>(() => createCommerceIntelligence())

  const trackSetView = useCallback(async (setId: string) => {
    await engine.trackPerformance(setId, {
      type: 'view',
      setId,
      userId,
      timestamp: new Date()
    })
  }, [engine, userId])

  const trackProductClick = useCallback(async (setId: string, productId: string) => {
    await engine.trackPerformance(setId, {
      type: 'click',
      setId,
      productId,
      userId,
      timestamp: new Date()
    })
  }, [engine, userId])

  const trackAddToCart = useCallback(async (setId: string, productId: string, price: number) => {
    await engine.trackPerformance(setId, {
      type: 'add_to_cart',
      setId,
      productId,
      userId,
      timestamp: new Date(),
      value: price
    })
  }, [engine, userId])

  const trackPurchase = useCallback(async (setId: string, productId: string, price: number) => {
    await engine.trackPerformance(setId, {
      type: 'purchase',
      setId,
      productId,
      userId,
      timestamp: new Date(),
      value: price
    })
  }, [engine, userId])

  const trackShare = useCallback(async (setId: string) => {
    await engine.trackPerformance(setId, {
      type: 'share',
      setId,
      userId,
      timestamp: new Date()
    })
  }, [engine, userId])

  return {
    trackSetView,
    trackProductClick,
    trackAddToCart,
    trackPurchase,
    trackShare
  }
}

// Hook for managing complete-the-set recommendations
export const useCompleteTheSet = (userId: string, cartItems: Product[]) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [engine] = useState<CommerceIntelligence>(() => createCommerceIntelligence())

  const generateCompleteSetRecommendations = useCallback(async () => {
    if (cartItems.length === 0) {
      setRecommendations([])
      return
    }

    setIsLoading(true)
    try {
      // Convert cart items to behavior events
      const behaviorEvents: BehaviorEvent[] = cartItems.map(item => ({
        id: `cart-${item.id}-${Date.now()}`,
        userId,
        eventType: 'add_to_cart',
        productId: item.id,
        timestamp: new Date(),
        sessionId: `session-${Date.now()}`,
        metadata: {
          source: 'cart',
          priceAtTime: parseFloat(item.price.amount)
        }
      }))

      const recs = await engine.updateRecommendations(userId, behaviorEvents)
      const completeSetRecs = recs.filter(rec => rec.type === 'complete-set')
      setRecommendations(completeSetRecs)
    } catch (err) {
      console.error('Error generating complete-the-set recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [engine, userId, cartItems])

  useEffect(() => {
    generateCompleteSetRecommendations()
  }, [generateCompleteSetRecommendations])

  return {
    recommendations,
    isLoading,
    refresh: generateCompleteSetRecommendations
  }
}