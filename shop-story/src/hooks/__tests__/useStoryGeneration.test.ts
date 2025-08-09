// useStoryGeneration hook integration tests
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStoryGeneration, useStoryTypeGeneration } from '../useStoryGeneration'
import type { BehaviorEvent } from '../../types/analytics'

// Mock the analytics engine and story generator
vi.mock('../../utils/analyticsEngine', () => ({
  createAnalyticsEngine: vi.fn(() => ({
    processEvents: vi.fn().mockResolvedValue({
      userId: 'test-user',
      dominantColors: [
        { color: '#2D5016', name: 'Forest Green', frequency: 0.3, confidence: 0.8, season: 'fall' }
      ],
      preferredBrands: [
        { brandName: 'Nike', affinity: 0.8, purchaseCount: 5, averageSpend: 89.99, lastPurchase: new Date(), categories: ['clothing'] }
      ],
      categoryPreferences: [
        { category: 'clothing', weight: 0.6, purchaseFrequency: 8, averageSpend: 75.50, trendDirection: 'increasing' }
      ],
      priceRanges: [
        { category: 'clothing', min: 25, max: 150, average: 75, currency: 'USD', frequency: 8 }
      ],
      seasonalTrends: [
        { season: 'fall', year: 2024, dominantColors: ['#2D5016'], topCategories: ['clothing'], spendingPattern: 75, styleEvolution: 0.2 }
      ],
      evolutionScore: 0.3,
      lastUpdated: new Date()
    }),
    generateInsights: vi.fn().mockResolvedValue([
      {
        id: 'insight-1',
        type: 'color-preference',
        title: 'Your signature color: Forest Green',
        description: 'Forest Green appears in 30% of your style choices',
        confidence: 0.8,
        data: { color: '#2D5016', frequency: 0.3 },
        visualType: 'color-palette'
      }
    ])
  }))
}))

vi.mock('../../utils/storyGeneration', () => ({
  createStoryGenerator: vi.fn(() => ({
    generateStory: vi.fn().mockResolvedValue({
      id: 'story-1',
      type: 'behavioral',
      title: 'Your Forest Green Style DNA',
      insights: [
        {
          id: 'insight-1',
          type: 'color-preference',
          title: 'Your signature color: Forest Green',
          description: 'Forest Green appears in 30% of your style choices',
          confidence: 0.8,
          data: { color: '#2D5016', frequency: 0.3 },
          visualType: 'color-palette'
        }
      ],
      visualElements: [
        {
          id: 'element-1',
          type: 'text-overlay',
          position: { x: 0.1, y: 0.1, z: 1 },
          size: { width: 0.8, height: 0.15 },
          style: { fontSize: '24px', fontWeight: 'bold' },
          data: { text: 'Your Forest Green Style' }
        }
      ],
      shareableContent: {
        title: 'My Style DNA',
        description: 'Discovered my signature style: Forest Green colors and Nike brands',
        hashtags: ['#StyleDNA', '#ShopStory', '#MyStyle', '#Behavioral'],
        platforms: ['instagram', 'tiktok', 'twitter'],
        exportFormats: ['story-9x16', 'post-1x1']
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000) // 1 week
    }),
    generateStorySet: vi.fn().mockResolvedValue([
      {
        id: 'story-1',
        type: 'behavioral',
        title: 'Your Forest Green Style DNA',
        insights: [],
        visualElements: [],
        shareableContent: {
          title: 'My Style DNA',
          description: 'Test description',
          hashtags: [],
          platforms: [],
          exportFormats: []
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
      }
    ]),
    shouldRefreshStories: vi.fn().mockReturnValue(false),
    getActiveStories: vi.fn().mockImplementation((stories) => stories)
  }))
}))

describe('useStoryGeneration', () => {
  const mockUserId = 'test-user'

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => 'mock-session-id'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('basic functionality', () => {
    it('should initialize with empty stories and loading state', () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      expect(result.current.stories).toEqual([])
      expect(result.current.isLoading).toBe(true) // Should be loading initially
      expect(result.current.error).toBe(null)
    })

    it('should generate initial story set on mount', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.stories.length).toBeGreaterThan(0)
      expect(result.current.stories[0].type).toBe('behavioral')
      expect(result.current.error).toBe(null)
    })

    it('should provide generateStory function', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let generatedStory: any = null

      await act(async () => {
        generatedStory = await result.current.generateStory('behavioral')
      })

      expect(generatedStory).toBeDefined()
      expect(generatedStory.type).toBe('behavioral')
      expect(generatedStory.title).toContain('Forest Green')
    })

    it('should provide generateStorySet function', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let stories: any[] = []

      await act(async () => {
        stories = await result.current.generateStorySet()
      })

      expect(stories.length).toBeGreaterThan(0)
      expect(stories[0].type).toBe('behavioral')
    })

    it('should provide refreshStories function', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshStories()
      })

      expect(result.current.stories.length).toBeGreaterThan(0)
      expect(result.current.error).toBe(null)
    })

    it('should provide clearError function', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      // Set an error state
      await act(async () => {
        // Force an error by mocking the analytics engine to throw
        const mockAnalyticsEngine = require('../../utils/analyticsEngine').createAnalyticsEngine()
        mockAnalyticsEngine.processEvents.mockRejectedValueOnce(new Error('Test error'))
        
        await result.current.generateStory('behavioral')
      })

      expect(result.current.error).toBeTruthy()

      await act(async () => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('error handling', () => {
    it('should handle errors when generating stories', async () => {
      // Mock analytics engine to throw error
      const mockAnalyticsEngine = require('../../utils/analyticsEngine').createAnalyticsEngine()
      mockAnalyticsEngine.processEvents.mockRejectedValueOnce(new Error('Insufficient behavior data'))

      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toContain('Insufficient behavior data')
      expect(result.current.stories).toEqual([])
    })

    it('should handle errors when generating story sets', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      // Mock story generator to throw error
      const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
      mockStoryGenerator.generateStorySet.mockRejectedValueOnce(new Error('Generation failed'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let stories: any[] = []

      await act(async () => {
        stories = await result.current.generateStorySet()
      })

      expect(stories).toEqual([])
      expect(result.current.error).toContain('Generation failed')
    })

    it('should handle errors when refreshing stories', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock story generator to throw error on refresh
      const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
      mockStoryGenerator.generateStorySet.mockRejectedValueOnce(new Error('Refresh failed'))

      await act(async () => {
        await result.current.refreshStories()
      })

      expect(result.current.error).toContain('Refresh failed')
    })
  })

  describe('options handling', () => {
    it('should respect maxStories option', async () => {
      const { result } = renderHook(() => 
        useStoryGeneration({ userId: mockUserId, maxStories: 2 })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock multiple stories
      const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
      mockStoryGenerator.generateStorySet.mockResolvedValueOnce([
        { id: 'story-1', type: 'behavioral' },
        { id: 'story-2', type: 'recap' },
        { id: 'story-3', type: 'seasonal' }
      ])

      await act(async () => {
        await result.current.generateStorySet()
      })

      expect(result.current.stories).toHaveLength(2)
    })

    it('should handle autoRefresh option', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => 
        useStoryGeneration({ 
          userId: mockUserId, 
          autoRefresh: true, 
          refreshInterval: 1000 
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialStoryCount = result.current.stories.length

      // Fast-forward time to trigger refresh
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.stories.length).toBeGreaterThanOrEqual(initialStoryCount)
      })

      vi.useRealTimers()
    })
  })

  describe('story management', () => {
    it('should add new stories to existing list', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCount = result.current.stories.length

      // Mock a different story type
      const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
      mockStoryGenerator.generateStory.mockResolvedValueOnce({
        id: 'story-2',
        type: 'recap',
        title: 'Monthly Recap',
        insights: [],
        visualElements: [],
        shareableContent: {
          title: 'My Monthly Recap',
          description: 'Test description',
          hashtags: [],
          platforms: [],
          exportFormats: []
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
      })

      await act(async () => {
        await result.current.generateStory('recap')
      })

      expect(result.current.stories).toHaveLength(initialCount + 1)
      expect(result.current.stories.some(s => s.type === 'recap')).toBe(true)
    })

    it('should sort stories by creation date (newest first)', async () => {
      const { result } = renderHook(() => useStoryGeneration({ userId: mockUserId }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock stories with different creation dates
      const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
      
      const olderStory = {
        id: 'story-old',
        type: 'behavioral',
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        insights: [],
        visualElements: [],
        shareableContent: { title: '', description: '', hashtags: [], platforms: [], exportFormats: [] }
      }

      const newerStory = {
        id: 'story-new',
        type: 'recap',
        createdAt: new Date(), // Now
        insights: [],
        visualElements: [],
        shareableContent: { title: '', description: '', hashtags: [], platforms: [], exportFormats: [] }
      }

      mockStoryGenerator.generateStory
        .mockResolvedValueOnce(olderStory)
        .mockResolvedValueOnce(newerStory)

      await act(async () => {
        await result.current.generateStory('behavioral')
        await result.current.generateStory('recap')
      })

      expect(result.current.stories[0].id).toBe('story-new')
      expect(result.current.stories[1].id).toBe('story-old')
    })
  })
})

describe('useStoryTypeGeneration', () => {
  const mockUserId = 'test-user'

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => 'mock-session-id'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  it('should provide type-specific generation functions', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    expect(result.current.generateBehavioralStory).toBeDefined()
    expect(result.current.generateStyleEvolutionStory).toBeDefined()
    expect(result.current.generateMonthlyRecap).toBeDefined()
    expect(result.current.generateSeasonalStory).toBeDefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should generate behavioral story', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    let story: any = null

    await act(async () => {
      story = await result.current.generateBehavioralStory()
    })

    expect(story).toBeDefined()
    expect(story.type).toBe('behavioral')
  })

  it('should generate style evolution story', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    let story: any = null

    await act(async () => {
      story = await result.current.generateStyleEvolutionStory()
    })

    expect(story).toBeDefined()
    expect(story.type).toBe('behavioral') // Mock returns behavioral type
  })

  it('should generate monthly recap', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    let story: any = null

    await act(async () => {
      story = await result.current.generateMonthlyRecap()
    })

    expect(story).toBeDefined()
    expect(story.type).toBe('behavioral') // Mock returns behavioral type
  })

  it('should generate seasonal story', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    let story: any = null

    await act(async () => {
      story = await result.current.generateSeasonalStory()
    })

    expect(story).toBeDefined()
    expect(story.type).toBe('behavioral') // Mock returns behavioral type
  })

  it('should pass options to generation functions', async () => {
    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    const options = { includeProducts: true, maxInsights: 2 }

    await act(async () => {
      await result.current.generateBehavioralStory(options)
    })

    const mockStoryGenerator = require('../../utils/storyGeneration').createStoryGenerator()
    expect(mockStoryGenerator.generateStory).toHaveBeenCalledWith(
      'behavioral',
      expect.any(Object), // profile
      expect.any(Array),  // insights
      options
    )
  })

  it('should share loading and error state with main hook', async () => {
    // Mock error in analytics engine
    const mockAnalyticsEngine = require('../../utils/analyticsEngine').createAnalyticsEngine()
    mockAnalyticsEngine.processEvents.mockRejectedValueOnce(new Error('Test error'))

    const { result } = renderHook(() => useStoryTypeGeneration(mockUserId))

    await act(async () => {
      await result.current.generateBehavioralStory()
    })

    expect(result.current.error).toContain('Test error')
  })
})