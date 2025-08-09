import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { StyleDNAVisualizer } from '../StyleDNAVisualizer'
import type { Insight } from '../../../types/story'
import type { StyleProfile } from '../../../types/analytics'

describe('StyleDNAVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fallback when no data provided', () => {
    render(<StyleDNAVisualizer />)

    expect(screen.getByText('Your Style DNA')).toBeInTheDocument()
    expect(screen.getByText('Keep shopping to unlock your personalized insights')).toBeInTheDocument()
  })

  it('renders color palette visualization for color-palette insight', () => {
    const colorInsight: Insight = {
      id: 'color-insight',
      type: 'color-preference',
      title: 'Your Colors',
      description: 'Color preferences',
      confidence: 0.9,
      data: {
        colors: [
          { color: '#FF6B6B', name: 'Coral Red', frequency: 0.4 },
          { color: '#4ECDC4', name: 'Turquoise', frequency: 0.3 },
          { color: '#45B7D1', name: 'Sky Blue', frequency: 0.2 },
          { color: '#96CEB4', name: 'Mint Green', frequency: 0.1 }
        ]
      },
      visualType: 'color-palette'
    }

    render(<StyleDNAVisualizer insight={colorInsight} />)

    expect(screen.getByText('Your Color DNA')).toBeInTheDocument()
    expect(screen.getByText('Coral Red')).toBeInTheDocument()
    expect(screen.getByText('Turquoise')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  it('renders brand cloud visualization for brand-cloud insight', () => {
    const brandInsight: Insight = {
      id: 'brand-insight',
      type: 'brand-affinity',
      title: 'Your Brands',
      description: 'Brand preferences',
      confidence: 0.85,
      data: {
        brands: [
          { brandName: 'Nike', affinity: 1.2 },
          { brandName: 'Adidas', affinity: 1.0 },
          { brandName: 'Zara', affinity: 0.8 }
        ]
      },
      visualType: 'brand-cloud'
    }

    render(<StyleDNAVisualizer insight={brandInsight} />)

    expect(screen.getByText('Brand Affinity')).toBeInTheDocument()
    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText('Zara')).toBeInTheDocument()
  })

  it('renders chart visualization for chart insight', () => {
    const chartInsight: Insight = {
      id: 'chart-insight',
      type: 'category-trend',
      title: 'Categories',
      description: 'Category breakdown',
      confidence: 0.8,
      data: {
        categories: [
          { category: 'casual-wear', weight: 0.6 },
          { category: 'formal-wear', weight: 0.3 },
          { category: 'activewear', weight: 0.1 }
        ]
      },
      visualType: 'chart'
    }

    render(<StyleDNAVisualizer insight={chartInsight} />)

    expect(screen.getByText('Style Categories')).toBeInTheDocument()
    expect(screen.getByText('casual wear')).toBeInTheDocument()
    expect(screen.getByText('formal wear')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  it('renders trend line visualization for trend-line insight', () => {
    const trendInsight: Insight = {
      id: 'trend-insight',
      type: 'seasonal-shift',
      title: 'Trend Analysis',
      description: 'Style trends',
      confidence: 0.75,
      data: {
        trend: 'up',
        percentage: '25%',
        period: 'this quarter'
      },
      visualType: 'trend-line'
    }

    render(<StyleDNAVisualizer insight={trendInsight} />)

    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('this quarter')).toBeInTheDocument()
  })

  it('renders simple chart data when categories not provided', () => {
    const simpleChartInsight: Insight = {
      id: 'simple-chart',
      type: 'price-pattern',
      title: 'Price Analysis',
      description: 'Spending patterns',
      confidence: 0.7,
      data: {
        value: '42%',
        metric: 'of budget on shoes'
      },
      visualType: 'chart'
    }

    render(<StyleDNAVisualizer insight={simpleChartInsight} />)

    expect(screen.getByText('42%')).toBeInTheDocument()
    expect(screen.getByText('of budget on shoes')).toBeInTheDocument()
  })

  it('renders full style profile visualization', () => {
    const styleProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: [
        { color: '#FF6B6B', name: 'Red', frequency: 0.4, confidence: 0.9 },
        { color: '#4ECDC4', name: 'Teal', frequency: 0.3, confidence: 0.8 }
      ],
      preferredBrands: [
        { brandName: 'Nike', affinity: 0.9, purchaseCount: 5, averageSpend: 100, lastPurchase: new Date(), categories: ['shoes'] },
        { brandName: 'Zara', affinity: 0.7, purchaseCount: 3, averageSpend: 50, lastPurchase: new Date(), categories: ['clothing'] }
      ],
      categoryPreferences: [
        { category: 'shoes', weight: 0.6, purchaseFrequency: 2, averageSpend: 80, trendDirection: 'increasing' },
        { category: 'clothing', weight: 0.4, purchaseFrequency: 1, averageSpend: 60, trendDirection: 'stable' }
      ],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.3,
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={styleProfile} />)

    expect(screen.getByText('Your Color DNA')).toBeInTheDocument()
    expect(screen.getByText('Brand Affinity')).toBeInTheDocument()
    expect(screen.getByText('Style Categories')).toBeInTheDocument()
    expect(screen.getByText('Style Evolution')).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('shoes')).toBeInTheDocument()
  })

  it('handles compact mode', () => {
    const styleProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: Array.from({ length: 8 }, (_, i) => ({
        color: `#${i}${i}${i}${i}${i}${i}`,
        name: `Color ${i}`,
        frequency: 0.1,
        confidence: 0.8
      })),
      preferredBrands: [],
      categoryPreferences: Array.from({ length: 8 }, (_, i) => ({
        category: `category-${i}`,
        weight: 0.1,
        purchaseFrequency: 1,
        averageSpend: 50,
        trendDirection: 'stable' as const
      })),
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.5,
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={styleProfile} compact={true} />)

    // In compact mode, should show fewer items
    const colorElements = screen.getAllByText(/Color \d/)
    expect(colorElements.length).toBeLessThanOrEqual(4)

    const categoryElements = screen.getAllByText(/category \d/)
    expect(categoryElements.length).toBeLessThanOrEqual(3)

    // Should not show evolution score in compact mode
    expect(screen.queryByText('Style Evolution')).not.toBeInTheDocument()
  })

  it('handles animation prop', async () => {
    const colorInsight: Insight = {
      id: 'color-insight',
      type: 'color-preference',
      title: 'Your Colors',
      description: 'Color preferences',
      confidence: 0.9,
      data: {
        colors: [{ color: '#FF6B6B', name: 'Red', frequency: 0.4 }]
      },
      visualType: 'color-palette'
    }

    render(<StyleDNAVisualizer insight={colorInsight} animated={true} />)

    // Animation should be applied (hard to test exact animation state)
    expect(screen.getByText('Red')).toBeInTheDocument()
  })

  it('handles evolution score interpretation', () => {
    const experimentalProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: [],
      preferredBrands: [],
      categoryPreferences: [],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.8, // High experimental score
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={experimentalProfile} />)

    expect(screen.getByText('Experimental')).toBeInTheDocument()
  })

  it('handles classic style evolution score', () => {
    const classicProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: [],
      preferredBrands: [],
      categoryPreferences: [],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: -0.6, // Low/negative score
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={classicProfile} />)

    expect(screen.getByText('Classic')).toBeInTheDocument()
  })

  it('handles balanced style evolution score', () => {
    const balancedProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: [],
      preferredBrands: [],
      categoryPreferences: [],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.1, // Neutral score
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={balancedProfile} />)

    expect(screen.getByText('Balanced')).toBeInTheDocument()
  })

  it('handles empty arrays in style profile', () => {
    const emptyProfile: StyleProfile = {
      userId: 'user-1',
      dominantColors: [],
      preferredBrands: [],
      categoryPreferences: [],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0,
      lastUpdated: new Date()
    }

    render(<StyleDNAVisualizer styleProfile={emptyProfile} />)

    // Should only show evolution score section
    expect(screen.getByText('Style Evolution')).toBeInTheDocument()
    expect(screen.queryByText('Your Color DNA')).not.toBeInTheDocument()
    expect(screen.queryByText('Brand Affinity')).not.toBeInTheDocument()
  })

  it('handles fallback for unknown insight visual type', () => {
    const unknownInsight: Insight = {
      id: 'unknown-insight',
      type: 'color-preference',
      title: 'Unknown Visualization',
      description: 'This is an unknown type',
      confidence: 0.5,
      data: {},
      visualType: 'unknown' as any
    }

    render(<StyleDNAVisualizer insight={unknownInsight} />)

    expect(screen.getByText('Unknown Visualization')).toBeInTheDocument()
    expect(screen.getByText('This is an unknown type')).toBeInTheDocument()
  })
})