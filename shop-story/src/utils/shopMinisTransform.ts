// Shop Minis product data transformation utilities
import type { Product, ProductSet, ProductRecommendation } from '../types'

/**
 * Transform Shop Minis product data to our internal Product interface
 * This handles the conversion from Shop Minis API format to our standardized format
 */
export const transformShopMinisProduct = (shopMinisProduct: any): Product => {
  return {
    id: shopMinisProduct.id || shopMinisProduct.gid || '',
    title: shopMinisProduct.title || shopMinisProduct.name || '',
    description: shopMinisProduct.description || shopMinisProduct.body || '',
    images: transformProductImages(shopMinisProduct.images || shopMinisProduct.media || []),
    price: transformPrice(shopMinisProduct.price || shopMinisProduct.priceRange),
    vendor: shopMinisProduct.vendor || shopMinisProduct.brand || '',
    productType: shopMinisProduct.productType || shopMinisProduct.category || '',
    tags: shopMinisProduct.tags || [],
    variants: transformProductVariants(shopMinisProduct.variants || [])
  }
}

/**
 * Transform Shop Minis product images to our format
 */
export const transformProductImages = (images: any[]): Product['images'] => {
  return images.map((image, index) => ({
    id: image.id || `image-${index}`,
    url: image.url || image.src || image.originalSrc || '',
    altText: image.altText || image.alt || '',
    width: image.width || undefined,
    height: image.height || undefined
  }))
}

/**
 * Transform Shop Minis price data to our format
 */
export const transformPrice = (priceData: any): Product['price'] => {
  if (!priceData) {
    return { amount: '0.00', currencyCode: 'USD' }
  }

  // Handle different price formats from Shop Minis
  if (typeof priceData === 'string') {
    return { amount: priceData, currencyCode: 'USD' }
  }

  if (priceData.amount && priceData.currencyCode) {
    return {
      amount: priceData.amount.toString(),
      currencyCode: priceData.currencyCode
    }
  }

  if (priceData.minVariantPrice) {
    return {
      amount: priceData.minVariantPrice.amount.toString(),
      currencyCode: priceData.minVariantPrice.currencyCode
    }
  }

  // Fallback for numeric prices
  if (typeof priceData === 'number') {
    return { amount: priceData.toFixed(2), currencyCode: 'USD' }
  }

  return { amount: '0.00', currencyCode: 'USD' }
}

/**
 * Transform Shop Minis product variants to our format
 */
export const transformProductVariants = (variants: any[]): Product['variants'] => {
  return variants.map(variant => ({
    id: variant.id || '',
    title: variant.title || '',
    price: transformPrice(variant.price || variant.priceV2),
    availableForSale: variant.availableForSale !== false,
    selectedOptions: transformSelectedOptions(variant.selectedOptions || [])
  }))
}

/**
 * Transform Shop Minis selected options to our format
 */
export const transformSelectedOptions = (options: any[]): Product['variants'][0]['selectedOptions'] => {
  return options.map(option => ({
    name: option.name || option.key || '',
    value: option.value || ''
  }))
}

/**
 * Create a ProductSet from Shop Minis products and insight data
 */
export const createProductSetFromShopMinis = (
  products: any[],
  insight: string,
  setName: string,
  urgencyLevel: ProductSet['urgencyLevel'] = 'medium'
): ProductSet => {
  const transformedProducts = products.map(transformShopMinisProduct)
  const originalPrice = calculateTotalPrice(transformedProducts)
  const bundlePrice = calculateBundlePrice(originalPrice, urgencyLevel)

  return {
    id: generateProductSetId(),
    name: setName,
    insight,
    description: `Curated set based on: ${insight}`,
    products: transformedProducts,
    bundlePrice,
    originalPrice,
    savings: originalPrice - bundlePrice,
    urgencyLevel,
    completionStatus: 1.0, // Fully complete set
    expiresAt: calculateExpirationDate(urgencyLevel),
    createdAt: new Date(),
    tags: extractTagsFromProducts(transformedProducts),
    category: determinePrimaryCategory(transformedProducts)
  }
}

/**
 * Extract product metadata for analytics and recommendations
 */
export const extractProductMetadata = (product: Product) => {
  const metadata = {
    colors: extractColorsFromProduct(product),
    categories: [product.productType].filter(Boolean),
    brand: product.vendor,
    priceRange: getPriceRange(parseFloat(product.price.amount)),
    tags: product.tags || [],
    availability: product.variants?.some(v => v.availableForSale) !== false
  }

  return metadata
}

/**
 * Create behavior event metadata from Shop Minis product interaction
 */
export const createBehaviorMetadataFromProduct = (
  product: Product,
  interactionType: 'view' | 'add_to_cart' | 'purchase',
  source: 'story' | 'browse' | 'search' | 'recommendation' = 'browse'
) => {
  const metadata = extractProductMetadata(product)
  
  return {
    source,
    priceAtTime: parseFloat(product.price.amount),
    discountApplied: false, // Would be determined from Shop Minis data
    context: {
      productId: product.id,
      category: product.productType,
      brand: product.vendor,
      color: metadata.colors[0], // Primary color
      currency: product.price.currencyCode,
      confidence: 0.8 // Default confidence for Shop Minis data
    }
  }
}

/**
 * Transform Shop Minis search/filter results for our analytics
 */
export const transformShopMinisSearchResults = (
  searchResults: any[],
  query: string,
  filters: Record<string, any> = {}
) => {
  return {
    products: searchResults.map(transformShopMinisProduct),
    query,
    filters,
    resultCount: searchResults.length,
    timestamp: new Date(),
    metadata: {
      source: 'search',
      searchTerm: query,
      appliedFilters: Object.keys(filters),
      hasResults: searchResults.length > 0
    }
  }
}

// Helper functions
const calculateTotalPrice = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + parseFloat(product.price.amount)
  }, 0)
}

const calculateBundlePrice = (originalPrice: number, urgencyLevel: ProductSet['urgencyLevel']): number => {
  const discountMap = {
    low: 0.05,    // 5% discount
    medium: 0.10, // 10% discount
    high: 0.15    // 15% discount
  }
  
  const discount = discountMap[urgencyLevel]
  return Math.round((originalPrice * (1 - discount)) * 100) / 100
}

const calculateExpirationDate = (urgencyLevel: ProductSet['urgencyLevel']): Date => {
  const now = new Date()
  const hoursMap = {
    low: 168,    // 7 days
    medium: 72,  // 3 days
    high: 24     // 1 day
  }
  
  const hours = hoursMap[urgencyLevel]
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

const generateProductSetId = (): string => {
  return `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const extractTagsFromProducts = (products: Product[]): string[] => {
  const allTags = products.flatMap(product => product.tags || [])
  return [...new Set(allTags)] // Remove duplicates
}

const determinePrimaryCategory = (products: Product[]): string => {
  const categories = products.map(p => p.productType).filter(Boolean)
  if (categories.length === 0) return 'Mixed'
  
  // Find most common category
  const categoryCount = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0][0]
}

const extractColorsFromProduct = (product: Product): string[] => {
  const colors: string[] = []
  
  // Extract from tags
  const colorTags = (product.tags || []).filter(tag => 
    /color|colour|red|blue|green|yellow|black|white|pink|purple|orange|brown|gray|grey/i.test(tag)
  )
  colors.push(...colorTags)
  
  // Extract from title
  const colorWords = product.title.match(/\b(red|blue|green|yellow|black|white|pink|purple|orange|brown|gray|grey|navy|teal|coral|mint|ivory|cream|beige|tan|khaki|olive|maroon|burgundy|magenta|cyan|lime|gold|silver|bronze)\b/gi) || []
  colors.push(...colorWords)
  
  // Extract from variants
  product.variants?.forEach(variant => {
    const variantColors = variant.selectedOptions
      .filter(option => /color|colour/i.test(option.name))
      .map(option => option.value)
    colors.push(...variantColors)
  })
  
  return [...new Set(colors.map(color => color.toLowerCase()))]
}

const getPriceRange = (price: number): string => {
  if (price < 25) return 'budget'
  if (price < 100) return 'mid-range'
  if (price < 300) return 'premium'
  return 'luxury'
}

/**
 * Batch transform multiple Shop Minis products
 */
export const batchTransformShopMinisProducts = (shopMinisProducts: any[]): Product[] => {
  return shopMinisProducts
    .filter(product => product && (product.id || product.gid))
    .map(transformShopMinisProduct)
}

/**
 * Create product recommendations from Shop Minis data
 */
export const createProductRecommendations = (
  products: any[],
  reason: string,
  type: ProductRecommendation['type'],
  confidence: number = 0.8
): ProductRecommendation[] => {
  return products.map(product => {
    const transformedProduct = transformShopMinisProduct(product)
    const metadata = extractProductMetadata(transformedProduct)
    
    return {
      productId: transformedProduct.id,
      reason,
      confidence,
      type,
      urgency: determineUrgency(product),
      metadata: {
        styleMatch: confidence,
        priceScore: calculatePriceScore(parseFloat(transformedProduct.price.amount)),
        trendScore: calculateTrendScore(metadata.tags),
        seasonalRelevance: calculateSeasonalRelevance(metadata.colors),
        complementaryItems: [] // Would be populated by recommendation engine
      }
    }
  })
}

const determineUrgency = (product: any): ProductRecommendation['urgency'] | undefined => {
  if (product.inventory && product.inventory < 5) return 'low-stock'
  if (product.sale && product.sale.endsAt) return 'price-ending'
  if (product.limitedTime) return 'limited-time'
  return undefined
}

const calculatePriceScore = (price: number): number => {
  // Normalize price to 0-1 score (simplified)
  return Math.max(0, Math.min(1, 1 - (price / 1000)))
}

const calculateTrendScore = (tags: string[]): number => {
  const trendingKeywords = ['trending', 'popular', 'bestseller', 'new', 'hot']
  const trendingCount = tags.filter(tag => 
    trendingKeywords.some(keyword => tag.toLowerCase().includes(keyword))
  ).length
  
  return Math.min(1, trendingCount / 3)
}

const calculateSeasonalRelevance = (colors: string[]): number => {
  const currentSeason = getCurrentSeason()
  const seasonalColors = getSeasonalColors(currentSeason)
  
  const matchingColors = colors.filter(color => 
    seasonalColors.some(seasonal => color.toLowerCase().includes(seasonal.toLowerCase()))
  ).length
  
  return colors.length > 0 ? matchingColors / colors.length : 0.5
}

const getCurrentSeason = (): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

const getSeasonalColors = (season: 'spring' | 'summer' | 'fall' | 'winter'): string[] => {
  const seasonalColorMap = {
    spring: ['pink', 'green', 'yellow', 'light', 'pastel', 'mint', 'coral'],
    summer: ['white', 'blue', 'bright', 'neon', 'cyan', 'lime', 'orange'],
    fall: ['brown', 'orange', 'red', 'burgundy', 'olive', 'tan', 'rust'],
    winter: ['black', 'white', 'gray', 'navy', 'silver', 'dark', 'deep']
  }
  
  return seasonalColorMap[season]
}