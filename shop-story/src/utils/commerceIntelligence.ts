// Commerce intelligence algorithms for product curation and recommendations
import type { 
  ProductSet, 
  ProductRecommendation, 
  CommerceIntelligence,
  CurationAlgorithm,
  AlgorithmWeights,
  RecommendationMetadata,
  PurchaseOption
} from '../types/commerce'
import type { StyleProfile, BehaviorEvent } from '../types/analytics'
import type { Product } from '../types/story'

/**
 * Main commerce intelligence engine
 */
export class CommerceIntelligenceEngine implements CommerceIntelligence {
  private readonly algorithm: CurationAlgorithm
  private readonly mockProducts: Product[] // In real app, this would come from Shop Minis API

  constructor(algorithm?: Partial<CurationAlgorithm>) {
    this.algorithm = {
      name: 'StyleDNA-v1',
      version: '1.0.0',
      parameters: {
        minConfidence: 0.6,
        maxSetsPerUser: 10,
        bundleDiscountRate: 0.15,
        urgencyThreshold: 0.7
      },
      weights: {
        styleMatch: 0.3,
        pricePreference: 0.2,
        brandAffinity: 0.15,
        seasonalRelevance: 0.15,
        trendingScore: 0.1,
        socialProof: 0.1
      },
      ...algorithm
    }

    // Mock product data - in real implementation, this would come from Shop Minis API
    this.mockProducts = this.generateMockProducts()
  }

  /**
   * Generate curated product sets based on Style DNA
   */
  async generateSets(styleProfile: StyleProfile): Promise<ProductSet[]> {
    const sets: ProductSet[] = []

    // Generate color-based sets
    const colorSets = await this.generateColorBasedSets(styleProfile)
    sets.push(...colorSets)

    // Generate brand affinity sets
    const brandSets = await this.generateBrandAffinitySets(styleProfile)
    sets.push(...brandSets)

    // Generate category completion sets
    const categorySets = await this.generateCategoryCompletionSets(styleProfile)
    sets.push(...categorySets)

    // Generate seasonal sets
    const seasonalSets = await this.generateSeasonalSets(styleProfile)
    sets.push(...seasonalSets)

    // Sort by relevance and limit results
    const sortedSets = sets
      .sort((a, b) => this.calculateSetRelevance(b, styleProfile) - this.calculateSetRelevance(a, styleProfile))
      .slice(0, this.algorithm.parameters.maxSetsPerUser)

    return sortedSets
  }

  /**
   * Update recommendations based on new behavior events
   */
  async updateRecommendations(userId: string, behaviorEvents: BehaviorEvent[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []

    // Generate style match recommendations
    const styleMatches = await this.generateStyleMatchRecommendations(behaviorEvents)
    recommendations.push(...styleMatches)

    // Generate complete-the-set recommendations
    const completeSetRecs = await this.generateCompleteSetRecommendations(behaviorEvents)
    recommendations.push(...completeSetRecs)

    // Generate trending recommendations
    const trendingRecs = await this.generateTrendingRecommendations(behaviorEvents)
    recommendations.push(...trendingRecs)

    // Generate price drop recommendations
    const priceDropRecs = await this.generatePriceDropRecommendations(behaviorEvents)
    recommendations.push(...priceDropRecs)

    // Filter by confidence threshold and sort
    return recommendations
      .filter(rec => rec.confidence >= this.algorithm.parameters.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20) // Limit to top 20 recommendations
  }

  /**
   * Optimize pricing for product sets
   */
  async optimizePricing(productSet: ProductSet): Promise<PurchaseOption[]> {
    const options: PurchaseOption[] = []

    // Individual purchase option
    const individualPrice = productSet.products.reduce((sum, product) => 
      sum + parseFloat(product.price.amount), 0
    )
    
    options.push({
      type: 'individual',
      price: individualPrice,
      currency: productSet.products[0]?.price.currencyCode || 'USD',
      description: 'Buy items separately',
      available: true
    })

    // Bundle option with discount
    const bundleDiscount = this.algorithm.parameters.bundleDiscountRate
    const bundlePrice = individualPrice * (1 - bundleDiscount)
    const savings = individualPrice - bundlePrice

    options.push({
      type: 'bundle',
      price: bundlePrice,
      currency: productSet.products[0]?.price.currencyCode || 'USD',
      savings,
      description: `Save $${savings.toFixed(2)} when you buy the complete set`,
      available: true
    })

    // Subscription option (if applicable)
    if (this.isSubscriptionEligible(productSet)) {
      const subscriptionPrice = bundlePrice * 0.9 // Additional 10% off for subscription
      options.push({
        type: 'subscription',
        price: subscriptionPrice,
        currency: productSet.products[0]?.price.currencyCode || 'USD',
        savings: individualPrice - subscriptionPrice,
        description: 'Subscribe and save an additional 10%',
        available: true
      })
    }

    return options
  }

  /**
   * Track performance metrics for sets
   */
  async trackPerformance(setId: string, event: any): Promise<void> {
    // In real implementation, this would send analytics to tracking service
    console.log(`Commerce event tracked: ${event.type} for set ${setId}`)
  }

  /**
   * Generate color-based product sets
   */
  private async generateColorBasedSets(styleProfile: StyleProfile): Promise<ProductSet[]> {
    const sets: ProductSet[] = []

    // Get top 2 dominant colors
    const topColors = styleProfile.dominantColors.slice(0, 2)

    for (const colorProfile of topColors) {
      const matchingProducts = this.mockProducts.filter(product => 
        this.productMatchesColor(product, colorProfile.color)
      ).slice(0, 4)

      if (matchingProducts.length >= 2) {
        const set: ProductSet = {
          id: `color-set-${colorProfile.color.replace('#', '')}`,
          name: `${colorProfile.name} Collection`,
          insight: `Your top color is ${colorProfile.name} - complete your ${colorProfile.name.toLowerCase()} capsule`,
          products: matchingProducts,
          bundlePrice: this.calculateBundlePrice(matchingProducts),
          originalPrice: this.calculateOriginalPrice(matchingProducts),
          urgencyLevel: this.calculateUrgencyLevel(colorProfile.frequency),
          completionStatus: this.calculateCompletionStatus(matchingProducts, styleProfile),
          createdAt: new Date(),
          tags: ['color-match', colorProfile.name.toLowerCase()],
          category: 'color-curated'
        }

        set.savings = set.originalPrice - (set.bundlePrice || set.originalPrice)
        sets.push(set)
      }
    }

    return sets
  }

  /**
   * Generate brand affinity-based sets
   */
  private async generateBrandAffinitySets(styleProfile: StyleProfile): Promise<ProductSet[]> {
    const sets: ProductSet[] = []

    // Get top brand with high affinity
    const topBrand = styleProfile.preferredBrands
      .filter(brand => brand.affinity > 0.7)
      .sort((a, b) => b.affinity - a.affinity)[0]

    if (topBrand) {
      const brandProducts = this.mockProducts.filter(product => 
        product.vendor?.toLowerCase() === topBrand.brandName.toLowerCase()
      ).slice(0, 3)

      if (brandProducts.length >= 2) {
        const set: ProductSet = {
          id: `brand-set-${topBrand.brandName.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${topBrand.brandName} Favorites`,
          insight: `You love ${topBrand.brandName} - discover more from your favorite brand`,
          products: brandProducts,
          bundlePrice: this.calculateBundlePrice(brandProducts),
          originalPrice: this.calculateOriginalPrice(brandProducts),
          urgencyLevel: 'medium',
          completionStatus: 0.8, // High completion for brand affinity
          createdAt: new Date(),
          tags: ['brand-affinity', topBrand.brandName.toLowerCase()],
          category: 'brand-curated'
        }

        set.savings = set.originalPrice - (set.bundlePrice || set.originalPrice)
        sets.push(set)
      }
    }

    return sets
  }

  /**
   * Generate category completion sets
   */
  private async generateCategoryCompletionSets(styleProfile: StyleProfile): Promise<ProductSet[]> {
    const sets: ProductSet[] = []

    // Find categories with high preference but potential gaps
    const topCategories = styleProfile.categoryPreferences
      .filter(cat => cat.weight > 0.6)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 2)

    for (const category of topCategories) {
      const categoryProducts = this.mockProducts.filter(product => 
        product.productType?.toLowerCase().includes(category.category.toLowerCase())
      ).slice(0, 5)

      if (categoryProducts.length >= 3) {
        const set: ProductSet = {
          id: `category-set-${category.category.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Complete Your ${category.category} Collection`,
          insight: `You're building a strong ${category.category.toLowerCase()} wardrobe - complete the look`,
          products: categoryProducts,
          bundlePrice: this.calculateBundlePrice(categoryProducts),
          originalPrice: this.calculateOriginalPrice(categoryProducts),
          urgencyLevel: this.calculateCategoryUrgency(category),
          completionStatus: category.weight,
          createdAt: new Date(),
          tags: ['category-completion', category.category.toLowerCase()],
          category: 'category-curated'
        }

        set.savings = set.originalPrice - (set.bundlePrice || set.originalPrice)
        sets.push(set)
      }
    }

    return sets
  }

  /**
   * Generate seasonal product sets
   */
  private async generateSeasonalSets(styleProfile: StyleProfile): Promise<ProductSet[]> {
    const sets: ProductSet[] = []
    const currentSeason = this.getCurrentSeason()
    
    const seasonalTrend = styleProfile.seasonalTrends.find(trend => trend.season === currentSeason)
    if (!seasonalTrend) return sets

    // Create seasonal set based on current season trends
    const seasonalProducts = this.mockProducts.filter(product => 
      this.isSeasonallyAppropriate(product, currentSeason)
    ).slice(0, 4)

    if (seasonalProducts.length >= 2) {
      const set: ProductSet = {
        id: `seasonal-set-${currentSeason}-${new Date().getFullYear()}`,
        name: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Essentials`,
        insight: `Refresh your ${currentSeason} wardrobe with these curated essentials`,
        products: seasonalProducts,
        bundlePrice: this.calculateBundlePrice(seasonalProducts),
        originalPrice: this.calculateOriginalPrice(seasonalProducts),
        urgencyLevel: 'high', // Seasonal items have urgency
        completionStatus: 0.3, // New seasonal collection
        expiresAt: this.getSeasonEndDate(currentSeason),
        createdAt: new Date(),
        tags: ['seasonal', currentSeason],
        category: 'seasonal-curated'
      }

      set.savings = set.originalPrice - (set.bundlePrice || set.originalPrice)
      sets.push(set)
    }

    return sets
  }

  /**
   * Generate style match recommendations
   */
  private async generateStyleMatchRecommendations(events: BehaviorEvent[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []

    // Analyze recent viewing patterns
    const recentViews = events
      .filter(e => e.eventType === 'view')
      .slice(-10) // Last 10 views

    for (const viewEvent of recentViews) {
      if (!viewEvent.productId) continue
      
      const similarProducts = this.findSimilarProducts(viewEvent.productId)
      
      for (const product of similarProducts.slice(0, 2)) {
        const metadata: RecommendationMetadata = {
          styleMatch: 0.8,
          priceScore: 0.7,
          trendScore: 0.6,
          seasonalRelevance: 0.8
        }

        const confidence = this.calculateRecommendationConfidence(metadata)
        if (confidence >= this.algorithm.parameters.minConfidence) {
          recommendations.push({
            productId: product.id,
            reason: `Similar to items you've been viewing`,
            confidence,
            type: 'style-match',
            metadata
          })
        }
      }
    }

    return recommendations
  }

  /**
   * Generate complete-the-set recommendations
   */
  private async generateCompleteSetRecommendations(events: BehaviorEvent[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []

    // Find items in cart that could be part of sets
    const cartItems = events
      .filter(e => e.eventType === 'add_to_cart')
      .map(e => e.productId)
      .filter(Boolean)

    for (const productId of cartItems) {
      if (!productId) continue
      
      const complementaryProducts = this.findComplementaryProducts(productId)
      
      for (const product of complementaryProducts.slice(0, 2)) {
        const metadata: RecommendationMetadata = {
          styleMatch: 0.9,
          priceScore: 0.8,
          complementaryItems: [productId]
        }

        const confidence = this.calculateRecommendationConfidence(metadata)
        if (confidence >= this.algorithm.parameters.minConfidence) {
          recommendations.push({
            productId: product.id,
            reason: `Complete your look with this matching piece`,
            confidence,
            type: 'complete-set',
            urgency: 'limited-time',
            metadata
          })
        }
      }
    }

    return recommendations
  }

  /**
   * Generate trending recommendations
   */
  private async generateTrendingRecommendations(events: BehaviorEvent[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []

    // Get trending products (mock implementation)
    const trendingProducts = this.mockProducts
      .filter(product => Math.random() > 0.7) // Mock trending filter
      .slice(0, 5)

    for (const product of trendingProducts) {
      const metadata: RecommendationMetadata = {
        trendScore: 0.9,
        socialProof: 0.8,
        seasonalRelevance: 0.7
      }

      recommendations.push({
        productId: product.id,
        reason: `Trending now in your style`,
        confidence: this.calculateRecommendationConfidence(metadata),
        type: 'trending',
        metadata
      })
    }

    return recommendations
  }

  /**
   * Generate price drop recommendations
   */
  private async generatePriceDropRecommendations(events: BehaviorEvent[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = []

    // Find previously viewed items with price drops (mock implementation)
    const viewedProducts = events
      .filter(e => e.eventType === 'view')
      .map(e => e.productId)
      .filter(Boolean)

    const uniqueViewed = [...new Set(viewedProducts)]

    for (const productId of uniqueViewed.slice(0, 3)) {
      const product = this.mockProducts.find(p => p.id === productId)
      if (product && Math.random() > 0.8) { // Mock price drop
        const metadata: RecommendationMetadata = {
          priceScore: 0.95,
          styleMatch: 0.7
        }

        recommendations.push({
          productId: product.id,
          reason: `Price dropped on item you viewed`,
          confidence: this.calculateRecommendationConfidence(metadata),
          type: 'price-drop',
          urgency: 'price-ending',
          metadata
        })
      }
    }

    return recommendations
  }

  // Helper methods

  private calculateSetRelevance(set: ProductSet, styleProfile: StyleProfile): number {
    let relevance = 0

    // Factor in completion status
    relevance += set.completionStatus * 0.3

    // Factor in urgency
    const urgencyScore = set.urgencyLevel === 'high' ? 1 : set.urgencyLevel === 'medium' ? 0.7 : 0.4
    relevance += urgencyScore * 0.2

    // Factor in style match (simplified)
    relevance += 0.5 // Base style match

    return relevance
  }

  private calculateBundlePrice(products: Product[]): number {
    const originalPrice = this.calculateOriginalPrice(products)
    return originalPrice * (1 - this.algorithm.parameters.bundleDiscountRate)
  }

  private calculateOriginalPrice(products: Product[]): number {
    return products.reduce((sum, product) => sum + parseFloat(product.price.amount), 0)
  }

  private calculateUrgencyLevel(frequency: number): 'low' | 'medium' | 'high' {
    if (frequency > 0.8) return 'high'
    if (frequency > 0.5) return 'medium'
    return 'low'
  }

  private calculateCompletionStatus(products: Product[], styleProfile: StyleProfile): number {
    // Simplified calculation based on how well products match user's style
    return Math.min(0.9, products.length * 0.2 + 0.1)
  }

  private calculateCategoryUrgency(category: any): 'low' | 'medium' | 'high' {
    return category.weight > 0.8 ? 'high' : category.weight > 0.6 ? 'medium' : 'low'
  }

  private calculateRecommendationConfidence(metadata: RecommendationMetadata): number {
    const weights = this.algorithm.weights
    let confidence = 0

    if (metadata.styleMatch) confidence += metadata.styleMatch * weights.styleMatch
    if (metadata.priceScore) confidence += metadata.priceScore * weights.pricePreference
    if (metadata.trendScore) confidence += metadata.trendScore * weights.trendingScore
    if (metadata.seasonalRelevance) confidence += metadata.seasonalRelevance * weights.seasonalRelevance
    if (metadata.socialProof) confidence += metadata.socialProof * weights.socialProof

    return Math.min(1, confidence)
  }

  private productMatchesColor(product: Product, color: string): boolean {
    // Simplified color matching - in real implementation would analyze product images
    const colorKeywords = this.getColorKeywords(color)
    const productText = `${product.title} ${product.description || ''}`.toLowerCase()
    
    return colorKeywords.some(keyword => productText.includes(keyword))
  }

  private getColorKeywords(color: string): string[] {
    // Map hex colors to keywords
    const colorMap: Record<string, string[]> = {
      '#90EE90': ['green', 'mint', 'sage', 'olive'],
      '#FFB6C1': ['pink', 'rose', 'blush', 'coral'],
      '#F0E68C': ['yellow', 'gold', 'cream', 'butter'],
      '#DDA0DD': ['purple', 'lavender', 'plum', 'violet'],
      '#87CEEB': ['blue', 'sky', 'azure', 'powder'],
      '#FF6347': ['red', 'tomato', 'coral', 'salmon'],
      '#32CD32': ['green', 'lime', 'forest', 'emerald'],
      '#D2691E': ['orange', 'rust', 'copper', 'burnt'],
      '#8B4513': ['brown', 'chocolate', 'coffee', 'mocha'],
      '#CD853F': ['tan', 'beige', 'camel', 'sand'],
      '#A0522D': ['brown', 'sienna', 'chestnut', 'mahogany']
    }

    return colorMap[color] || ['neutral']
  }

  private isSeasonallyAppropriate(product: Product, season: string): boolean {
    const productText = `${product.title} ${product.description || ''}`.toLowerCase()
    
    const seasonalKeywords: Record<string, string[]> = {
      spring: ['light', 'fresh', 'cotton', 'linen', 'pastel'],
      summer: ['shorts', 'tank', 'sandals', 'swimwear', 'light'],
      fall: ['sweater', 'jacket', 'boots', 'warm', 'cozy'],
      winter: ['coat', 'wool', 'warm', 'thermal', 'heavy']
    }

    const keywords = seasonalKeywords[season] || []
    return keywords.some(keyword => productText.includes(keyword))
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  private getSeasonEndDate(season: string): Date {
    const year = new Date().getFullYear()
    switch (season) {
      case 'spring': return new Date(year, 4, 31) // End of May
      case 'summer': return new Date(year, 7, 31) // End of August
      case 'fall': return new Date(year, 10, 30) // End of November
      case 'winter': return new Date(year + 1, 1, 28) // End of February next year
      default: return new Date(year, 11, 31) // End of year
    }
  }

  private findSimilarProducts(productId: string): Product[] {
    // Mock implementation - in real app would use ML similarity
    return this.mockProducts.filter(p => p.id !== productId).slice(0, 3)
  }

  private findComplementaryProducts(productId: string): Product[] {
    // Mock implementation - in real app would use complementary item logic
    return this.mockProducts.filter(p => p.id !== productId).slice(0, 2)
  }

  private isSubscriptionEligible(productSet: ProductSet): boolean {
    // Check if products are subscription-eligible (e.g., consumables, basics)
    const eligibleCategories = ['basics', 'skincare', 'supplements']
    return productSet.products.some(product => 
      eligibleCategories.some(category => 
        product.productType?.toLowerCase().includes(category)
      )
    )
  }

  private generateMockProducts(): Product[] {
    // Mock product data for development
    return [
      {
        id: 'prod-1',
        title: 'Sage Green Linen Shirt',
        description: 'Comfortable linen shirt in sage green',
        images: [{ id: 'img-1', url: '/mock-image-1.jpg' }],
        price: { amount: '89.99', currencyCode: 'USD' },
        vendor: 'Everlane',
        productType: 'Shirts',
        tags: ['green', 'linen', 'casual']
      },
      {
        id: 'prod-2',
        title: 'Blush Pink Silk Blouse',
        description: 'Elegant silk blouse in blush pink',
        images: [{ id: 'img-2', url: '/mock-image-2.jpg' }],
        price: { amount: '129.99', currencyCode: 'USD' },
        vendor: 'Reformation',
        productType: 'Blouses',
        tags: ['pink', 'silk', 'elegant']
      },
      {
        id: 'prod-3',
        title: 'Cream Cashmere Sweater',
        description: 'Luxurious cashmere sweater in cream',
        images: [{ id: 'img-3', url: '/mock-image-3.jpg' }],
        price: { amount: '199.99', currencyCode: 'USD' },
        vendor: 'Everlane',
        productType: 'Sweaters',
        tags: ['cream', 'cashmere', 'luxury']
      },
      {
        id: 'prod-4',
        title: 'Navy Blue Wool Coat',
        description: 'Classic wool coat in navy blue',
        images: [{ id: 'img-4', url: '/mock-image-4.jpg' }],
        price: { amount: '299.99', currencyCode: 'USD' },
        vendor: 'COS',
        productType: 'Coats',
        tags: ['navy', 'wool', 'classic']
      },
      {
        id: 'prod-5',
        title: 'Olive Green Cargo Pants',
        description: 'Utility cargo pants in olive green',
        images: [{ id: 'img-5', url: '/mock-image-5.jpg' }],
        price: { amount: '79.99', currencyCode: 'USD' },
        vendor: 'Reformation',
        productType: 'Pants',
        tags: ['olive', 'cargo', 'utility']
      },
      {
        id: 'prod-6',
        title: 'White Cotton T-Shirt',
        description: 'Basic white cotton t-shirt',
        images: [{ id: 'img-6', url: '/mock-image-6.jpg' }],
        price: { amount: '29.99', currencyCode: 'USD' },
        vendor: 'Everlane',
        productType: 'T-Shirts',
        tags: ['white', 'cotton', 'basic']
      }
    ]
  }
}

/**
 * Factory function to create commerce intelligence engine
 */
export const createCommerceIntelligence = (algorithm?: Partial<CurationAlgorithm>): CommerceIntelligence => {
  return new CommerceIntelligenceEngine(algorithm)
}

/**
 * Utility function to calculate bundle savings
 */
export const calculateBundleSavings = (products: Product[], discountRate: number = 0.15): number => {
  const originalPrice = products.reduce((sum, product) => sum + parseFloat(product.price.amount), 0)
  return originalPrice * discountRate
}

/**
 * Utility function to determine urgency level based on various factors
 */
export const determineUrgencyLevel = (
  stockLevel?: number,
  priceHistory?: number[],
  seasonalRelevance?: number
): 'low' | 'medium' | 'high' => {
  let urgencyScore = 0

  // Factor in stock level
  if (stockLevel !== undefined) {
    if (stockLevel < 5) urgencyScore += 0.8
    else if (stockLevel < 20) urgencyScore += 0.5
  }

  // Factor in price trends
  if (priceHistory && priceHistory.length >= 2) {
    const recentPrice = priceHistory[priceHistory.length - 1]
    const previousPrice = priceHistory[priceHistory.length - 2]
    if (recentPrice < previousPrice) urgencyScore += 0.4 // Price drop
  }

  // Factor in seasonal relevance
  if (seasonalRelevance !== undefined) {
    urgencyScore += seasonalRelevance * 0.5
  }

  if (urgencyScore >= 0.7) return 'high'
  if (urgencyScore >= 0.4) return 'medium'
  return 'low'
}

/**
 * Utility function to validate product set completeness
 */
export const validateProductSet = (productSet: ProductSet): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!productSet.id) errors.push('Product set must have an ID')
  if (!productSet.name) errors.push('Product set must have a name')
  if (!productSet.insight) errors.push('Product set must have an insight')
  if (!productSet.products || productSet.products.length === 0) {
    errors.push('Product set must contain at least one product')
  }
  if (productSet.completionStatus < 0 || productSet.completionStatus > 1) {
    errors.push('Completion status must be between 0 and 1')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}