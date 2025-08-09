// Integration tests for story generation workflow
import { describe, it, expect } from 'vitest'
import { createStoryGenerator } from '../storyGeneration'
import { createAnalyticsEngine } from '../analyticsEngine'
import type { BehaviorEvent } from '../../types/analytics'

describe('Story Generation Integration', () => {
  const mockUserId = 'test-user'
  const mockEvents: BehaviorEvent[] = [
    {
      id: 'event-1',
      userId: mockUserId,
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
      userId: mockUserId,
      eventType: 'view',
      productId: 'product-2',
      categoryId: 'shoes',
      brandName: 'Adidas',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      sessionId: 'session-2',
      metadata: { source: 'recommendation', duration: 5000, priceAtTime: 129.99 }
    },
    {
      id: 'event-3',
      userId: mockUserId,
      eventType: 'add_to_cart',
      productId: 'product-3',
      categoryId: 'accessories',
      brandName: 'Apple',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      sessionId: 'session-3',
      metadata: { source: 'search', priceAtTime: 199.99 }
    }
  ]

  it('should complete full story generation workflow', async () => {
    // Step 1: Create analytics engine and process events
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)

    expect(profile).toBeDefined()
    expect(profile.userId).toBe(mockUserId)
    expect(profile.dominantColors.length).toBeGreaterThan(0)
    expect(profile.preferredBrands.length).toBeGreaterThan(0)
    expect(profile.categoryPreferences.length).toBeGreaterThan(0)

    // Step 2: Generate insights from profile
    const insights = await analyticsEngine.generateInsights(profile)

    expect(insights).toBeDefined()
    expect(insights.length).toBeGreaterThan(0)
    expect(insights[0]).toHaveProperty('id')
    expect(insights[0]).toHaveProperty('type')
    expect(insights[0]).toHaveProperty('confidence')

    // Step 3: Create story generator and generate stories
    const storyGenerator = createStoryGenerator()
    const stories = await storyGenerator.generateStorySet(profile, insights, mockEvents)

    expect(stories).toBeDefined()
    expect(stories.length).toBeGreaterThan(0)

    // Verify story structure
    const story = stories[0]
    expect(story.id).toBeDefined()
    expect(story.type).toBeDefined()
    expect(story.title).toBeDefined()
    expect(story.insights.length).toBeGreaterThan(0)
    expect(story.visualElements.length).toBeGreaterThan(0)
    expect(story.shareableContent).toBeDefined()
    expect(story.createdAt).toBeInstanceOf(Date)

    // Verify insights are properly filtered and included
    expect(story.insights.every(insight => 
      insight.confidence >= 0 && insight.confidence <= 1
    )).toBe(true)

    // Verify visual elements have proper structure
    expect(story.visualElements.every(element => 
      element.id && element.type && element.position && element.size
    )).toBe(true)

    // Verify shareable content
    expect(story.shareableContent.title).toBeDefined()
    expect(story.shareableContent.description).toBeDefined()
    expect(story.shareableContent.hashtags.length).toBeGreaterThan(0)
    expect(story.shareableContent.platforms.length).toBeGreaterThan(0)
  })

  it('should generate different story types with appropriate content', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    // Generate behavioral story
    const behavioralStory = await storyGenerator.generateBehavioralStory(profile, insights)
    expect(behavioralStory.type).toBe('behavioral')
    expect(behavioralStory.title).toContain('Style DNA')

    // Generate monthly recap
    const recapStory = await storyGenerator.generateMonthlyRecap(profile, mockEvents, insights)
    expect(recapStory.type).toBe('recap')
    expect(recapStory.title).toContain('Recap')

    // Generate seasonal story
    const seasonalStory = await storyGenerator.generateSeasonalStory(profile, 'fall', insights)
    expect(seasonalStory.type).toBe('seasonal')
    expect(seasonalStory.title).toContain('Style')

    // Verify each story has unique content
    expect(behavioralStory.id).not.toBe(recapStory.id)
    expect(behavioralStory.id).not.toBe(seasonalStory.id)
    expect(recapStory.id).not.toBe(seasonalStory.id)
  })

  it('should handle story expiration correctly', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    // Generate story
    const story = await storyGenerator.generateBehavioralStory(profile, insights)
    
    // Verify expiration is set
    expect(story.expiresAt).toBeDefined()
    expect(story.expiresAt!.getTime()).toBeGreaterThan(story.createdAt.getTime())

    // Test active stories filtering
    const activeStories = storyGenerator.getActiveStories([story])
    expect(activeStories).toContain(story)

    // Test refresh logic
    const shouldRefresh = storyGenerator.shouldRefreshStories([story])
    expect(shouldRefresh).toBe(false) // Should not need refresh for new story
  })

  it('should generate stories with products when requested', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    // Generate story with products
    const story = await storyGenerator.generateBehavioralStory(profile, insights, {
      includeProducts: true
    })

    expect(story.shoppableProducts).toBeDefined()
    expect(story.shoppableProducts!.length).toBeGreaterThan(0)

    const product = story.shoppableProducts![0]
    expect(product.id).toBeDefined()
    expect(product.title).toBeDefined()
    expect(product.price).toBeDefined()
    expect(product.images.length).toBeGreaterThan(0)
  })

  it('should validate generated stories', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    const story = await storyGenerator.generateBehavioralStory(profile, insights)

    // Import validation function
    const { validateStoryData } = await import('../storyGeneration')
    const validation = validateStoryData(story)

    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should handle insufficient data gracefully', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    
    // Test with minimal events
    const minimalEvents: BehaviorEvent[] = [{
      id: 'event-1',
      userId: mockUserId,
      eventType: 'view',
      timestamp: new Date(),
      sessionId: 'session-1',
      metadata: { source: 'browse' }
    }]

    const profile = await analyticsEngine.processEvents(minimalEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    // Should still generate a story, even with minimal data
    const story = await storyGenerator.generateBehavioralStory(profile, insights)
    
    expect(story).toBeDefined()
    expect(story.type).toBe('behavioral')
    expect(story.visualElements.length).toBeGreaterThan(0)
  })

  it('should generate stories with proper visual element data binding', async () => {
    const analyticsEngine = createAnalyticsEngine(mockUserId)
    const profile = await analyticsEngine.processEvents(mockEvents)
    const insights = await analyticsEngine.generateInsights(profile)
    const storyGenerator = createStoryGenerator()

    const story = await storyGenerator.generateBehavioralStory(profile, insights)

    // Check that visual elements have bound data
    const elementsWithData = story.visualElements.filter(element => element.data)
    expect(elementsWithData.length).toBeGreaterThan(0)

    // Check specific data bindings
    const colorElement = story.visualElements.find(el => el.type === 'color-swatch')
    if (colorElement && colorElement.data) {
      expect(colorElement.data.colors).toBeDefined()
    }

    const chartElement = story.visualElements.find(el => el.type === 'chart')
    if (chartElement && chartElement.data) {
      expect(chartElement.data.data).toBeDefined()
    }
  })
})