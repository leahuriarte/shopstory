// Unit tests for data processing utilities
import { describe, it, expect, beforeEach } from 'vitest'
import {
  processUserBehaviorData,
  createStyleProfile,
  updateStyleProfile
} from '../dataProcessing'
import type { BehaviorEvent, StyleProfile } from '../../types'

describe('dataProcessing', () => {
  let mockBehaviorEvents: BehaviorEvent[]

  beforeEach(() => {
    mockBehaviorEvents = [
      {
        id: 'event-1',
        userId: 'user-123',
        eventType: 'view',
        productId: 'product-1',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        sessionId: 'session-1',
        metadata: {
          source: 'browse',
          priceAtTime: 50.00,
          context: {
            color: '#FF0000',
            category: 'clothing',
            brand: 'TestBrand',
            confidence: 0.8
          }
        }
      },
      {
        id: 'event-2',
        userId: 'user-123',
        eventType: 'purchase',
        productId: 'product-2',
        timestamp: new Date('2024-01-16T14:30:00Z'),
        sessionId: 'session-2',
        metadata: {
          source: 'story',
          priceAtTime: 75.00,
          context: {
            color: '#00FF00',
            category: 'accessories',
            brand: 'TestBrand',
            confidence: 0.9
          }
        }
      },
      {
        id: 'event-3',
        userId: 'user-123',
        eventType: 'add_to_cart',
        productId: 'product-3',
        timestamp: new Date('2024-02-01T09:15:00Z'),
        sessionId: 'session-3',
        metadata: {
          source: 'recommendation',
          priceAtTime: 120.00,
          context: {
            color: '#FF0000',
            category: 'clothing',
            brand: 'AnotherBrand',
            confidence: 0.7
          }
        }
      }
    ]
  })

  describe('processUserBehaviorData', () => {
    it('should process behavior events into structured analytics data', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)

      expect(result).toHaveProperty('colorPreferences')
      expect(result).toHaveProperty('brandAffinities')
      expect(result).toHaveProperty('categoryWeights')
      expect(result).toHaveProperty('priceRanges')
      expect(result).toHaveProperty('seasonalTrends')
    })

    it('should correctly calculate color preferences', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)
      
      expect(result.colorPreferences).toHaveLength(2)
      
      // Red should be more frequent (appears twice)
      const redColor = result.colorPreferences.find(c => c.color === '#FF0000')
      const greenColor = result.colorPreferences.find(c => c.color === '#00FF00')
      
      expect(redColor).toBeDefined()
      expect(greenColor).toBeDefined()
      expect(redColor!.frequency).toBeGreaterThan(greenColor!.frequency)
    })

    it('should correctly calculate brand affinities', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)
      
      expect(result.brandAffinities).toHaveLength(2)
      
      const testBrand = result.brandAffinities.find(b => b.brandName === 'TestBrand')
      const anotherBrand = result.brandAffinities.find(b => b.brandName === 'AnotherBrand')
      
      expect(testBrand).toBeDefined()
      expect(anotherBrand).toBeDefined()
      expect(testBrand!.purchaseCount).toBe(2)
      expect(anotherBrand!.purchaseCount).toBe(1)
    })

    it('should correctly calculate category weights', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)
      
      expect(result.categoryWeights).toHaveLength(2)
      
      const clothingCategory = result.categoryWeights.find(c => c.category === 'clothing')
      const accessoriesCategory = result.categoryWeights.find(c => c.category === 'accessories')
      
      expect(clothingCategory).toBeDefined()
      expect(accessoriesCategory).toBeDefined()
      expect(clothingCategory!.purchaseFrequency).toBe(2)
      expect(accessoriesCategory!.purchaseFrequency).toBe(1)
    })

    it('should calculate price ranges by category', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)
      
      expect(result.priceRanges).toHaveLength(2)
      
      const clothingPrices = result.priceRanges.find(p => p.category === 'clothing')
      expect(clothingPrices).toBeDefined()
      expect(clothingPrices!.min).toBe(50.00)
      expect(clothingPrices!.max).toBe(120.00)
      expect(clothingPrices!.average).toBe(85.00)
    })

    it('should generate seasonal trends', () => {
      const result = processUserBehaviorData(mockBehaviorEvents)
      
      expect(result.seasonalTrends.length).toBeGreaterThan(0)
      
      const winterTrend = result.seasonalTrends.find(t => t.season === 'winter')
      expect(winterTrend).toBeDefined()
      expect(winterTrend!.year).toBe(2024)
    })

    it('should handle empty events array', () => {
      const result = processUserBehaviorData([])
      
      expect(result.colorPreferences).toHaveLength(0)
      expect(result.brandAffinities).toHaveLength(0)
      expect(result.categoryWeights).toHaveLength(0)
      expect(result.priceRanges).toHaveLength(0)
      expect(result.seasonalTrends).toHaveLength(0)
    })
  })

  describe('createStyleProfile', () => {
    it('should create a complete style profile from processed data', () => {
      const processedData = processUserBehaviorData(mockBehaviorEvents)
      const profile = createStyleProfile('user-123', processedData)

      expect(profile.userId).toBe('user-123')
      expect(profile.dominantColors).toHaveLength(2)
      expect(profile.preferredBrands).toHaveLength(2)
      expect(profile.categoryPreferences).toHaveLength(2)
      expect(profile.priceRanges).toHaveLength(2)
      expect(profile.evolutionScore).toBeTypeOf('number')
      expect(profile.lastUpdated).toBeInstanceOf(Date)
    })

    it('should limit the number of items in each category', () => {
      // Create more events to test limits
      const manyEvents = Array.from({ length: 20 }, (_, i) => ({
        ...mockBehaviorEvents[0],
        id: `event-${i}`,
        metadata: {
          ...mockBehaviorEvents[0].metadata,
          context: {
            ...mockBehaviorEvents[0].metadata.context!,
            color: `#${i.toString(16).padStart(6, '0')}`,
            brand: `Brand${i}`,
            category: `Category${i}`
          }
        }
      }))

      const processedData = processUserBehaviorData(manyEvents)
      const profile = createStyleProfile('user-123', processedData)

      expect(profile.dominantColors.length).toBeLessThanOrEqual(5)
      expect(profile.preferredBrands.length).toBeLessThanOrEqual(10)
      expect(profile.categoryPreferences.length).toBeLessThanOrEqual(8)
    })
  })

  describe('updateStyleProfile', () => {
    let existingProfile: StyleProfile

    beforeEach(() => {
      const processedData = processUserBehaviorData(mockBehaviorEvents.slice(0, 2))
      existingProfile = createStyleProfile('user-123', processedData)
    })

    it('should merge new events with existing profile', () => {
      const newEvents = [mockBehaviorEvents[2]]
      const updatedProfile = updateStyleProfile(existingProfile, newEvents)

      expect(updatedProfile.userId).toBe('user-123')
      expect(updatedProfile.lastUpdated).toBeInstanceOf(Date)
      expect(updatedProfile.lastUpdated.getTime()).toBeGreaterThan(existingProfile.lastUpdated.getTime())
    })

    it('should maintain profile structure after update', () => {
      const newEvents = [mockBehaviorEvents[2]]
      const updatedProfile = updateStyleProfile(existingProfile, newEvents)

      expect(updatedProfile).toHaveProperty('dominantColors')
      expect(updatedProfile).toHaveProperty('preferredBrands')
      expect(updatedProfile).toHaveProperty('categoryPreferences')
      expect(updatedProfile).toHaveProperty('priceRanges')
      expect(updatedProfile).toHaveProperty('seasonalTrends')
      expect(updatedProfile).toHaveProperty('evolutionScore')
    })

    it('should handle empty new events array', () => {
      const updatedProfile = updateStyleProfile(existingProfile, [])

      expect(updatedProfile.userId).toBe(existingProfile.userId)
      expect(updatedProfile.dominantColors).toEqual(existingProfile.dominantColors)
      expect(updatedProfile.preferredBrands).toEqual(existingProfile.preferredBrands)
    })

    it('should update evolution score', () => {
      const newEvents = [
        {
          ...mockBehaviorEvents[0],
          id: 'new-event',
          metadata: {
            ...mockBehaviorEvents[0].metadata,
            context: {
              ...mockBehaviorEvents[0].metadata.context!,
              color: '#BLUE',
              category: 'shoes'
            }
          }
        }
      ]

      const updatedProfile = updateStyleProfile(existingProfile, newEvents)
      expect(updatedProfile.evolutionScore).toBeTypeOf('number')
      expect(updatedProfile.evolutionScore).toBeGreaterThanOrEqual(-1)
      expect(updatedProfile.evolutionScore).toBeLessThanOrEqual(1)
    })
  })
})