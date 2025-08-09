// Commerce and product curation type definitions

export interface ProductSet {
  id: string
  name: string
  insight: string // The insight that generated this set
  description?: string
  products: Product[]
  bundlePrice?: number
  originalPrice: number
  savings?: number
  urgencyLevel: 'low' | 'medium' | 'high'
  completionStatus: number // 0-1 representing how complete the set is
  expiresAt?: Date
  createdAt: Date
  tags: string[]
  category: string
}

export interface ProductCuration {
  userId: string
  curatedSets: ProductSet[]
  recommendations: ProductRecommendation[]
  lastUpdated: Date
  algorithm: CurationAlgorithm
}

export interface ProductRecommendation {
  productId: string
  reason: string
  confidence: number // 0-1
  type: 'style-match' | 'complete-set' | 'trending' | 'price-drop' | 'seasonal'
  urgency?: 'limited-time' | 'low-stock' | 'price-ending'
  metadata: RecommendationMetadata
}

export interface RecommendationMetadata {
  styleMatch?: number // 0-1 how well it matches user style
  priceScore?: number // 0-1 how well it matches price preferences  
  trendScore?: number // 0-1 how trending the item is
  seasonalRelevance?: number // 0-1 seasonal appropriateness
  complementaryItems?: string[] // product IDs that go well with this
}

export interface CurationAlgorithm {
  name: string
  version: string
  parameters: Record<string, any>
  weights: AlgorithmWeights
}

export interface AlgorithmWeights {
  styleMatch: number
  pricePreference: number
  brandAffinity: number
  seasonalRelevance: number
  trendingScore: number
  socialProof: number
}

export interface ShoppableSet {
  id: string
  productSet: ProductSet
  displayConfig: SetDisplayConfig
  interactionData: SetInteractionData
  purchaseOptions: PurchaseOption[]
}

export interface SetDisplayConfig {
  layout: 'grid' | 'carousel' | 'stack'
  aspectRatio: string // e.g., "1:1", "4:3", "16:9"
  showPricing: boolean
  showSavings: boolean
  showUrgency: boolean
  maxProducts: number
}

export interface SetInteractionData {
  views: number
  clicks: number
  addToCarts: number
  purchases: number
  shares: number
  conversionRate: number
}

export interface PurchaseOption {
  type: 'individual' | 'bundle' | 'subscription'
  price: number
  currency: string
  savings?: number
  description: string
  available: boolean
}

export interface CommerceIntelligence {
  generateSets(styleProfile: StyleProfile): Promise<ProductSet[]>
  updateRecommendations(userId: string, behaviorEvents: BehaviorEvent[]): Promise<ProductRecommendation[]>
  optimizePricing(productSet: ProductSet): Promise<PurchaseOption[]>
  trackPerformance(setId: string, event: CommerceEvent): Promise<void>
}

export interface CommerceEvent {
  type: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'share'
  setId: string
  productId?: string
  userId: string
  timestamp: Date
  value?: number
  metadata?: Record<string, any>
}

// Import types from other modules to avoid circular dependencies
import type { Product } from './story'
import type { StyleProfile, BehaviorEvent } from './analytics'