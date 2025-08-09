// Story generation utilities
import type { 
  StoryData, 
  Insight, 
  VisualElement, 
  ShareableContent,
  Product 
} from '../types/story'
import type { 
  StyleProfile, 
  BehaviorEvent, 
  ShoppingSession,
  PatternResult 
} from '../types/analytics'
import { generateId } from './analytics'

export type StoryType = 'behavioral' | 'style-evolution' | 'recap' | 'seasonal'

export interface StoryGenerationOptions {
  includeProducts?: boolean
  maxInsights?: number
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  visualStyle?: 'minimal' | 'vibrant' | 'elegant'
}

export interface StoryTemplate {
  type: StoryType
  title: string
  layout: LayoutConfig
  visualElements: VisualElementTemplate[]
  insightTypes: Insight['type'][]
  expirationHours: number
}

export interface LayoutConfig {
  aspectRatio: '9:16'
  backgroundColor: string
  backgroundGradient?: string[]
  textColor: string
  accentColor: string
}

export interface VisualElementTemplate {
  type: VisualElement['type']
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: Record<string, any>
  dataBinding?: string
}

/**
 * Main story generation class
 */
export class StoryGenerator {
  private templates: Map<StoryType, StoryTemplate[]> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  /**
   * Generate a story from analytics data
   */
  async generateStory(
    type: StoryType,
    profile: StyleProfile,
    insights: Insight[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData> {
    const template = this.selectTemplate(type, insights)
    const filteredInsights = this.filterInsights(insights, template, options.maxInsights || 3)
    const visualElements = this.generateVisualElements(template, filteredInsights, profile)
    const shareableContent = this.generateShareableContent(type, filteredInsights, profile)
    
    // Add products if requested and available
    let shoppableProducts: Product[] | undefined
    if (options.includeProducts) {
      shoppableProducts = await this.generateShoppableProducts(filteredInsights, profile)
    }

    const story: StoryData = {
      id: generateId(),
      type,
      title: this.generateTitle(type, filteredInsights, profile),
      insights: filteredInsights,
      visualElements,
      shoppableProducts,
      shareableContent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + template.expirationHours * 60 * 60 * 1000)
    }

    return story
  }

  /**
   * Generate behavioral insights story
   */
  async generateBehavioralStory(
    profile: StyleProfile,
    insights: Insight[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData> {
    return this.generateStory('behavioral', profile, insights, options)
  }

  /**
   * Generate style evolution story
   */
  async generateStyleEvolutionStory(
    currentProfile: StyleProfile,
    previousProfile: StyleProfile,
    insights: Insight[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData> {
    // Add evolution-specific insights
    const evolutionInsights = this.generateEvolutionInsights(currentProfile, previousProfile)
    const allInsights = [...insights, ...evolutionInsights]
    
    return this.generateStory('style-evolution', currentProfile, allInsights, options)
  }

  /**
   * Generate monthly recap story
   */
  async generateMonthlyRecap(
    profile: StyleProfile,
    monthlyEvents: BehaviorEvent[],
    insights: Insight[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData> {
    // Add recap-specific insights
    const recapInsights = this.generateRecapInsights(monthlyEvents, profile)
    const allInsights = [...insights, ...recapInsights]
    
    return this.generateStory('recap', profile, allInsights, {
      ...options,
      timeframe: 'month'
    })
  }

  /**
   * Generate seasonal story
   */
  async generateSeasonalStory(
    profile: StyleProfile,
    season: 'spring' | 'summer' | 'fall' | 'winter',
    insights: Insight[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData> {
    // Filter for seasonal insights
    const seasonalInsights = insights.filter(insight => 
      insight.type === 'seasonal-shift' || 
      insight.type === 'color-preference'
    )
    
    return this.generateStory('seasonal', profile, seasonalInsights, {
      ...options,
      timeframe: 'quarter'
    })
  }

  /**
   * Generate multiple stories for a user
   */
  async generateStorySet(
    profile: StyleProfile,
    insights: Insight[],
    events: BehaviorEvent[],
    options: StoryGenerationOptions = {}
  ): Promise<StoryData[]> {
    const stories: StoryData[] = []

    // Always generate a behavioral story if we have insights
    if (insights.length > 0) {
      const behavioralStory = await this.generateBehavioralStory(profile, insights, options)
      stories.push(behavioralStory)
    }

    // Generate monthly recap if we have recent events
    const recentEvents = this.getRecentEvents(events, 'month')
    if (recentEvents.length > 5) {
      const recapStory = await this.generateMonthlyRecap(profile, recentEvents, insights, options)
      stories.push(recapStory)
    }

    // Generate seasonal story if appropriate
    const currentSeason = this.getCurrentSeason()
    const seasonalInsights = insights.filter(i => i.type === 'seasonal-shift')
    if (seasonalInsights.length > 0) {
      const seasonalStory = await this.generateSeasonalStory(profile, currentSeason, insights, options)
      stories.push(seasonalStory)
    }

    return stories
  }

  /**
   * Check if stories need refresh
   */
  shouldRefreshStories(stories: StoryData[]): boolean {
    if (stories.length === 0) return true
    
    const now = new Date()
    return stories.some(story => 
      story.expiresAt && story.expiresAt < now
    )
  }

  /**
   * Get non-expired stories
   */
  getActiveStories(stories: StoryData[]): StoryData[] {
    const now = new Date()
    return stories.filter(story => 
      !story.expiresAt || story.expiresAt > now
    )
  }

  /**
   * Initialize story templates
   */
  private initializeTemplates(): void {
    // Behavioral insights template
    this.templates.set('behavioral', [{
      type: 'behavioral',
      title: 'Your Style DNA',
      layout: {
        aspectRatio: '9:16',
        backgroundColor: '#1a1a1a',
        backgroundGradient: ['#1a1a1a', '#2d2d2d'],
        textColor: '#ffffff',
        accentColor: '#ff6b6b'
      },
      visualElements: [
        {
          type: 'text-overlay',
          position: { x: 0.1, y: 0.1 },
          size: { width: 0.8, height: 0.15 },
          style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' },
          dataBinding: 'title'
        },
        {
          type: 'color-swatch',
          position: { x: 0.1, y: 0.3 },
          size: { width: 0.8, height: 0.2 },
          style: { borderRadius: '12px' },
          dataBinding: 'dominantColors'
        },
        {
          type: 'chart',
          position: { x: 0.1, y: 0.55 },
          size: { width: 0.8, height: 0.25 },
          style: { chartType: 'donut' },
          dataBinding: 'categoryPreferences'
        }
      ],
      insightTypes: ['color-preference', 'brand-affinity', 'category-trend'],
      expirationHours: 168 // 1 week
    }])

    // Style evolution template
    this.templates.set('style-evolution', [{
      type: 'style-evolution',
      title: 'Style Evolution',
      layout: {
        aspectRatio: '9:16',
        backgroundColor: '#f8f9fa',
        backgroundGradient: ['#f8f9fa', '#e9ecef'],
        textColor: '#212529',
        accentColor: '#6f42c1'
      },
      visualElements: [
        {
          type: 'text-overlay',
          position: { x: 0.1, y: 0.1 },
          size: { width: 0.8, height: 0.15 },
          style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' },
          dataBinding: 'title'
        },
        {
          type: 'trend-line',
          position: { x: 0.1, y: 0.3 },
          size: { width: 0.8, height: 0.3 },
          style: { lineColor: '#6f42c1', fillColor: 'rgba(111, 66, 193, 0.1)' },
          dataBinding: 'evolutionScore'
        },
        {
          type: 'color-swatch',
          position: { x: 0.1, y: 0.65 },
          size: { width: 0.35, height: 0.15 },
          style: { borderRadius: '8px', title: 'Before' },
          dataBinding: 'previousColors'
        },
        {
          type: 'color-swatch',
          position: { x: 0.55, y: 0.65 },
          size: { width: 0.35, height: 0.15 },
          style: { borderRadius: '8px', title: 'Now' },
          dataBinding: 'currentColors'
        }
      ],
      insightTypes: ['seasonal-shift', 'color-preference', 'brand-affinity'],
      expirationHours: 720 // 30 days
    }])

    // Monthly recap template
    this.templates.set('recap', [{
      type: 'recap',
      title: 'Monthly Recap',
      layout: {
        aspectRatio: '9:16',
        backgroundColor: '#0f172a',
        backgroundGradient: ['#0f172a', '#1e293b'],
        textColor: '#f1f5f9',
        accentColor: '#10b981'
      },
      visualElements: [
        {
          type: 'text-overlay',
          position: { x: 0.1, y: 0.1 },
          size: { width: 0.8, height: 0.15 },
          style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' },
          dataBinding: 'title'
        },
        {
          type: 'chart',
          position: { x: 0.1, y: 0.3 },
          size: { width: 0.8, height: 0.2 },
          style: { chartType: 'bar', color: '#10b981' },
          dataBinding: 'monthlyStats'
        },
        {
          type: 'product-grid',
          position: { x: 0.1, y: 0.55 },
          size: { width: 0.8, height: 0.3 },
          style: { columns: 2, gap: '8px' },
          dataBinding: 'topProducts'
        }
      ],
      insightTypes: ['category-trend', 'price-pattern', 'brand-affinity'],
      expirationHours: 168 // 1 week
    }])

    // Seasonal template
    this.templates.set('seasonal', [{
      type: 'seasonal',
      title: 'Seasonal Style',
      layout: {
        aspectRatio: '9:16',
        backgroundColor: '#fef3c7',
        backgroundGradient: ['#fef3c7', '#fde68a'],
        textColor: '#92400e',
        accentColor: '#d97706'
      },
      visualElements: [
        {
          type: 'text-overlay',
          position: { x: 0.1, y: 0.1 },
          size: { width: 0.8, height: 0.15 },
          style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' },
          dataBinding: 'title'
        },
        {
          type: 'color-swatch',
          position: { x: 0.1, y: 0.3 },
          size: { width: 0.8, height: 0.25 },
          style: { borderRadius: '16px', layout: 'seasonal' },
          dataBinding: 'seasonalColors'
        },
        {
          type: 'chart',
          position: { x: 0.1, y: 0.6 },
          size: { width: 0.8, height: 0.2 },
          style: { chartType: 'radial', color: '#d97706' },
          dataBinding: 'seasonalTrends'
        }
      ],
      insightTypes: ['seasonal-shift', 'color-preference'],
      expirationHours: 2160 // 90 days
    }])
  }

  /**
   * Select appropriate template for story type and insights
   */
  private selectTemplate(type: StoryType, insights: Insight[]): StoryTemplate {
    const templates = this.templates.get(type) || []
    if (templates.length === 0) {
      throw new Error(`No templates found for story type: ${type}`)
    }

    // For now, return the first template. In production, this could be more sophisticated
    return templates[0]
  }

  /**
   * Filter insights based on template requirements
   */
  private filterInsights(
    insights: Insight[], 
    template: StoryTemplate, 
    maxInsights: number
  ): Insight[] {
    // Filter by template's preferred insight types
    const relevantInsights = insights.filter(insight =>
      template.insightTypes.includes(insight.type)
    )

    // Sort by confidence and take top insights
    return relevantInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxInsights)
  }

  /**
   * Generate visual elements from template and data
   */
  private generateVisualElements(
    template: StoryTemplate,
    insights: Insight[],
    profile: StyleProfile
  ): VisualElement[] {
    return template.visualElements.map(elementTemplate => ({
      id: generateId(),
      type: elementTemplate.type,
      position: {
        x: elementTemplate.position.x,
        y: elementTemplate.position.y,
        z: 1
      },
      size: {
        width: elementTemplate.size.width,
        height: elementTemplate.size.height
      },
      style: {
        ...elementTemplate.style,
        ...template.layout
      },
      data: this.bindDataToElement(elementTemplate, insights, profile)
    }))
  }

  /**
   * Bind data to visual element based on template
   */
  private bindDataToElement(
    elementTemplate: VisualElementTemplate,
    insights: Insight[],
    profile: StyleProfile
  ): any {
    if (!elementTemplate.dataBinding) return null

    switch (elementTemplate.dataBinding) {
      case 'title':
        return { text: `Your ${profile.dominantColors[0]?.name || 'Unique'} Style` }
      
      case 'dominantColors':
        return { colors: profile.dominantColors.slice(0, 5) }
      
      case 'categoryPreferences':
        return { 
          data: profile.categoryPreferences.slice(0, 5).map(cat => ({
            label: cat.category,
            value: cat.weight,
            color: this.getCategoryColor(cat.category)
          }))
        }
      
      case 'evolutionScore':
        return { 
          score: profile.evolutionScore,
          trend: profile.evolutionScore > 0 ? 'experimental' : 'refined'
        }
      
      case 'monthlyStats':
        return {
          purchases: insights.filter(i => i.type === 'category-trend').length,
          categories: profile.categoryPreferences.length,
          brands: profile.preferredBrands.length
        }
      
      case 'seasonalColors':
        const currentSeason = this.getCurrentSeason()
        const seasonalTrend = profile.seasonalTrends.find(t => t.season === currentSeason)
        return { colors: seasonalTrend?.dominantColors || [] }
      
      default:
        return null
    }
  }

  /**
   * Generate shareable content for story
   */
  private generateShareableContent(
    type: StoryType,
    insights: Insight[],
    profile: StyleProfile
  ): ShareableContent {
    const titles = {
      behavioral: 'My Style DNA',
      'style-evolution': 'My Style Evolution',
      recap: 'My Monthly Style Recap',
      seasonal: `My ${this.getCurrentSeason()} Style`
    }

    const descriptions = {
      behavioral: `Discovered my signature style: ${profile.dominantColors[0]?.name || 'unique'} colors and ${profile.preferredBrands[0]?.brandName || 'diverse'} brands`,
      'style-evolution': `My style has evolved ${profile.evolutionScore > 0 ? 'experimentally' : 'refinedly'} this season`,
      recap: `This month: ${insights.length} style insights and ${profile.categoryPreferences.length} favorite categories`,
      seasonal: `My ${this.getCurrentSeason()} style features ${profile.seasonalTrends[0]?.dominantColors.length || 0} signature colors`
    }

    return {
      title: titles[type],
      description: descriptions[type],
      hashtags: ['#StyleDNA', '#ShopStory', '#MyStyle', `#${type.charAt(0).toUpperCase() + type.slice(1)}`],
      platforms: ['instagram', 'tiktok', 'twitter'],
      exportFormats: ['story-9x16', 'post-1x1']
    }
  }

  /**
   * Generate title for story
   */
  private generateTitle(type: StoryType, insights: Insight[], profile: StyleProfile): string {
    switch (type) {
      case 'behavioral':
        return `Your ${profile.dominantColors[0]?.name || 'Unique'} Style DNA`
      
      case 'style-evolution':
        return `Style Evolution: ${profile.evolutionScore > 0 ? 'Experimental' : 'Refined'} Journey`
      
      case 'recap':
        const month = new Date().toLocaleString('default', { month: 'long' })
        return `${month} Style Recap`
      
      case 'seasonal':
        const season = this.getCurrentSeason()
        return `${season.charAt(0).toUpperCase() + season.slice(1)} Style Story`
      
      default:
        return 'Your Style Story'
    }
  }

  /**
   * Generate evolution-specific insights
   */
  private generateEvolutionInsights(
    currentProfile: StyleProfile,
    previousProfile: StyleProfile
  ): Insight[] {
    const insights: Insight[] = []

    // Color evolution
    const colorEvolution = this.compareColorProfiles(
      previousProfile.dominantColors,
      currentProfile.dominantColors
    )
    
    if (colorEvolution.changed) {
      insights.push({
        id: generateId(),
        type: 'color-preference',
        title: 'Color Palette Evolution',
        description: `Your color preferences have ${colorEvolution.direction === 'expanded' ? 'expanded' : 'focused'}`,
        confidence: 0.8,
        data: { 
          previous: previousProfile.dominantColors,
          current: currentProfile.dominantColors,
          change: colorEvolution.direction
        },
        visualType: 'color-palette'
      })
    }

    // Brand evolution
    const brandEvolution = this.compareBrandProfiles(
      previousProfile.preferredBrands,
      currentProfile.preferredBrands
    )
    
    if (brandEvolution.changed) {
      insights.push({
        id: generateId(),
        type: 'brand-affinity',
        title: 'Brand Discovery',
        description: `You've ${brandEvolution.newBrands > 0 ? 'discovered' : 'focused on'} ${Math.abs(brandEvolution.newBrands)} ${Math.abs(brandEvolution.newBrands) === 1 ? 'brand' : 'brands'}`,
        confidence: 0.7,
        data: {
          newBrands: brandEvolution.newBrands,
          topBrand: currentProfile.preferredBrands[0]?.brandName
        },
        visualType: 'brand-cloud'
      })
    }

    return insights
  }

  /**
   * Generate recap-specific insights
   */
  private generateRecapInsights(events: BehaviorEvent[], profile: StyleProfile): Insight[] {
    const insights: Insight[] = []

    // Activity summary
    const purchaseEvents = events.filter(e => e.eventType === 'purchase')
    const viewEvents = events.filter(e => e.eventType === 'view')
    
    insights.push({
      id: generateId(),
      type: 'category-trend',
      title: 'Monthly Activity',
      description: `${purchaseEvents.length} purchases from ${viewEvents.length} items viewed`,
      confidence: 1.0,
      data: {
        purchases: purchaseEvents.length,
        views: viewEvents.length,
        conversionRate: viewEvents.length > 0 ? purchaseEvents.length / viewEvents.length : 0
      },
      visualType: 'chart'
    })

    // Top category this month
    const categoryFreq = new Map<string, number>()
    events.forEach(event => {
      if (event.categoryId) {
        categoryFreq.set(event.categoryId, (categoryFreq.get(event.categoryId) || 0) + 1)
      }
    })

    if (categoryFreq.size > 0) {
      const topCategory = Array.from(categoryFreq.entries())
        .sort(([, a], [, b]) => b - a)[0]

      insights.push({
        id: generateId(),
        type: 'category-trend',
        title: 'Category Focus',
        description: `${topCategory[0]} was your top category this month`,
        confidence: 0.9,
        data: {
          category: topCategory[0],
          frequency: topCategory[1],
          percentage: topCategory[1] / events.length
        },
        visualType: 'chart'
      })
    }

    return insights
  }

  /**
   * Generate shoppable products based on insights
   */
  private async generateShoppableProducts(
    insights: Insight[],
    profile: StyleProfile
  ): Promise<Product[]> {
    // This would integrate with Shop Minis product API
    // For now, return mock products based on style profile
    const mockProducts: Product[] = []

    // Add products based on dominant colors
    if (profile.dominantColors.length > 0) {
      const topColor = profile.dominantColors[0]
      mockProducts.push({
        id: `product-${generateId()}`,
        title: `${topColor.name} Style Essential`,
        description: `Perfect match for your ${topColor.name} color preference`,
        images: [{
          id: `img-${generateId()}`,
          url: `/api/products/color/${topColor.color.replace('#', '')}/image`,
          altText: `${topColor.name} product`
        }],
        price: {
          amount: '89.99',
          currencyCode: 'USD'
        },
        vendor: profile.preferredBrands[0]?.brandName || 'Shop',
        productType: profile.categoryPreferences[0]?.category || 'Fashion',
        tags: [topColor.name, 'curated', 'style-dna']
      })
    }

    return mockProducts.slice(0, 3) // Limit to 3 products per story
  }

  /**
   * Get recent events within timeframe
   */
  private getRecentEvents(events: BehaviorEvent[], timeframe: 'week' | 'month' | 'quarter'): BehaviorEvent[] {
    const now = new Date()
    let cutoffDate: Date

    switch (timeframe) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }

    return events.filter(event => event.timestamp > cutoffDate)
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  /**
   * Compare color profiles for evolution analysis
   */
  private compareColorProfiles(previous: any[], current: any[]): { changed: boolean; direction: 'expanded' | 'focused' } {
    const prevColors = new Set(previous.map(c => c.color))
    const currColors = new Set(current.map(c => c.color))
    
    const changed = prevColors.size !== currColors.size || 
      ![...prevColors].every(color => currColors.has(color))
    
    const direction = currColors.size > prevColors.size ? 'expanded' : 'focused'
    
    return { changed, direction }
  }

  /**
   * Compare brand profiles for evolution analysis
   */
  private compareBrandProfiles(previous: any[], current: any[]): { changed: boolean; newBrands: number } {
    const prevBrands = new Set(previous.map(b => b.brandName))
    const currBrands = new Set(current.map(b => b.brandName))
    
    const newBrands = currBrands.size - prevBrands.size
    const changed = newBrands !== 0 || ![...prevBrands].every(brand => currBrands.has(brand))
    
    return { changed, newBrands }
  }

  /**
   * Get color for category visualization
   */
  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'clothing': '#ff6b6b',
      'shoes': '#4ecdc4',
      'accessories': '#45b7d1',
      'beauty': '#f9ca24',
      'home': '#6c5ce7',
      'electronics': '#a0a0a0'
    }
    
    return colors[category.toLowerCase()] || '#95a5a6'
  }
}

/**
 * Factory function to create story generator
 */
export const createStoryGenerator = (): StoryGenerator => {
  return new StoryGenerator()
}

/**
 * Utility function to validate story data
 */
export const validateStoryData = (story: StoryData): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!story.id) errors.push('Story ID is required')
  if (!story.type) errors.push('Story type is required')
  if (!story.title) errors.push('Story title is required')
  if (!story.insights || story.insights.length === 0) errors.push('Story must have at least one insight')
  if (!story.visualElements || story.visualElements.length === 0) errors.push('Story must have visual elements')
  if (!story.shareableContent) errors.push('Story must have shareable content')
  if (!story.createdAt) errors.push('Story creation date is required')

  // Validate insights
  story.insights?.forEach((insight, index) => {
    if (!insight.id) errors.push(`Insight ${index} missing ID`)
    if (!insight.type) errors.push(`Insight ${index} missing type`)
    if (!insight.title) errors.push(`Insight ${index} missing title`)
    if (insight.confidence < 0 || insight.confidence > 1) {
      errors.push(`Insight ${index} confidence must be between 0 and 1`)
    }
  })

  // Validate visual elements
  story.visualElements?.forEach((element, index) => {
    if (!element.id) errors.push(`Visual element ${index} missing ID`)
    if (!element.type) errors.push(`Visual element ${index} missing type`)
    if (!element.position) errors.push(`Visual element ${index} missing position`)
    if (!element.size) errors.push(`Visual element ${index} missing size`)
  })

  return { valid: errors.length === 0, errors }
}