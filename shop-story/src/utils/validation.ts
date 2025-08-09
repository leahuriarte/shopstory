// Validation utility functions
import type { StoryData, StyleProfile, ProductSet, BehaviorEvent } from '../types'

export const validateStoryData = (data: any): data is StoryData => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    ['behavioral', 'style-evolution', 'recap', 'seasonal'].includes(data.type) &&
    typeof data.title === 'string' &&
    Array.isArray(data.insights) &&
    Array.isArray(data.visualElements) &&
    data.createdAt instanceof Date
  )
}

export const validateStyleProfile = (data: any): data is StyleProfile => {
  return (
    typeof data === 'object' &&
    typeof data.userId === 'string' &&
    Array.isArray(data.dominantColors) &&
    Array.isArray(data.preferredBrands) &&
    Array.isArray(data.categoryPreferences) &&
    Array.isArray(data.priceRanges) &&
    typeof data.evolutionScore === 'number' &&
    data.lastUpdated instanceof Date
  )
}

export const validateProductSet = (data: any): data is ProductSet => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.insight === 'string' &&
    Array.isArray(data.products) &&
    typeof data.originalPrice === 'number' &&
    ['low', 'medium', 'high'].includes(data.urgencyLevel) &&
    typeof data.completionStatus === 'number' &&
    data.completionStatus >= 0 &&
    data.completionStatus <= 1
  )
}

export const validateBehaviorEvent = (data: any): data is BehaviorEvent => {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    ['view', 'add_to_cart', 'purchase', 'share', 'save', 'search', 'filter'].includes(data.eventType) &&
    data.timestamp instanceof Date &&
    typeof data.sessionId === 'string' &&
    typeof data.metadata === 'object'
  )
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

export const validatePriceRange = (min: number, max: number): boolean => {
  return min >= 0 && max >= min
}

export const validateDateRange = (start: Date, end: Date): boolean => {
  return start <= end
}

export const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'&]/g, (match) => {
    const escapeMap: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    }
    return escapeMap[match] || match
  })
}