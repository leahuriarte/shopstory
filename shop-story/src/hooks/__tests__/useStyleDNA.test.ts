// Unit tests for useStyleDNA hook
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStyleDNA } from '../useStyleDNA'
import * as storage from '../../utils/storage'
import type { StyleProfile, BehaviorEvent } from '../../types/analytics'

// Mock the storage utilities
vi.mock('../../utils/storage', () => ({
  loadStyleProfile: vi.fn(() => null),
  saveStyleProfile: vi.fn(),
  getStoredEvents: vi.fn(() => [])
}))

describe('useStyleDNA', () => {
  const mockUserId = 'test-user-123'

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
      purchaseCount: 3,
      averageSpend: 120,
      lastPurchase: new Date(),
      categories: ['shoes']
    }],
    categoryPreferences: [{
      category: 'shoes',
      weight: 0.7,
      purchaseFrequency: 2,
      averageSpend: 150,
      trendDirection: 'increasing'
    }],
    priceRanges: [{
      category: 'shoes',
      min: 80,
      max: 200,
      average: 140,
      currency: 'USD',
      frequency: 3
    }],
    seasonalTrends: [{
      season: 'fall',
      year: 2024,
      dominantColors: ['#8B4513'],
      topCategories: ['shoes'],
      spendingPattern: 120,
      styleEvolution: 0.2
    }],
    evolutionScore: 0.3,
    lastUpdated: new Date()
  }

  const mockEvents: BehaviorEvent[] = [
    {
      id: 'event-1',
      userId: mockUserId,
      eventType: 'view',
      productId: 'product-1',
      categoryId: 'shoes',
      brandName: 'Nike',
      timestamp: new Date(),
      sessionId: 'session-1',
      metadata: { source: 'browse', priceAtTime: 150 }
    },
    {
      id: 'event-2',
      userId: mockUserId,
      eventType: 'purchase',
      productId: 'product-1',
      categoryId: 'shoes',
      brandName: 'Nike',
      timestamp: new Date(),
      sessionId: 'session-1',
      metadata: { source: 'browse', priceAtTime: 150 }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null profile', () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.evolutionScore).toBe(0)
  })

  it('should load existing profile on mount', async () => {
    vi.mocked(storage.loadStyleProfile).mockReturnValue(mockProfile)

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile)
    })

    expect(storage.loadStyleProfile).toHaveBeenCalled()
  })

  it('should not load profile for different user', async () => {
    const differentUserProfile = { ...mockProfile, userId: 'different-user' }
    vi.mocked(storage.loadStyleProfile).mockReturnValue(differentUserProfile)

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await waitFor(() => {
      expect(result.current.profile).toBeNull()
    })
  })

  it('should handle loading errors', async () => {
    vi.mocked(storage.loadStyleProfile).mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await waitFor(() => {
      expect(result.current.error).toBe('Storage error')
    })
  })

  it('should update profile with new events', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await act(async () => {
      await result.current.updateProfile(mockEvents)
    })

    expect(result.current.profile).not.toBeNull()
    expect(result.current.profile?.userId).toBe(mockUserId)
    expect(result.current.profile?.preferredBrands).toHaveLength(1)
    expect(result.current.profile?.preferredBrands[0].brandName).toBe('Nike')
    expect(storage.saveStyleProfile).toHaveBeenCalled()
  })

  it('should handle insufficient data error', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await act(async () => {
      await result.current.updateProfile([])
    })

    expect(result.current.error).toBe('Insufficient data to calculate Style DNA')
    expect(result.current.profile).toBeNull()
  })

  it('should refresh profile from stored events', async () => {
    vi.mocked(storage.getStoredEvents).mockReturnValue(mockEvents)

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await act(async () => {
      await result.current.refreshProfile()
    })

    expect(result.current.profile).not.toBeNull()
    expect(storage.getStoredEvents).toHaveBeenCalledWith(mockUserId)
  })

  it('should handle refresh with no stored events', async () => {
    vi.mocked(storage.getStoredEvents).mockReturnValue([])

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await act(async () => {
      await result.current.refreshProfile()
    })

    expect(result.current.error).toBe('No behavior data available for profile calculation')
  })

  it('should generate insights from profile', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    // First update profile
    await act(async () => {
      await result.current.updateProfile(mockEvents)
    })

    // Then get insights
    let insights: any[] = []
    await act(async () => {
      insights = await result.current.getInsights()
    })

    expect(insights.length).toBeGreaterThan(0)
    expect(insights[0]).toHaveProperty('id')
    expect(insights[0]).toHaveProperty('type')
    expect(insights[0]).toHaveProperty('title')
    expect(insights[0]).toHaveProperty('confidence')
  })

  it('should throw error when getting insights without profile', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await expect(result.current.getInsights()).rejects.toThrow('No Style DNA profile available')
  })

  it('should calculate evolution score', async () => {
    // Set up initial profile
    vi.mocked(storage.loadStyleProfile).mockReturnValue(mockProfile)

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    await waitFor(() => {
      expect(result.current.evolutionScore).toBe(0.3)
    })

    // Update with new events
    const newEvents = [
      ...mockEvents,
      {
        id: 'event-3',
        userId: mockUserId,
        eventType: 'purchase',
        productId: 'product-2',
        categoryId: 'clothing',
        brandName: 'Adidas',
        timestamp: new Date(),
        sessionId: 'session-2',
        metadata: { source: 'browse', priceAtTime: 80 }
      }
    ]

    await act(async () => {
      await result.current.updateProfile(newEvents)
    })

    // Evolution score should be calculated
    expect(result.current.evolutionScore).toBeDefined()
    expect(typeof result.current.evolutionScore).toBe('number')
  })

  it('should set loading state during operations', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Start the update operation
    act(() => {
      result.current.updateProfile(mockEvents)
    })

    // Should be loading during the operation
    expect(result.current.isLoading).toBe(true)

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should filter events for correct user when updating profile', async () => {
    const eventsWithDifferentUsers = [
      ...mockEvents,
      {
        id: 'event-other',
        userId: 'other-user',
        eventType: 'purchase' as const,
        productId: 'product-other',
        categoryId: 'other-category',
        brandName: 'Other Brand',
        timestamp: new Date(),
        sessionId: 'session-other',
        metadata: { source: 'browse' as const, priceAtTime: 200 }
      }
    ]

    const { result } = renderHook(() => useStyleDNA(mockUserId))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateProfile(eventsWithDifferentUsers)
    })

    // Should only process events for the correct user
    expect(result.current.profile?.preferredBrands).toHaveLength(1)
    expect(result.current.profile?.preferredBrands[0].brandName).toBe('Nike')
  })

  it('should handle multiple rapid updates', async () => {
    vi.mocked(storage.getStoredEvents).mockReturnValue(mockEvents)
    
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Fire multiple updates rapidly
    await act(async () => {
      await result.current.updateProfile(mockEvents.slice(0, 1))
    })

    await act(async () => {
      await result.current.updateProfile(mockEvents)
    })

    await act(async () => {
      await result.current.refreshProfile()
    })

    // Should handle all updates without errors
    expect(result.current.profile).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should clear error on successful operation', async () => {
    const { result } = renderHook(() => useStyleDNA(mockUserId))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // First cause an error
    await act(async () => {
      await result.current.updateProfile([])
    })

    expect(result.current.error).not.toBeNull()

    // Then perform successful operation
    await act(async () => {
      await result.current.updateProfile(mockEvents)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.profile).not.toBeNull()
  })
})