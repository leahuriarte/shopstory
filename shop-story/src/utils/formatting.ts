// Formatting utility functions
import type { Price } from '../types'

export const formatPrice = (price: Price): string => {
  const amount = parseFloat(price.amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode,
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatDate = (date: Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    case 'long':
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      })
    case 'relative':
      return formatRelativeTime(date)
    default:
      return date.toLocaleDateString()
  }
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date, 'short')
}

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const formatNumber = (value: number, compact: boolean = false): string => {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }
  
  return new Intl.NumberFormat('en-US').format(value)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const formatHashtags = (tags: string[]): string => {
  return tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
}