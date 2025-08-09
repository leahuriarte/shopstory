// Core analytics engine for Style DNA and behavior analysis
import type { 
  AnalyticsEngine,
  BehaviorEvent,
  StyleProfile,
  PatternResult,
  ShoppingSession
} from '../types/analytics'
import type { Insight } from '../types/story'
import {
  extractColorPreferences,
  calculateBrandAffinities,
  calculateCategoryPreferences,
  calculateStyleEvolution,
  generateStoryInsights,
  detectBehaviorPatterns,
  generateSessionInsights
} from './analytics'

/**
 * Main analytics engine implementation
 */
export class ShopStoryAnalyticsEngine implements AnalyticsEngine {
  private readonly userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Process behavior events to generate/update Style DNA profile
   */
  async processEvents(events: BehaviorEvent[]): Promise<StyleProfile> {
    // Filter events for this user
    const userEvents = events.filter(event => event.userId === this.userId)
    
    if (userEvents.length === 0) {
      throw new Error('Insufficient behavior data to generate Style DNA')
    }

    // Extract style components
    const dominantColors = extractColorPreferences(userEvents)
    const preferredBrands = calculateBrandAffinities(userEvents)
    const categoryPreferences = calculateCategoryPreferences(userEvents)
    const priceRanges = this.calculatePriceRanges(userEvents)
    const seasonalTrends = this.generateSeasonalTrends(userEvents)

    // Calculate evolution score (would compare with previous profile in real implementation)
    const evolutionScore = this.calculateEvolutionScore(userEvents)

    const profile: StyleProfile = {
      userId: this.userId,
      dominantColors,
      preferredBrands,
      categoryPreferences,
      priceRanges,
      seasonalTrends,
      evolutionScore,
      lastUpdated: new Date()
    }

    return profile
  }

  /**
   * Generate insights for story content from Style DNA
   */
  async generateInsights(profile: StyleProfile): Promise<Insight[]> {
    return generateStoryInsights(profile)
  }

  /**
   * Update existing Style DNA with new behavior events
   */
  async updateStyleDNA(userId: string, newEvents: BehaviorEvent[]): Promise<StyleProfile> {
    if (userId !== this.userId) {
      throw new Error('User ID mismatch in analytics engine')
    }

    // In a real implementation, we would load existing profile and merge with new data
    // For now, we'll process all events together
    return this.processEvents(newEvents)
  }

  /**
   * Detect patterns across multiple shopping sessions
   */
  async detectPatterns(sessions: ShoppingSession[]): Promise<PatternResult[]> {
    // Filter sessions for this user
    const userSessions = sessions.filter(session => session.userId === this.userId)
    
    if (userSessions.length === 0) {
      return []
    }

    // Aggregate all events from sessions
    const allEvents = userSessions.flatMap(session => session.events)
    
    // Detect behavior patterns
    return detectBehaviorPatterns(allEvents)
  }

  /**
   * Analyze a single shopping session for immediate insights
   */
  async analyzeSession(session: ShoppingSession): Promise<ShoppingSession> {
    if (session.userId !== this.userId) {
      throw new Error('User ID mismatch in session analysis')
    }

    // Generate insights from session events
    const insights = generateSessionInsights(session.events)
    
    // Calculate session metrics
    const totalValue = this.calculateSessionValue(session.events)
    const itemsViewed = session.events.filter(e => e.eventType === 'view').length
    const itemsPurchased = session.events.filter(e => e.eventType === 'purchase').length

    return {
      ...session,
      insights,
      totalValue,
      itemsViewed,
      itemsPurchased
    }
  }

  /**
   * Get analytics summary for dashboard/reporting
   */
  async getAnalyticsSummary(events: BehaviorEvent[]): Promise<AnalyticsSummary> {
    const userEvents = events.filter(event => event.userId === this.userId)
    
    const totalEvents = userEvents.length
    const uniqueProducts = new Set(userEvents.map(e => e.productId).filter(Boolean)).size
    const uniqueBrands = new Set(userEvents.map(e => e.brandName).filter(Boolean)).size
    const uniqueCategories = new Set(userEvents.map(e => e.categoryId).filter(Boolean)).size
    
    const purchaseEvents = userEvents.filter(e => e.eventType === 'purchase')
    const totalSpent = purchaseEvents.reduce((sum, event) => 
      sum + (event.metadata.priceAtTime || 0), 0
    )
    
    const avgSessionDuration = this.calculateAverageSessionDuration(userEvents)
    const conversionRate = totalEvents > 0 ? purchaseEvents.length / totalEvents : 0

    return {
      totalEvents,
      uniqueProducts,
      uniqueBrands,
      uniqueCategories,
      totalSpent,
      averageOrderValue: purchaseEvents.length > 0 ? totalSpent / purchaseEvents.length : 0,
      conversionRate,
      avgSessionDuration,
      lastActivity: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null
    }
  }

  /**
   * Calculate price ranges by category
   */
  private calculatePriceRanges(events: BehaviorEvent[]) {
    const categoryPrices = new Map<string, number[]>()
    
    events.forEach(event => {
      if (event.categoryId && event.metadata.priceAtTime && event.eventType === 'purchase') {
        const prices = categoryPrices.get(event.categoryId) || []
        prices.push(event.metadata.priceAtTime)
        categoryPrices.set(event.categoryId, prices)
      }
    })

    return Array.from(categoryPrices.entries()).map(([category, prices]) => {
      const sortedPrices = prices.sort((a, b) => a - b)
      const min = sortedPrices[0]
      const max = sortedPrices[sortedPrices.length - 1]
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length
      
      return {
        category,
        min,
        max,
        average,
        currency: 'USD',
        frequency: prices.length
      }
    })
  }

  /**
   * Generate seasonal trends from behavior events
   */
  private generateSeasonalTrends(events: BehaviorEvent[]) {
    const currentYear = new Date().getFullYear()
    const seasons: Array<'spring' | 'summer' | 'fall' | 'winter'> = ['spring', 'summer', 'fall', 'winter']
    
    return seasons.map(season => {
      const seasonEvents = events.filter(event => {
        const eventSeason = this.getSeasonFromDate(event.timestamp)
        return eventSeason === season && event.timestamp.getFullYear() === currentYear
      })

      // Extract dominant colors for the season (would use actual color analysis)
      const dominantColors = this.extractSeasonalColors(seasonEvents)
      
      // Extract top categories for the season
      const categoryFreq = new Map<string, number>()
      seasonEvents.forEach(event => {
        if (event.categoryId) {
          categoryFreq.set(event.categoryId, (categoryFreq.get(event.categoryId) || 0) + 1)
        }
      })
      
      const topCategories = Array.from(categoryFreq.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)

      // Calculate spending pattern
      const purchaseEvents = seasonEvents.filter(e => e.eventType === 'purchase')
      const totalSpent = purchaseEvents.reduce((sum, event) => 
        sum + (event.metadata.priceAtTime || 0), 0
      )
      const spendingPattern = totalSpent / Math.max(purchaseEvents.length, 1)

      // Calculate style evolution for the season
      const styleEvolution = this.calculateSeasonalStyleEvolution(seasonEvents)

      return {
        season,
        year: currentYear,
        dominantColors,
        topCategories,
        spendingPattern,
        styleEvolution
      }
    })
  }

  /**
   * Calculate evolution score based on behavior changes
   */
  private calculateEvolutionScore(events: BehaviorEvent[]): number {
    // Simple implementation - would be more sophisticated in production
    const recentEvents = events.filter(event => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return event.timestamp > thirtyDaysAgo
    })

    const olderEvents = events.filter(event => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      return event.timestamp <= thirtyDaysAgo && event.timestamp > sixtyDaysAgo
    })

    if (recentEvents.length === 0 || olderEvents.length === 0) {
      return 0
    }

    // Compare brand diversity
    const recentBrands = new Set(recentEvents.map(e => e.brandName).filter(Boolean))
    const olderBrands = new Set(olderEvents.map(e => e.brandName).filter(Boolean))
    const brandEvolution = (recentBrands.size - olderBrands.size) / Math.max(olderBrands.size, 1)

    // Compare category diversity
    const recentCategories = new Set(recentEvents.map(e => e.categoryId).filter(Boolean))
    const olderCategories = new Set(olderEvents.map(e => e.categoryId).filter(Boolean))
    const categoryEvolution = (recentCategories.size - olderCategories.size) / Math.max(olderCategories.size, 1)

    // Average the evolution scores and normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, (brandEvolution + categoryEvolution) / 2))
  }

  /**
   * Calculate session value from events
   */
  private calculateSessionValue(events: BehaviorEvent[]): number {
    return events
      .filter(event => event.eventType === 'purchase')
      .reduce((sum, event) => sum + (event.metadata.priceAtTime || 0), 0)
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(events: BehaviorEvent[]): number {
    if (events.length === 0) return 0

    // Group events by session
    const sessionGroups = new Map<string, BehaviorEvent[]>()
    events.forEach(event => {
      const sessionEvents = sessionGroups.get(event.sessionId) || []
      sessionEvents.push(event)
      sessionGroups.set(event.sessionId, sessionEvents)
    })

    // Calculate duration for each session
    const sessionDurations = Array.from(sessionGroups.values()).map(sessionEvents => {
      if (sessionEvents.length < 2) return 0
      
      const sortedEvents = sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      const firstEvent = sortedEvents[0]
      const lastEvent = sortedEvents[sortedEvents.length - 1]
      
      return lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()
    })

    // Return average duration in minutes
    const totalDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0)
    return sessionDurations.length > 0 ? totalDuration / sessionDurations.length / (1000 * 60) : 0
  }

  /**
   * Extract seasonal colors (simplified implementation)
   */
  private extractSeasonalColors(events: BehaviorEvent[]): string[] {
    // In a real implementation, this would analyze product images/metadata
    // For now, return season-appropriate colors
    const season = this.getSeasonFromDate(new Date())
    
    switch (season) {
      case 'spring':
        return ['#90EE90', '#FFB6C1', '#F0E68C', '#DDA0DD']
      case 'summer':
        return ['#87CEEB', '#F0E68C', '#FF6347', '#32CD32']
      case 'fall':
        return ['#D2691E', '#8B4513', '#CD853F', '#A0522D']
      case 'winter':
        return ['#2F4F4F', '#708090', '#B22222', '#000080']
      default:
        return ['#000000', '#FFFFFF', '#808080']
    }
  }

  /**
   * Calculate seasonal style evolution
   */
  private calculateSeasonalStyleEvolution(events: BehaviorEvent[]): number {
    // Simplified calculation - would be more complex in production
    const experimentalIndicators = events.filter(event => 
      event.metadata.source === 'recommendation' || 
      event.eventType === 'share'
    ).length

    const conservativeIndicators = events.filter(event =>
      event.metadata.source === 'search' ||
      event.brandName // Repeat brand purchases
    ).length

    const total = experimentalIndicators + conservativeIndicators
    if (total === 0) return 0

    // Return score from -1 (conservative) to 1 (experimental)
    return (experimentalIndicators - conservativeIndicators) / total
  }

  /**
   * Get season from date
   */
  private getSeasonFromDate(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }
}

/**
 * Analytics summary interface
 */
export interface AnalyticsSummary {
  totalEvents: number
  uniqueProducts: number
  uniqueBrands: number
  uniqueCategories: number
  totalSpent: number
  averageOrderValue: number
  conversionRate: number
  avgSessionDuration: number // in minutes
  lastActivity: Date | null
}

/**
 * Factory function to create analytics engine instance
 */
export const createAnalyticsEngine = (userId: string): AnalyticsEngine => {
  return new ShopStoryAnalyticsEngine(userId)
}

/**
 * Utility function to validate behavior events before processing
 */
export const validateBehaviorEvents = (events: BehaviorEvent[]): { valid: BehaviorEvent[], invalid: BehaviorEvent[] } => {
  const valid: BehaviorEvent[] = []
  const invalid: BehaviorEvent[] = []

  events.forEach(event => {
    // Basic validation
    if (!event.id || !event.userId || !event.eventType || !event.timestamp || !event.sessionId) {
      invalid.push(event)
      return
    }

    // Validate event type
    const validEventTypes = ['view', 'add_to_cart', 'purchase', 'share', 'save', 'search', 'filter']
    if (!validEventTypes.includes(event.eventType)) {
      invalid.push(event)
      return
    }

    // Validate timestamp (not in future, not too old)
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    
    if (event.timestamp > now || event.timestamp < oneYearAgo) {
      invalid.push(event)
      return
    }

    valid.push(event)
  })

  return { valid, invalid }
}

/**
 * Utility function to clean and normalize behavior events
 */
export const normalizeBehaviorEvents = (events: BehaviorEvent[]): BehaviorEvent[] => {
  return events.map(event => ({
    ...event,
    // Ensure metadata exists
    metadata: {
      source: 'browse',
      ...event.metadata
    },
    // Normalize brand names
    brandName: event.brandName?.trim().toLowerCase(),
    // Normalize category IDs
    categoryId: event.categoryId?.trim().toLowerCase()
  }))
}