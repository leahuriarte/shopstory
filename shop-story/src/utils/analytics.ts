// Analytics utility functions
import type {
  BehaviorEvent,
  StyleProfile,
  SessionInsight,
  BehaviorMetadata,
  ColorProfile,
  BrandAffinity,
  CategoryWeight,
  PriceRange,
  SeasonalData,
  PatternResult,
  DateRange
} from '../types/analytics'
import type { Insight } from '../types/story'

export const createBehaviorEvent = (
  userId: string,
  eventType: BehaviorEvent['eventType'],
  productId?: string,
  metadata: Partial<BehaviorMetadata> = {}
): BehaviorEvent => {
  return {
    id: generateId(),
    userId,
    eventType,
    productId,
    categoryId: metadata.categoryId,
    brandName: metadata.brandName,
    timestamp: new Date(),
    sessionId: metadata.sessionId || getCurrentSessionId(),
    metadata: {
      source: 'browse',
      ...metadata
    }
  }
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const getCurrentSessionId = (): string => {
  // Get or create session ID for current browser session
  const sessionKey = 'shop-story-current-session'
  let sessionId = sessionStorage.getItem(sessionKey)

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(sessionKey, sessionId)
  }

  return sessionId
}

/**
 * Calculate style evolution score between two profiles
 */
export const calculateStyleEvolution = (
  previousProfile: StyleProfile,
  currentProfile: StyleProfile
): number => {
  if (!previousProfile || !currentProfile) return 0

  let evolutionScore = 0
  let factors = 0

  // Compare dominant colors
  if (previousProfile.dominantColors.length > 0 && currentProfile.dominantColors.length > 0) {
    const colorOverlap = calculateColorOverlap(previousProfile.dominantColors, currentProfile.dominantColors)
    evolutionScore += (1 - colorOverlap) * 0.3 // 30% weight for color changes
    factors++
  }

  // Compare brand preferences
  if (previousProfile.preferredBrands.length > 0 && currentProfile.preferredBrands.length > 0) {
    const brandOverlap = calculateBrandOverlap(previousProfile.preferredBrands, currentProfile.preferredBrands)
    evolutionScore += (1 - brandOverlap) * 0.25 // 25% weight for brand changes
    factors++
  }

  // Compare category preferences
  if (previousProfile.categoryPreferences.length > 0 && currentProfile.categoryPreferences.length > 0) {
    const categoryOverlap = calculateCategoryOverlap(previousProfile.categoryPreferences, currentProfile.categoryPreferences)
    evolutionScore += (1 - categoryOverlap) * 0.25 // 25% weight for category changes
    factors++
  }

  // Compare price ranges
  if (previousProfile.priceRanges.length > 0 && currentProfile.priceRanges.length > 0) {
    const priceEvolution = calculatePriceEvolution(previousProfile.priceRanges, currentProfile.priceRanges)
    evolutionScore += priceEvolution * 0.2 // 20% weight for price changes
    factors++
  }

  return factors > 0 ? evolutionScore / factors : 0
}

/**
 * Calculate overlap between color profiles
 */
const calculateColorOverlap = (colors1: ColorProfile[], colors2: ColorProfile[]): number => {
  const colors1Set = new Set(colors1.map(c => c.color))
  const colors2Set = new Set(colors2.map(c => c.color))

  const intersection = new Set([...colors1Set].filter(x => colors2Set.has(x)))
  const union = new Set([...colors1Set, ...colors2Set])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Calculate overlap between brand affinities
 */
const calculateBrandOverlap = (brands1: BrandAffinity[], brands2: BrandAffinity[]): number => {
  const brands1Set = new Set(brands1.map(b => b.brandName))
  const brands2Set = new Set(brands2.map(b => b.brandName))

  const intersection = new Set([...brands1Set].filter(x => brands2Set.has(x)))
  const union = new Set([...brands1Set, ...brands2Set])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Calculate overlap between category preferences
 */
const calculateCategoryOverlap = (categories1: CategoryWeight[], categories2: CategoryWeight[]): number => {
  const categories1Set = new Set(categories1.map(c => c.category))
  const categories2Set = new Set(categories2.map(c => c.category))

  const intersection = new Set([...categories1Set].filter(x => categories2Set.has(x)))
  const union = new Set([...categories1Set, ...categories2Set])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Calculate price evolution (positive = moving to higher prices, negative = lower)
 */
const calculatePriceEvolution = (prices1: PriceRange[], prices2: PriceRange[]): number => {
  const avg1 = prices1.reduce((sum, p) => sum + p.average, 0) / prices1.length
  const avg2 = prices2.reduce((sum, p) => sum + p.average, 0) / prices2.length

  // Normalize the change to -1 to 1 range
  const maxPrice = Math.max(avg1, avg2)
  return maxPrice > 0 ? (avg2 - avg1) / maxPrice : 0
}

/**
 * Generate session insights from behavior events
 */
export const generateSessionInsights = (events: BehaviorEvent[]): SessionInsight[] => {
  const insights: SessionInsight[] = []

  if (events.length === 0) return insights

  // Analyze shopping intent
  const purchaseEvents = events.filter(e => e.eventType === 'purchase')
  const cartEvents = events.filter(e => e.eventType === 'add_to_cart')
  const viewEvents = events.filter(e => e.eventType === 'view')

  if (purchaseEvents.length > 0) {
    insights.push({
      type: 'intent',
      confidence: 0.9,
      description: `High purchase intent - completed ${purchaseEvents.length} purchase(s)`,
      data: { purchaseCount: purchaseEvents.length }
    })
  } else if (cartEvents.length > 0) {
    insights.push({
      type: 'intent',
      confidence: 0.7,
      description: `Moderate purchase intent - added ${cartEvents.length} item(s) to cart`,
      data: { cartCount: cartEvents.length }
    })
  } else if (viewEvents.length > 5) {
    insights.push({
      type: 'intent',
      confidence: 0.5,
      description: `Browsing behavior - viewed ${viewEvents.length} items`,
      data: { viewCount: viewEvents.length }
    })
  }

  // Analyze category preferences
  const categoryFrequency = new Map<string, number>()
  events.forEach(event => {
    if (event.categoryId) {
      categoryFrequency.set(event.categoryId, (categoryFrequency.get(event.categoryId) || 0) + 1)
    }
  })

  if (categoryFrequency.size > 0) {
    const topCategory = Array.from(categoryFrequency.entries())
      .sort(([, a], [, b]) => b - a)[0]

    insights.push({
      type: 'preference',
      confidence: 0.8,
      description: `Strong interest in ${topCategory[0]} category`,
      data: { category: topCategory[0], frequency: topCategory[1] }
    })
  }

  // Analyze brand preferences
  const brandFrequency = new Map<string, number>()
  events.forEach(event => {
    if (event.brandName) {
      brandFrequency.set(event.brandName, (brandFrequency.get(event.brandName) || 0) + 1)
    }
  })

  if (brandFrequency.size > 0) {
    const topBrand = Array.from(brandFrequency.entries())
      .sort(([, a], [, b]) => b - a)[0]

    if (topBrand[1] > 2) { // Only if viewed multiple times
      insights.push({
        type: 'preference',
        confidence: 0.7,
        description: `Brand affinity detected for ${topBrand[0]}`,
        data: { brand: topBrand[0], frequency: topBrand[1] }
      })
    }
  }

  // Analyze behavior patterns
  const sessionDuration = events.length > 0 ?
    events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime() : 0

  if (sessionDuration > 10 * 60 * 1000) { // More than 10 minutes
    insights.push({
      type: 'behavior-pattern',
      confidence: 0.6,
      description: 'Extended browsing session indicates high engagement',
      data: { duration: sessionDuration, engagementLevel: 'high' }
    })
  }

  return insights
}

/**
 * Extract color preferences from product data
 */
export const extractColorPreferences = (events: BehaviorEvent[]): ColorProfile[] => {
  // This would analyze product images/metadata to extract colors
  // For now, return mock data based on common fashion colors
  const mockColors: ColorProfile[] = [
    { color: '#2D5016', name: 'Forest Green', frequency: 0.3, confidence: 0.8, season: 'fall' },
    { color: '#8B4513', name: 'Saddle Brown', frequency: 0.25, confidence: 0.7, season: 'fall' },
    { color: '#000000', name: 'Black', frequency: 0.2, confidence: 0.9 },
    { color: '#FFFFFF', name: 'White', frequency: 0.15, confidence: 0.8 },
    { color: '#4169E1', name: 'Royal Blue', frequency: 0.1, confidence: 0.6, season: 'spring' }
  ]

  return mockColors
}

/**
 * Calculate brand affinities from behavior events
 */
export const calculateBrandAffinities = (events: BehaviorEvent[]): BrandAffinity[] => {
  const brandStats = new Map<string, {
    viewCount: number
    purchaseCount: number
    totalSpent: number
    lastPurchase?: Date
    categories: Set<string>
  }>()

  events.forEach(event => {
    if (!event.brandName) return

    const stats = brandStats.get(event.brandName) || {
      viewCount: 0,
      purchaseCount: 0,
      totalSpent: 0,
      categories: new Set()
    }

    if (event.eventType === 'view') {
      stats.viewCount++
    } else if (event.eventType === 'purchase') {
      stats.purchaseCount++
      stats.lastPurchase = event.timestamp
      // Would extract price from metadata in real implementation
      stats.totalSpent += event.metadata.priceAtTime || 0
    }

    if (event.categoryId) {
      stats.categories.add(event.categoryId)
    }

    brandStats.set(event.brandName, stats)
  })

  return Array.from(brandStats.entries()).map(([brandName, stats]) => ({
    brandName,
    affinity: Math.min(1, (stats.viewCount * 0.1 + stats.purchaseCount * 0.5) / 10),
    purchaseCount: stats.purchaseCount,
    averageSpend: stats.purchaseCount > 0 ? stats.totalSpent / stats.purchaseCount : 0,
    lastPurchase: stats.lastPurchase || new Date(),
    categories: Array.from(stats.categories)
  })).sort((a, b) => b.affinity - a.affinity)
}

/**
 * Calculate category preferences from behavior events
 */
export const calculateCategoryPreferences = (events: BehaviorEvent[]): CategoryWeight[] => {
  const categoryStats = new Map<string, {
    viewCount: number
    purchaseCount: number
    totalSpent: number
    recentViews: number
  }>()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  events.forEach(event => {
    if (!event.categoryId) return

    const stats = categoryStats.get(event.categoryId) || {
      viewCount: 0,
      purchaseCount: 0,
      totalSpent: 0,
      recentViews: 0
    }

    if (event.eventType === 'view') {
      stats.viewCount++
      if (event.timestamp > thirtyDaysAgo) {
        stats.recentViews++
      }
    } else if (event.eventType === 'purchase') {
      stats.purchaseCount++
      stats.totalSpent += event.metadata.priceAtTime || 0
    }

    categoryStats.set(event.categoryId, stats)
  })

  return Array.from(categoryStats.entries()).map(([category, stats]) => {
    const weight = Math.min(1, (stats.viewCount * 0.1 + stats.purchaseCount * 0.5) / 20)
    const trendDirection = stats.recentViews > stats.viewCount * 0.3 ? 'increasing' :
      stats.recentViews < stats.viewCount * 0.1 ? 'decreasing' : 'stable'

    return {
      category,
      weight,
      purchaseFrequency: stats.purchaseCount,
      averageSpend: stats.purchaseCount > 0 ? stats.totalSpent / stats.purchaseCount : 0,
      trendDirection: trendDirection as 'increasing' | 'stable' | 'decreasing'
    }
  }).sort((a, b) => b.weight - a.weight)
}

/**
 * Detect shopping behavior patterns
 */
export const detectBehaviorPatterns = (events: BehaviorEvent[]): PatternResult[] => {
  const patterns: PatternResult[] = []

  // Seasonal pattern detection
  const seasonalData = analyzeSeasonalPatterns(events)
  if (seasonalData.strength > 0.6) {
    patterns.push({
      pattern: 'seasonal-shift',
      strength: seasonalData.strength,
      description: seasonalData.description,
      recommendations: seasonalData.recommendations,
      timeframe: seasonalData.timeframe
    })
  }

  // Brand loyalty pattern
  const brandLoyalty = analyzeBrandLoyalty(events)
  if (brandLoyalty.strength > 0.7) {
    patterns.push({
      pattern: 'brand-loyalty',
      strength: brandLoyalty.strength,
      description: brandLoyalty.description,
      recommendations: brandLoyalty.recommendations,
      timeframe: brandLoyalty.timeframe
    })
  }

  // Price sensitivity pattern
  const priceSensitivity = analyzePriceSensitivity(events)
  if (priceSensitivity.strength > 0.5) {
    patterns.push({
      pattern: 'price-sensitivity',
      strength: priceSensitivity.strength,
      description: priceSensitivity.description,
      recommendations: priceSensitivity.recommendations,
      timeframe: priceSensitivity.timeframe
    })
  }

  return patterns
}

/**
 * Analyze seasonal shopping patterns
 */
const analyzeSeasonalPatterns = (events: BehaviorEvent[]) => {
  const currentSeason = getCurrentSeason()
  const seasonalEvents = events.filter(event => {
    const eventSeason = getSeasonFromDate(event.timestamp)
    return eventSeason === currentSeason
  })

  const strength = seasonalEvents.length / Math.max(events.length, 1)

  return {
    strength,
    description: `${Math.round(strength * 100)}% of shopping activity occurs in ${currentSeason}`,
    recommendations: [`Focus on ${currentSeason} collections`, `Prepare for ${getNextSeason(currentSeason)} transition`],
    timeframe: {
      start: new Date(new Date().getFullYear(), getSeasonStartMonth(currentSeason), 1),
      end: new Date(new Date().getFullYear(), getSeasonEndMonth(currentSeason), 30)
    }
  }
}

/**
 * Analyze brand loyalty patterns
 */
const analyzeBrandLoyalty = (events: BehaviorEvent[]) => {
  const brandCounts = new Map<string, number>()
  events.forEach(event => {
    if (event.brandName && event.eventType === 'purchase') {
      brandCounts.set(event.brandName, (brandCounts.get(event.brandName) || 0) + 1)
    }
  })

  const totalPurchases = Array.from(brandCounts.values()).reduce((sum, count) => sum + count, 0)
  const topBrandCount = Math.max(...Array.from(brandCounts.values()), 0)
  const strength = totalPurchases > 0 ? topBrandCount / totalPurchases : 0

  const topBrand = Array.from(brandCounts.entries())
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

  return {
    strength,
    description: `${Math.round(strength * 100)}% brand loyalty to ${topBrand}`,
    recommendations: [`Explore new arrivals from ${topBrand}`, 'Consider similar brands for variety'],
    timeframe: {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }
}

/**
 * Analyze price sensitivity patterns
 */
const analyzePriceSensitivity = (events: BehaviorEvent[]) => {
  const priceEvents = events.filter(event =>
    event.metadata.priceAtTime && event.eventType === 'purchase'
  )

  if (priceEvents.length === 0) {
    return { strength: 0, description: '', recommendations: [], timeframe: { start: new Date(), end: new Date() } }
  }

  const prices = priceEvents.map(event => event.metadata.priceAtTime!).sort((a, b) => a - b)
  const median = prices[Math.floor(prices.length / 2)]
  const lowPriceCount = prices.filter(p => p < median * 0.8).length
  const strength = lowPriceCount / prices.length

  return {
    strength,
    description: `${Math.round(strength * 100)}% of purchases are below median price point`,
    recommendations: ['Look for sales and discounts', 'Consider value-focused brands'],
    timeframe: {
      start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }
}

/**
 * Helper functions for seasonal analysis
 */
const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

const getSeasonFromDate = (date: Date): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

const getNextSeason = (season: 'spring' | 'summer' | 'fall' | 'winter'): string => {
  const seasons = ['spring', 'summer', 'fall', 'winter']
  const currentIndex = seasons.indexOf(season)
  return seasons[(currentIndex + 1) % seasons.length]
}

const getSeasonStartMonth = (season: 'spring' | 'summer' | 'fall' | 'winter'): number => {
  switch (season) {
    case 'spring': return 2
    case 'summer': return 5
    case 'fall': return 8
    case 'winter': return 11
  }
}

const getSeasonEndMonth = (season: 'spring' | 'summer' | 'fall' | 'winter'): number => {
  switch (season) {
    case 'spring': return 4
    case 'summer': return 7
    case 'fall': return 10
    case 'winter': return 1
  }
}

/**
 * Generate insights for story content from Style DNA
 */
export const generateStoryInsights = (profile: StyleProfile): Insight[] => {
  const insights: Insight[] = []

  // Color preference insights
  if (profile.dominantColors.length > 0) {
    const topColor = profile.dominantColors[0]
    insights.push({
      id: generateId(),
      type: 'color-preference',
      title: `Your signature color: ${topColor.name}`,
      description: `${topColor.name} appears in ${Math.round(topColor.frequency * 100)}% of your style choices`,
      confidence: topColor.confidence,
      data: { color: topColor.color, frequency: topColor.frequency },
      visualType: 'color-palette'
    })
  }

  // Brand affinity insights
  if (profile.preferredBrands.length > 0) {
    const topBrand = profile.preferredBrands[0]
    insights.push({
      id: generateId(),
      type: 'brand-affinity',
      title: `Brand loyalty: ${topBrand.brandName}`,
      description: `You've made ${topBrand.purchaseCount} purchases from ${topBrand.brandName}`,
      confidence: topBrand.affinity,
      data: { brand: topBrand.brandName, purchaseCount: topBrand.purchaseCount },
      visualType: 'brand-cloud'
    })
  }

  // Category trend insights
  if (profile.categoryPreferences.length > 0) {
    const topCategory = profile.categoryPreferences[0]
    insights.push({
      id: generateId(),
      type: 'category-trend',
      title: `Style focus: ${topCategory.category}`,
      description: `${topCategory.category} represents ${Math.round(topCategory.weight * 100)}% of your style DNA`,
      confidence: topCategory.weight,
      data: { category: topCategory.category, trend: topCategory.trendDirection },
      visualType: 'chart'
    })
  }

  // Price pattern insights
  if (profile.priceRanges.length > 0) {
    const avgPrice = profile.priceRanges.reduce((sum, range) => sum + range.average, 0) / profile.priceRanges.length
    insights.push({
      id: generateId(),
      type: 'price-pattern',
      title: `Your style budget`,
      description: `Average spend: $${Math.round(avgPrice)} per item`,
      confidence: 0.8,
      data: { averagePrice: avgPrice, ranges: profile.priceRanges },
      visualType: 'chart'
    })
  }

  // Seasonal insights
  if (profile.seasonalTrends.length > 0) {
    const currentSeason = getCurrentSeason()
    const seasonalTrend = profile.seasonalTrends.find(trend => trend.season === currentSeason)

    if (seasonalTrend) {
      insights.push({
        id: generateId(),
        type: 'seasonal-shift',
        title: `${currentSeason} style evolution`,
        description: `Your ${currentSeason} style is ${seasonalTrend.styleEvolution > 0 ? 'more experimental' : 'more refined'} this year`,
        confidence: 0.7,
        data: { season: currentSeason, evolution: seasonalTrend.styleEvolution },
        visualType: 'trend-line'
      })
    } else if (profile.seasonalTrends.length > 0) {
      // If no current season data, use the most recent seasonal trend
      const latestTrend = profile.seasonalTrends[0]
      insights.push({
        id: generateId(),
        type: 'seasonal-shift',
        title: `${latestTrend.season} style evolution`,
        description: `Your ${latestTrend.season} style was ${latestTrend.styleEvolution > 0 ? 'more experimental' : 'more refined'} this year`,
        confidence: 0.6,
        data: { season: latestTrend.season, evolution: latestTrend.styleEvolution },
        visualType: 'trend-line'
      })
    }
  }

  return insights
}