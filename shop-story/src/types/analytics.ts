// Analytics and behavior tracking type definitions

export interface StyleProfile {
  userId: string
  dominantColors: ColorProfile[]
  preferredBrands: BrandAffinity[]
  categoryPreferences: CategoryWeight[]
  priceRanges: PriceRange[]
  seasonalTrends: SeasonalData[]
  evolutionScore: number
  lastUpdated: Date
}

export interface ColorProfile {
  color: string // hex color code
  name: string // human-readable color name
  frequency: number // 0-1 representing how often this color appears
  confidence: number // 0-1 confidence in this preference
  season?: 'spring' | 'summer' | 'fall' | 'winter'
}

export interface BrandAffinity {
  brandName: string
  affinity: number // 0-1 score
  purchaseCount: number
  averageSpend: number
  lastPurchase: Date
  categories: string[]
}

export interface CategoryWeight {
  category: string
  weight: number // 0-1 representing preference strength
  purchaseFrequency: number
  averageSpend: number
  trendDirection: 'increasing' | 'stable' | 'decreasing'
}

export interface PriceRange {
  category: string
  min: number
  max: number
  average: number
  currency: string
  frequency: number // how often they shop in this range
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'fall' | 'winter'
  year: number
  dominantColors: string[]
  topCategories: string[]
  spendingPattern: number
  styleEvolution: number // -1 to 1, negative = more conservative, positive = more experimental
}

export interface BehaviorEvent {
  id: string
  userId: string
  eventType: 'view' | 'add_to_cart' | 'purchase' | 'share' | 'save' | 'search' | 'filter'
  productId?: string
  categoryId?: string
  brandName?: string
  timestamp: Date
  sessionId: string
  metadata: BehaviorMetadata
}

export interface BehaviorMetadata {
  source: 'story' | 'browse' | 'search' | 'recommendation'
  duration?: number // time spent viewing in milliseconds
  scrollDepth?: number // 0-1 representing how much of content was viewed
  interactionCount?: number // number of taps/clicks
  priceAtTime?: number
  discountApplied?: boolean
  context?: Record<string, any>
}

export interface ShoppingSession {
  sessionId: string
  userId: string
  startTime: Date
  endTime?: Date
  events: BehaviorEvent[]
  insights: SessionInsight[]
  totalValue: number
  itemsViewed: number
  itemsPurchased: number
}

export interface SessionInsight {
  type: 'intent' | 'preference' | 'behavior-pattern'
  confidence: number
  description: string
  data: Record<string, any>
}

export interface AnalyticsEngine {
  processEvents(events: BehaviorEvent[]): Promise<StyleProfile>
  generateInsights(profile: StyleProfile): Promise<Insight[]>
  updateStyleDNA(userId: string, newEvents: BehaviorEvent[]): Promise<StyleProfile>
  detectPatterns(sessions: ShoppingSession[]): Promise<PatternResult[]>
}

export interface PatternResult {
  pattern: 'seasonal-shift' | 'brand-loyalty' | 'price-sensitivity' | 'category-expansion'
  strength: number // 0-1
  description: string
  recommendations: string[]
  timeframe: DateRange
}

export interface DateRange {
  start: Date
  end: Date
}

// Import Insight type to avoid circular dependencies
import type { Insight } from './story'