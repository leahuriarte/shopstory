import { useState, useEffect, useCallback } from 'react'
import type { StyleProfile, BehaviorEvent } from '../types/analytics'
import { 
  extractColorPreferences, 
  calculateBrandAffinities, 
  calculateCategoryPreferences,
  calculateStyleEvolution,
  generateStoryInsights
} from '../utils/analytics'
import { loadStyleProfile, saveStyleProfile, getStoredEvents } from '../utils/storage'

export interface UseStyleDNAReturn {
  profile: StyleProfile | null
  isLoading: boolean
  error: string | null
  updateProfile: (events: BehaviorEvent[]) => Promise<void>
  refreshProfile: () => Promise<void>
  getInsights: () => Promise<import('../types/story').Insight[]>
  evolutionScore: number
}

export const useStyleDNA = (userId: string): UseStyleDNAReturn => {
  const [profile, setProfile] = useState<StyleProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing profile on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      setIsLoading(true)
      try {
        const existingProfile = loadStyleProfile()
        if (existingProfile && existingProfile.userId === userId) {
          setProfile(existingProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingProfile()
  }, [userId])

  const calculateStyleProfile = useCallback(async (events: BehaviorEvent[]): Promise<StyleProfile> => {
    // Filter events for this user
    const userEvents = events.filter(event => event.userId === userId)
    
    if (userEvents.length === 0) {
      throw new Error('Insufficient data to calculate Style DNA')
    }

    // Extract color preferences from events
    const dominantColors = extractColorPreferences(userEvents)
    
    // Calculate brand affinities
    const preferredBrands = calculateBrandAffinities(userEvents)
    
    // Calculate category preferences
    const categoryPreferences = calculateCategoryPreferences(userEvents)
    
    // Calculate price ranges by category
    const priceRanges = calculatePriceRanges(userEvents)
    
    // Generate seasonal trends
    const seasonalTrends = generateSeasonalTrends(userEvents)
    
    // Calculate evolution score if we have a previous profile
    const previousProfile = profile
    const evolutionScore = previousProfile ? 
      calculateStyleEvolution(previousProfile, {
        userId,
        dominantColors,
        preferredBrands,
        categoryPreferences,
        priceRanges,
        seasonalTrends,
        evolutionScore: 0,
        lastUpdated: new Date()
      }) : 0

    const newProfile: StyleProfile = {
      userId,
      dominantColors,
      preferredBrands,
      categoryPreferences,
      priceRanges,
      seasonalTrends,
      evolutionScore,
      lastUpdated: new Date()
    }

    return newProfile
  }, [userId, profile])

  const updateProfile = useCallback(async (events: BehaviorEvent[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newProfile = await calculateStyleProfile(events)
      setProfile(newProfile)
      saveStyleProfile(newProfile)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      console.error('Error updating Style DNA profile:', err)
    } finally {
      setIsLoading(false)
    }
  }, [calculateStyleProfile])

  const refreshProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const storedEvents = getStoredEvents(userId)
      if (storedEvents.length === 0) {
        throw new Error('No behavior data available for profile calculation')
      }
      
      await updateProfile(storedEvents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile'
      setError(errorMessage)
      console.error('Error refreshing Style DNA profile:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, updateProfile])

  const getInsights = useCallback(async () => {
    if (!profile) {
      throw new Error('No Style DNA profile available')
    }
    
    return generateStoryInsights(profile)
  }, [profile])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    getInsights,
    evolutionScore: profile?.evolutionScore || 0
  }
}

/**
 * Calculate price ranges by category from behavior events
 */
const calculatePriceRanges = (events: BehaviorEvent[]) => {
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
      currency: 'USD', // Would be dynamic in real implementation
      frequency: prices.length
    }
  })
}

/**
 * Generate seasonal trends from behavior events
 */
const generateSeasonalTrends = (events: BehaviorEvent[]) => {
  const currentYear = new Date().getFullYear()
  const seasons: Array<'spring' | 'summer' | 'fall' | 'winter'> = ['spring', 'summer', 'fall', 'winter']
  
  return seasons.map(season => {
    const seasonEvents = events.filter(event => {
      const eventSeason = getSeasonFromDate(event.timestamp)
      return eventSeason === season && event.timestamp.getFullYear() === currentYear
    })

    // Extract dominant colors for the season (simplified)
    const dominantColors = ['#2D5016', '#8B4513', '#000000'] // Mock data
    
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

    // Calculate spending pattern (simplified)
    const purchaseEvents = seasonEvents.filter(e => e.eventType === 'purchase')
    const totalSpent = purchaseEvents.reduce((sum, event) => 
      sum + (event.metadata.priceAtTime || 0), 0
    )
    const spendingPattern = totalSpent / Math.max(purchaseEvents.length, 1)

    // Calculate style evolution (simplified - would be more complex in real implementation)
    const styleEvolution = Math.random() * 2 - 1 // -1 to 1

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
 * Helper function to determine season from date
 */
const getSeasonFromDate = (date: Date): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}