// Story generation integration tests
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StoryGenerator, createStoryGenerator, validateStoryData } from '../storyGeneration'
import type { StyleProfile, BehaviorEvent } from '../../types/analytics'
import type { Insight } from '../../types/story'

describe('StoryGenerator', () => {
  let storyGenerator: StoryGenerator
  let mockProfile: StyleProfile
  let mockInsights: Insight[]
  let mockEvents: BehaviorEvent[]

  beforeEach(() => {
    storyGenerator = createStoryGenerator()
    
    mockProfile = {
      userId: 'test-user',
      dominantColors: [
        { color: '#2D5016', name: 'Forest Green', frequency: 0.3, confidence: 0.8, season: 'fall' },
        { color: '#8B4513', name: 'Saddle Brown', frequency: 0.25, confidence: 0.7, season: 'fall' }
      ],
      preferredBrands: [
        { brandName: 'Nike', affinity: 0.8, purchaseCount: 5, averageSpend: 89.99, lastPurchase: new Date(), categories: ['clothing', 'shoes'] }
      ],
      categoryPreferences: [
        { category: 'clothing', weight: 0.6, purchaseFrequency: 8, averageSpend: 75.50, trendDirection: 'increasing' },
        { category: 'shoes', weight: 0.4, purchaseFrequency: 3, averageSpend: 120.00, trendDirection: 'stable' }
      ],
      priceRanges: [
        { category: 'clothing', min: 25, max: 150, average: 75, currency: 'USD', frequency: 8 }
      ],
      seasonalTrends: [
        { season: 'fall', year: 2024, dominantColors: ['#2D5016', '#8B4513'], topCategories: ['clothing'], spendingPattern: 75, styleEvolution: 0.2 }
      ],
      evolutionScore: 0.3,
      lastUpdated: new Date()
    }

    mockInsights = [
      {
        id: 'insight-1',
        type: 'color-preference',
        title: 'Your signature color: Forest Green',
        description: 'Forest Green appears in 30% of your style choices',
        confidence: 0.8,
        data: { color: '#2D5016', frequency: 0.3 },
        visualType: 'color-palette'
      },
      {
        id: 'insight-2',
        type: 'brand-affinity',
        title: 'Brand loyalty: Nike',
        description: 'You\'ve made 5 purchases from Nike',
        confidence: 0.8,
        data: { brand: 'Nike', purchaseCount: 5 },
        visualType: 'brand-cloud'
      },
      {
        id: 'insight-3',
        type: 'category-trend',
        title: 'Style focus: clothing',
        description: 'Clothing represents 60% of your style DNA',
        confidence: 0.6,
        data: { category: 'clothing', trend: 'increasing' },
        visualType: 'chart'
      }
    ]

    mockEvents = [
      {
        id: 'event-1',
        userId: 'test-user',
        eventType: 'purchase',
        productId: 'product-1',
        categoryId: 'clothing',
        brandName: 'Nike',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        sessionId: 'session-1',
        metadata: { source: 'browse', priceAtTime: 89.99 }
      },
      {
        id: 'event-2',
        userId: 'test-user',
        eventType: 'view',
        productId: 'product-2',
        categoryId: 'shoes',
        brandName: 'Adidas',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        sessionId: 'session-2',
        metadata: { source: 'recommendation', duration: 5000, priceAtTime: 129.99 }
      }
    ]
  })

  describe('generateStory', () => {
    it('should generate a behavioral story with correct structure', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)

      expect(story).toBeDefined()
      expect(story.type).toBe('behavioral')
      expect(story.title).toContain('Forest Green')
      expect(story.insights).toHaveLength(3)
      expect(story.visualElements.length).toBeGreaterThan(0)
      expect(story.shareableContent).toBeDefined()
      expect(story.createdAt).toBeInstanceOf(Date)
      expect(story.expiresAt).toBeInstanceOf(Date)
    })

    it('should generate a style evolution story', async () => {
      const story = await storyGenerator.generateStyleEvolutionStory(
        mockProfile,
        { ...mockProfile, evolutionScore: 0.1 }, // previous profile
        mockInsights
      )

      expect(story).toBeDefined()
      expect(story.type).toBe('style-evolution')
      expect(story.title).toContain('Evolution')
      expect(story.insights.length).toBeGreaterThan(0) // Should have insights
    })

    it('should generate a monthly recap story', async () => {
      const story = await storyGenerator.generateMonthlyRecap(mockProfile, mockEvents, mockInsights)

      expect(story).toBeDefined()
      expect(story.type).toBe('recap')
      expect(story.title).toContain('Recap')
      expect(story.insights.length).toBeGreaterThanOrEqual(mockInsights.length) // Should have additional recap insights
    })

    it('should generate a seasonal story', async () => {
      const story = await storyGenerator.generateSeasonalStory(mockProfile, 'fall', mockInsights)

      expect(story).toBeDefined()
      expect(story.type).toBe('seasonal')
      expect(story.title).toContain('Style')
    })

    it('should include shoppable products when requested', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights, {
        includeProducts: true
      })

      expect(story.shoppableProducts).toBeDefined()
      expect(story.shoppableProducts!.length).toBeGreaterThan(0)
      expect(story.shoppableProducts![0]).toHaveProperty('id')
      expect(story.shoppableProducts![0]).toHaveProperty('title')
      expect(story.shoppableProducts![0]).toHaveProperty('price')
    })

    it('should limit insights based on maxInsights option', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights, {
        maxInsights: 2
      })

      expect(story.insights).toHaveLength(2)
    })

    it('should set appropriate expiration times for different story types', async () => {
      const behavioralStory = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)
      const recapStory = await storyGenerator.generateMonthlyRecap(mockProfile, mockEvents, mockInsights)

      const behavioralExpiration = behavioralStory.expiresAt!.getTime() - behavioralStory.createdAt.getTime()
      const recapExpiration = recapStory.expiresAt!.getTime() - recapStory.createdAt.getTime()

      // Behavioral stories should expire in 1 week (168 hours)
      expect(behavioralExpiration).toBe(168 * 60 * 60 * 1000)
      
      // Recap stories should expire in 1 week (168 hours)
      expect(recapExpiration).toBe(168 * 60 * 60 * 1000)
    })
  })

  describe('generateStorySet', () => {
    it('should generate multiple stories for a user', async () => {
      const stories = await storyGenerator.generateStorySet(mockProfile, mockInsights, mockEvents)

      expect(stories).toBeDefined()
      expect(stories.length).toBeGreaterThan(0)
      expect(stories.length).toBeLessThanOrEqual(3) // Should not exceed reasonable limit

      // Should include at least a behavioral story
      const behavioralStory = stories.find(s => s.type === 'behavioral')
      expect(behavioralStory).toBeDefined()
    })

    it('should generate recap story when sufficient recent events exist', async () => {
      // Add more recent events to trigger recap generation
      const recentEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvents[0],
        id: `event-recent-${i}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000) // Spread over last 10 hours
      }))

      const stories = await storyGenerator.generateStorySet(mockProfile, mockInsights, recentEvents)
      const recapStory = stories.find(s => s.type === 'recap')
      
      expect(recapStory).toBeDefined()
    })

    it('should generate seasonal story when seasonal insights exist', async () => {
      const seasonalInsights = [
        ...mockInsights,
        {
          id: 'seasonal-insight',
          type: 'seasonal-shift' as const,
          title: 'Fall Style Evolution',
          description: 'Your fall style is more experimental this year',
          confidence: 0.7,
          data: { season: 'fall', evolution: 0.2 },
          visualType: 'trend-line' as const
        }
      ]

      const stories = await storyGenerator.generateStorySet(mockProfile, seasonalInsights, mockEvents)
      const seasonalStory = stories.find(s => s.type === 'seasonal')
      
      expect(seasonalStory).toBeDefined()
    })
  })

  describe('story expiration and refresh logic', () => {
    it('should correctly identify expired stories', () => {
      const expiredStory = {
        ...mockInsights[0],
        id: 'expired-story',
        type: 'behavioral' as const,
        title: 'Expired Story',
        insights: mockInsights,
        visualElements: [],
        shareableContent: {
          title: 'Test',
          description: 'Test',
          hashtags: [],
          platforms: [],
          exportFormats: []
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 60 * 60 * 1000) // Expired 1 hour ago
      }

      const activeStory = {
        ...expiredStory,
        id: 'active-story',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
      }

      const stories = [expiredStory, activeStory]
      
      expect(storyGenerator.shouldRefreshStories(stories)).toBe(true)
      
      const activeStories = storyGenerator.getActiveStories(stories)
      expect(activeStories).toHaveLength(1)
      expect(activeStories[0].id).toBe('active-story')
    })

    it('should handle stories without expiration dates', () => {
      const storyWithoutExpiration = {
        id: 'no-expiration',
        type: 'behavioral' as const,
        title: 'No Expiration',
        insights: mockInsights,
        visualElements: [],
        shareableContent: {
          title: 'Test',
          description: 'Test',
          hashtags: [],
          platforms: [],
          exportFormats: []
        },
        createdAt: new Date()
        // No expiresAt property
      }

      const stories = [storyWithoutExpiration]
      
      expect(storyGenerator.shouldRefreshStories(stories)).toBe(false)
      
      const activeStories = storyGenerator.getActiveStories(stories)
      expect(activeStories).toHaveLength(1)
    })
  })

  describe('visual elements generation', () => {
    it('should generate appropriate visual elements for behavioral stories', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)

      expect(story.visualElements.length).toBeGreaterThan(0)
      
      // Should have title element
      const titleElement = story.visualElements.find(el => el.type === 'text-overlay')
      expect(titleElement).toBeDefined()
      
      // Should have color swatch for color preferences
      const colorElement = story.visualElements.find(el => el.type === 'color-swatch')
      expect(colorElement).toBeDefined()
      
      // Should have chart for category preferences
      const chartElement = story.visualElements.find(el => el.type === 'chart')
      expect(chartElement).toBeDefined()
    })

    it('should bind data correctly to visual elements', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)

      const colorElement = story.visualElements.find(el => el.type === 'color-swatch')
      expect(colorElement?.data).toBeDefined()
      expect(colorElement?.data.colors).toBeDefined()
      expect(colorElement?.data.colors.length).toBeGreaterThan(0)

      const chartElement = story.visualElements.find(el => el.type === 'chart')
      expect(chartElement?.data).toBeDefined()
      expect(chartElement?.data.data).toBeDefined()
    })
  })

  describe('shareable content generation', () => {
    it('should generate appropriate shareable content for each story type', async () => {
      const behavioralStory = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)
      const recapStory = await storyGenerator.generateMonthlyRecap(mockProfile, mockEvents, mockInsights)

      expect(behavioralStory.shareableContent.title).toBe('My Style DNA')
      expect(behavioralStory.shareableContent.hashtags).toContain('#StyleDNA')
      expect(behavioralStory.shareableContent.platforms).toContain('instagram')
      expect(behavioralStory.shareableContent.exportFormats).toContain('story-9x16')

      expect(recapStory.shareableContent.title).toBe('My Monthly Style Recap')
      expect(recapStory.shareableContent.hashtags).toContain('#Recap')
    })

    it('should include relevant data in shareable descriptions', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, mockInsights)

      expect(story.shareableContent.description).toContain('Forest Green')
      expect(story.shareableContent.description).toContain('Nike')
    })
  })

  describe('error handling', () => {
    it('should throw error when no templates exist for story type', async () => {
      // Create a generator with no templates
      const emptyGenerator = new (StoryGenerator as any)()
      emptyGenerator.templates = new Map()

      await expect(
        emptyGenerator.generateStory('behavioral', mockProfile, mockInsights)
      ).rejects.toThrow('No templates found for story type: behavioral')
    })

    it('should handle empty insights gracefully', async () => {
      const story = await storyGenerator.generateStory('behavioral', mockProfile, [])

      expect(story.insights).toHaveLength(0)
      expect(story.visualElements.length).toBeGreaterThan(0) // Should still have basic visual elements
    })
  })
})

describe('validateStoryData', () => {
  let validStory: any

  beforeEach(() => {
    validStory = {
      id: 'story-1',
      type: 'behavioral',
      title: 'Test Story',
      insights: [
        {
          id: 'insight-1',
          type: 'color-preference',
          title: 'Test Insight',
          description: 'Test description',
          confidence: 0.8,
          data: {},
          visualType: 'color-palette'
        }
      ],
      visualElements: [
        {
          id: 'element-1',
          type: 'text-overlay',
          position: { x: 0, y: 0 },
          size: { width: 1, height: 0.1 },
          style: {}
        }
      ],
      shareableContent: {
        title: 'Test',
        description: 'Test',
        hashtags: [],
        platforms: [],
        exportFormats: []
      },
      createdAt: new Date()
    }
  })

  it('should validate a correct story', () => {
    const result = validateStoryData(validStory)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect missing required fields', () => {
    delete validStory.id
    delete validStory.title

    const result = validateStoryData(validStory)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Story ID is required')
    expect(result.errors).toContain('Story title is required')
  })

  it('should validate insights', () => {
    validStory.insights[0].confidence = 1.5 // Invalid confidence
    delete validStory.insights[0].id

    const result = validateStoryData(validStory)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Insight 0 missing ID')
    expect(result.errors).toContain('Insight 0 confidence must be between 0 and 1')
  })

  it('should validate visual elements', () => {
    delete validStory.visualElements[0].id
    delete validStory.visualElements[0].position

    const result = validateStoryData(validStory)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Visual element 0 missing ID')
    expect(result.errors).toContain('Visual element 0 missing position')
  })

  it('should require at least one insight and visual element', () => {
    validStory.insights = []
    validStory.visualElements = []

    const result = validateStoryData(validStory)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Story must have at least one insight')
    expect(result.errors).toContain('Story must have visual elements')
  })
})

describe('createStoryGenerator', () => {
  it('should create a story generator instance', () => {
    const generator = createStoryGenerator()
    expect(generator).toBeInstanceOf(StoryGenerator)
  })

  it('should create generators with initialized templates', () => {
    const generator = createStoryGenerator()
    
    // Access private templates property for testing
    const templates = (generator as any).templates
    expect(templates.size).toBeGreaterThan(0)
    expect(templates.has('behavioral')).toBe(true)
    expect(templates.has('style-evolution')).toBe(true)
    expect(templates.has('recap')).toBe(true)
    expect(templates.has('seasonal')).toBe(true)
  })
})