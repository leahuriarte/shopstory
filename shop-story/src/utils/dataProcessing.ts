// User data processing utilities
import type { 
  BehaviorEvent, 
  StyleProfile, 
  ShoppingSession, 
  ColorProfile, 
  BrandAffinity, 
  CategoryWeight, 
  PriceRange,
  SeasonalData,
  Product
} from '../types'

/**
 * Process raw user behavior events into structured analytics data
 */
export const processUserBehaviorData = (events: BehaviorEvent[]): {
  colorPreferences: ColorProfile[]
  brandAffinities: BrandAffinity[]
  categoryWeights: CategoryWeight[]
  priceRanges: PriceRange[]
  seasonalTrends: SeasonalData[]
} => {
  const colorMap = new Map<string, { count: number; totalConfidence: number }>()
  const brandMap = new Map<string, { count: number; totalSpend: number; lastPurchase: Date; categories: Set<string> }>()
  const categoryMap = new Map<string, { count: number; totalSpend: number; trend: number[] }>()
  const priceMap = new Map<string, { prices: number[]; currency: string }>()
  const seasonalMap = new Map<string, { colors: string[]; categories: string[]; spending: number }>()

  // Process each event
  events.forEach(event => {
    const { metadata, timestamp } = event
    
    // Extract color information from metadata
    if (metadata.context?.color) {
      const color = metadata.context.color
      const existing = colorMap.get(color) || { count: 0, totalConfidence: 0 }
      colorMap.set(color, {
        count: existing.count + 1,
        totalConfidence: existing.totalConfidence + (metadata.context.confidence || 0.5)
      })
    }

    // Extract brand information
    if (event.brandName || metadata.context?.brand) {
      const brandName = event.brandName || metadata.context?.brand
      const existing = brandMap.get(brandName) || { 
        count: 0, 
        totalSpend: 0, 
        lastPurchase: new Date(0),
        categories: new Set()
      }
      
      brandMap.set(brandName, {
        count: existing.count + 1,
        totalSpend: existing.totalSpend + (metadata.priceAtTime || 0),
        lastPurchase: timestamp > existing.lastPurchase ? timestamp : existing.lastPurchase,
        categories: metadata.context?.category ? existing.categories.add(metadata.context.category) : existing.categories
      })
    }

    // Extract category information
    if (metadata.context?.category) {
      const category = metadata.context.category
      const existing = categoryMap.get(category) || { count: 0, totalSpend: 0, trend: [] }
      
      categoryMap.set(category, {
        count: existing.count + 1,
        totalSpend: existing.totalSpend + (metadata.priceAtTime || 0),
        trend: [...existing.trend, timestamp.getTime()]
      })
    }

    // Extract price information
    if (metadata.priceAtTime && metadata.context?.category) {
      const category = metadata.context.category
      const existing = priceMap.get(category) || { prices: [], currency: 'USD' }
      
      priceMap.set(category, {
        prices: [...existing.prices, metadata.priceAtTime],
        currency: metadata.context.currency || 'USD'
      })
    }

    // Extract seasonal information
    const season = getSeason(timestamp)
    const seasonKey = `${season}-${timestamp.getFullYear()}`
    const existing = seasonalMap.get(seasonKey) || { colors: [], categories: [], spending: 0 }
    
    seasonalMap.set(seasonKey, {
      colors: metadata.context?.color ? [...existing.colors, metadata.context.color] : existing.colors,
      categories: metadata.context?.category ? [...existing.categories, metadata.context.category] : existing.categories,
      spending: existing.spending + (metadata.priceAtTime || 0)
    })
  })

  // Convert maps to structured data
  const colorPreferences: ColorProfile[] = Array.from(colorMap.entries()).map(([color, data]) => ({
    color,
    name: getColorName(color),
    frequency: data.count / events.length,
    confidence: data.totalConfidence / data.count,
    season: getColorSeason(color)
  }))

  const brandAffinities: BrandAffinity[] = Array.from(brandMap.entries()).map(([brandName, data]) => ({
    brandName,
    affinity: data.count / events.length,
    purchaseCount: data.count,
    averageSpend: data.totalSpend / data.count,
    lastPurchase: data.lastPurchase,
    categories: Array.from(data.categories)
  }))

  const categoryWeights: CategoryWeight[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    weight: data.count / events.length,
    purchaseFrequency: data.count,
    averageSpend: data.totalSpend / data.count,
    trendDirection: calculateTrendDirection(data.trend)
  }))

  const priceRanges: PriceRange[] = Array.from(priceMap.entries()).map(([category, data]) => {
    const prices = data.prices.sort((a, b) => a - b)
    return {
      category,
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      currency: data.currency,
      frequency: prices.length / events.length
    }
  })

  const seasonalTrends: SeasonalData[] = Array.from(seasonalMap.entries()).map(([seasonKey, data]) => {
    const [season, year] = seasonKey.split('-')
    return {
      season: season as SeasonalData['season'],
      year: parseInt(year),
      dominantColors: getMostFrequent(data.colors, 3),
      topCategories: getMostFrequent(data.categories, 3),
      spendingPattern: data.spending,
      styleEvolution: calculateStyleEvolution(data.colors, data.categories)
    }
  })

  return {
    colorPreferences: colorPreferences.sort((a, b) => b.frequency - a.frequency),
    brandAffinities: brandAffinities.sort((a, b) => b.affinity - a.affinity),
    categoryWeights: categoryWeights.sort((a, b) => b.weight - a.weight),
    priceRanges,
    seasonalTrends: seasonalTrends.sort((a, b) => b.year - a.year)
  }
}

/**
 * Create a StyleProfile from processed behavior data
 */
export const createStyleProfile = (
  userId: string,
  processedData: ReturnType<typeof processUserBehaviorData>
): StyleProfile => {
  return {
    userId,
    dominantColors: processedData.colorPreferences.slice(0, 5),
    preferredBrands: processedData.brandAffinities.slice(0, 10),
    categoryPreferences: processedData.categoryWeights.slice(0, 8),
    priceRanges: processedData.priceRanges,
    seasonalTrends: processedData.seasonalTrends.slice(0, 4),
    evolutionScore: calculateOverallEvolution(processedData.seasonalTrends),
    lastUpdated: new Date()
  }
}

/**
 * Update existing StyleProfile with new behavior data
 */
export const updateStyleProfile = (
  existingProfile: StyleProfile,
  newEvents: BehaviorEvent[]
): StyleProfile => {
  const newData = processUserBehaviorData(newEvents)
  
  // Merge with existing data (weighted average approach)
  const mergedColors = mergeColorProfiles(existingProfile.dominantColors, newData.colorPreferences)
  const mergedBrands = mergeBrandAffinities(existingProfile.preferredBrands, newData.brandAffinities)
  const mergedCategories = mergeCategoryWeights(existingProfile.categoryPreferences, newData.categoryWeights)
  
  // Ensure we have a new timestamp that's definitely later
  const updatedTime = new Date(Math.max(existingProfile.lastUpdated.getTime() + 1, Date.now()))
  
  return {
    ...existingProfile,
    dominantColors: mergedColors.slice(0, 5),
    preferredBrands: mergedBrands.slice(0, 10),
    categoryPreferences: mergedCategories.slice(0, 8),
    priceRanges: mergePriceRanges(existingProfile.priceRanges, newData.priceRanges),
    seasonalTrends: [...existingProfile.seasonalTrends, ...newData.seasonalTrends].slice(0, 4),
    evolutionScore: calculateOverallEvolution([...existingProfile.seasonalTrends, ...newData.seasonalTrends]),
    lastUpdated: updatedTime
  }
}

// Helper functions
const getSeason = (date: Date): SeasonalData['season'] => {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

const getColorName = (hexColor: string): string => {
  // Simplified color name mapping - in production would use a comprehensive color library
  const colorMap: Record<string, string> = {
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan'
  }
  return colorMap[hexColor.toUpperCase()] || 'Unknown'
}

const getColorSeason = (hexColor: string): SeasonalData['season'] | undefined => {
  // Simplified seasonal color mapping
  const hex = hexColor.toUpperCase()
  if (hex.includes('FF') && hex.includes('00')) return 'summer' // Bright colors
  if (hex.includes('80') || hex.includes('A0')) return 'fall' // Muted colors
  return undefined
}

const calculateTrendDirection = (timestamps: number[]): CategoryWeight['trendDirection'] => {
  if (timestamps.length < 2) return 'stable'
  
  const sorted = timestamps.sort()
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2))
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, t) => sum + t, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, t) => sum + t, 0) / secondHalf.length
  
  const diff = (secondAvg - firstAvg) / (1000 * 60 * 60 * 24) // Convert to days
  
  if (diff > 7) return 'increasing'
  if (diff < -7) return 'decreasing'
  return 'stable'
}

const getMostFrequent = <T>(items: T[], count: number): T[] => {
  const frequency = new Map<T, number>()
  items.forEach(item => {
    frequency.set(item, (frequency.get(item) || 0) + 1)
  })
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([item]) => item)
}

const calculateStyleEvolution = (colors: string[], categories: string[]): number => {
  // Simplified evolution calculation - measures diversity
  const uniqueColors = new Set(colors).size
  const uniqueCategories = new Set(categories).size
  const totalItems = colors.length + categories.length
  
  if (totalItems === 0) return 0
  
  const diversity = (uniqueColors + uniqueCategories) / totalItems
  return (diversity - 0.5) * 2 // Normalize to -1 to 1 range
}

const calculateOverallEvolution = (seasonalTrends: SeasonalData[]): number => {
  if (seasonalTrends.length === 0) return 0
  
  const avgEvolution = seasonalTrends.reduce((sum, trend) => sum + trend.styleEvolution, 0) / seasonalTrends.length
  return Math.max(-1, Math.min(1, avgEvolution))
}

const mergeColorProfiles = (existing: ColorProfile[], newData: ColorProfile[]): ColorProfile[] => {
  // If no new data, return existing profiles unchanged
  if (newData.length === 0) {
    return [...existing]
  }
  
  const merged = new Map<string, ColorProfile>()
  
  // Add existing profiles with reduced weight
  existing.forEach(profile => {
    merged.set(profile.color, {
      ...profile,
      frequency: profile.frequency * 0.7,
      confidence: profile.confidence * 0.8
    })
  })
  
  // Add or update with new data
  newData.forEach(profile => {
    const existingProfile = merged.get(profile.color)
    if (existingProfile) {
      merged.set(profile.color, {
        ...profile,
        frequency: (existingProfile.frequency + profile.frequency * 0.3) / 2,
        confidence: (existingProfile.confidence + profile.confidence) / 2
      })
    } else {
      merged.set(profile.color, {
        ...profile,
        frequency: profile.frequency * 0.3
      })
    }
  })
  
  return Array.from(merged.values()).sort((a, b) => b.frequency - a.frequency)
}

const mergeBrandAffinities = (existing: BrandAffinity[], newData: BrandAffinity[]): BrandAffinity[] => {
  // If no new data, return existing brands unchanged
  if (newData.length === 0) {
    return [...existing]
  }
  
  const merged = new Map<string, BrandAffinity>()
  
  existing.forEach(brand => {
    merged.set(brand.brandName, {
      ...brand,
      affinity: brand.affinity * 0.8
    })
  })
  
  newData.forEach(brand => {
    const existingBrand = merged.get(brand.brandName)
    if (existingBrand) {
      merged.set(brand.brandName, {
        ...brand,
        affinity: (existingBrand.affinity + brand.affinity * 0.2) / 2,
        purchaseCount: existingBrand.purchaseCount + brand.purchaseCount,
        averageSpend: (existingBrand.averageSpend + brand.averageSpend) / 2,
        lastPurchase: brand.lastPurchase > existingBrand.lastPurchase ? brand.lastPurchase : existingBrand.lastPurchase,
        categories: [...new Set([...existingBrand.categories, ...brand.categories])]
      })
    } else {
      merged.set(brand.brandName, {
        ...brand,
        affinity: brand.affinity * 0.2
      })
    }
  })
  
  return Array.from(merged.values()).sort((a, b) => b.affinity - a.affinity)
}

const mergeCategoryWeights = (existing: CategoryWeight[], newData: CategoryWeight[]): CategoryWeight[] => {
  // If no new data, return existing categories unchanged
  if (newData.length === 0) {
    return [...existing]
  }
  
  const merged = new Map<string, CategoryWeight>()
  
  existing.forEach(category => {
    merged.set(category.category, {
      ...category,
      weight: category.weight * 0.8
    })
  })
  
  newData.forEach(category => {
    const existingCategory = merged.get(category.category)
    if (existingCategory) {
      merged.set(category.category, {
        ...category,
        weight: (existingCategory.weight + category.weight * 0.2) / 2,
        purchaseFrequency: existingCategory.purchaseFrequency + category.purchaseFrequency,
        averageSpend: (existingCategory.averageSpend + category.averageSpend) / 2,
        trendDirection: category.trendDirection // Use latest trend
      })
    } else {
      merged.set(category.category, {
        ...category,
        weight: category.weight * 0.2
      })
    }
  })
  
  return Array.from(merged.values()).sort((a, b) => b.weight - a.weight)
}

const mergePriceRanges = (existing: PriceRange[], newData: PriceRange[]): PriceRange[] => {
  const merged = new Map<string, PriceRange>()
  
  existing.forEach(range => {
    merged.set(range.category, range)
  })
  
  newData.forEach(range => {
    const existing = merged.get(range.category)
    if (existing) {
      merged.set(range.category, {
        category: range.category,
        min: Math.min(existing.min, range.min),
        max: Math.max(existing.max, range.max),
        average: (existing.average + range.average) / 2,
        currency: range.currency,
        frequency: (existing.frequency + range.frequency) / 2
      })
    } else {
      merged.set(range.category, range)
    }
  })
  
  return Array.from(merged.values())
}