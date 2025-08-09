// useStoryGeneration hook
import { useState, useEffect, useCallback } from 'react'
import type { StoryData, Insight } from '../types/story'
import type { StyleProfile, BehaviorEvent } from '../types/analytics'
import { createStoryGenerator, type StoryGenerationOptions, type StoryType } from '../utils/storyGeneration'
import { createAnalyticsEngine } from '../utils/analyticsEngine'

export interface UseStoryGenerationOptions {
  userId: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
  maxStories?: number
}

export interface UseStoryGenerationReturn {
  stories: StoryData[]
  isLoading: boolean
  error: string | null
  generateStory: (type: StoryType, options?: StoryGenerationOptions) => Promise<StoryData | null>
  generateStorySet: (options?: StoryGenerationOptions) => Promise<StoryData[]>
  refreshStories: () => Promise<void>
  clearError: () => void
}

export const useStoryGeneration = (options: UseStoryGenerationOptions): UseStoryGenerationReturn => {
  const [stories, setStories] = useState<StoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storyGenerator = createStoryGenerator()
  const analyticsEngine = createAnalyticsEngine(options.userId)

  /**
   * Generate a single story
   */
  const generateStory = useCallback(async (
    type: StoryType,
    generationOptions: StoryGenerationOptions = {}
  ): Promise<StoryData | null> => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user's behavior events (would come from storage/API in real implementation)
      const behaviorEvents = await getBehaviorEvents(options.userId)
      
      if (behaviorEvents.length === 0) {
        throw new Error('Insufficient behavior data to generate story')
      }

      // Generate Style DNA profile
      const profile = await analyticsEngine.processEvents(behaviorEvents)
      
      // Generate insights from profile
      const insights = await analyticsEngine.generateInsights(profile)

      if (insights.length === 0) {
        throw new Error('No insights available to generate story')
      }

      // Generate the story
      const story = await storyGenerator.generateStory(type, profile, insights, generationOptions)

      // Add to stories list
      setStories(prev => {
        const filtered = prev.filter(s => s.type !== type || s.id !== story.id)
        return [...filtered, story].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      })

      return story
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options.userId, storyGenerator, analyticsEngine])

  /**
   * Generate a complete set of stories
   */
  const generateStorySet = useCallback(async (
    generationOptions: StoryGenerationOptions = {}
  ): Promise<StoryData[]> => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user's behavior events
      const behaviorEvents = await getBehaviorEvents(options.userId)
      
      if (behaviorEvents.length === 0) {
        throw new Error('Insufficient behavior data to generate stories')
      }

      // Generate Style DNA profile
      const profile = await analyticsEngine.processEvents(behaviorEvents)
      
      // Generate insights from profile
      const insights = await analyticsEngine.generateInsights(profile)

      if (insights.length === 0) {
        throw new Error('No insights available to generate stories')
      }

      // Generate story set
      const newStories = await storyGenerator.generateStorySet(
        profile,
        insights,
        behaviorEvents,
        generationOptions
      )

      // Limit stories if specified
      const limitedStories = options.maxStories 
        ? newStories.slice(0, options.maxStories)
        : newStories

      setStories(limitedStories)
      return limitedStories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story set'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [options.userId, options.maxStories, storyGenerator, analyticsEngine])

  /**
   * Refresh stories (remove expired, generate new if needed)
   */
  const refreshStories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Remove expired stories
      const activeStories = storyGenerator.getActiveStories(stories)
      
      // Check if we need to generate new stories
      const shouldRefresh = storyGenerator.shouldRefreshStories(stories) || activeStories.length === 0

      if (shouldRefresh) {
        await generateStorySet()
      } else {
        setStories(activeStories)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh stories'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [stories, storyGenerator, generateStorySet])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (!options.autoRefresh) return

    const interval = setInterval(() => {
      refreshStories()
    }, options.refreshInterval || 60000) // Default 1 minute

    return () => clearInterval(interval)
  }, [options.autoRefresh, options.refreshInterval, refreshStories])

  /**
   * Initial story generation
   */
  useEffect(() => {
    if (stories.length === 0) {
      generateStorySet()
    }
  }, []) // Only run once on mount

  return {
    stories,
    isLoading,
    error,
    generateStory,
    generateStorySet,
    refreshStories,
    clearError
  }
}

/**
 * Mock function to get behavior events
 * In production, this would fetch from storage or API
 */
async function getBehaviorEvents(userId: string): Promise<BehaviorEvent[]> {
  // Mock behavior events for development
  const mockEvents: BehaviorEvent[] = [
    {
      id: 'event-1',
      userId,
      eventType: 'view',
      productId: 'product-1',
      categoryId: 'clothing',
      brandName: 'Nike',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      sessionId: 'session-1',
      metadata: {
        source: 'browse',
        duration: 5000,
        priceAtTime: 89.99
      }
    },
    {
      id: 'event-2',
      userId,
      eventType: 'purchase',
      productId: 'product-1',
      categoryId: 'clothing',
      brandName: 'Nike',
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
      sessionId: 'session-1',
      metadata: {
        source: 'browse',
        priceAtTime: 89.99
      }
    },
    {
      id: 'event-3',
      userId,
      eventType: 'view',
      productId: 'product-2',
      categoryId: 'shoes',
      brandName: 'Adidas',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      sessionId: 'session-2',
      metadata: {
        source: 'recommendation',
        duration: 8000,
        priceAtTime: 129.99
      }
    },
    {
      id: 'event-4',
      userId,
      eventType: 'add_to_cart',
      productId: 'product-3',
      categoryId: 'accessories',
      brandName: 'Apple',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      sessionId: 'session-3',
      metadata: {
        source: 'search',
        priceAtTime: 199.99
      }
    },
    {
      id: 'event-5',
      userId,
      eventType: 'view',
      productId: 'product-4',
      categoryId: 'clothing',
      brandName: 'Zara',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      sessionId: 'session-4',
      metadata: {
        source: 'browse',
        duration: 3000,
        priceAtTime: 49.99
      }
    }
  ]

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockEvents
}

/**
 * Hook for generating specific story types
 */
export const useStoryTypeGeneration = (userId: string) => {
  const { generateStory, isLoading, error } = useStoryGeneration({ userId })

  return {
    generateBehavioralStory: (options?: StoryGenerationOptions) => 
      generateStory('behavioral', options),
    generateStyleEvolutionStory: (options?: StoryGenerationOptions) => 
      generateStory('style-evolution', options),
    generateMonthlyRecap: (options?: StoryGenerationOptions) => 
      generateStory('recap', options),
    generateSeasonalStory: (options?: StoryGenerationOptions) => 
      generateStory('seasonal', options),
    isLoading,
    error
  }
}