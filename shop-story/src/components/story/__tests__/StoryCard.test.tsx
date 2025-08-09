import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { StoryCard } from '../StoryCard'
import type { StoryData } from '../../../types/story'

// Mock the StyleDNAVisualizer component
vi.mock('../StyleDNAVisualizer', () => ({
  StyleDNAVisualizer: ({ insight }: { insight: any }) => (
    <div data-testid="style-dna-visualizer">
      Mock StyleDNAVisualizer: {insight?.title}
    </div>
  )
}))

const mockStoryData: StoryData = {
  id: 'story-1',
  type: 'behavioral',
  title: 'Your Shopping Insights',
  insights: [
    {
      id: 'insight-1',
      type: 'color-preference',
      title: 'Your Favorite Colors',
      description: 'You love earth tones and neutrals',
      confidence: 0.85,
      data: { colors: ['#8B4513', '#DEB887', '#F5DEB3'] },
      visualType: 'color-palette'
    },
    {
      id: 'insight-2',
      type: 'brand-affinity',
      title: 'Brand Loyalty',
      description: 'You prefer sustainable brands',
      confidence: 0.92,
      data: { brands: ['Patagonia', 'Everlane', 'Reformation'] },
      visualType: 'brand-cloud'
    }
  ],
  visualElements: [],
  shareableContent: {
    title: 'My Style Story',
    description: 'Check out my shopping insights',
    hashtags: ['#style', '#shopping'],
    platforms: ['instagram'],
    exportFormats: ['story-9x16']
  },
  createdAt: new Date('2024-01-15'),
  shoppableProducts: [
    {
      id: 'product-1',
      title: 'Organic Cotton Tee',
      images: [{ id: 'img-1', url: '/test-image.jpg' }],
      price: { amount: '29.99', currencyCode: 'USD' }
    }
  ]
}

describe('StoryCard', () => {
  const mockOnShare = vi.fn()
  const mockOnProductClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders story card with title and date', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('Your Shopping Insights')).toBeInTheDocument()
    expect(screen.getByText('Jan 14')).toBeInTheDocument()
  })

  it('displays progress indicators for multiple insights', () => {
    const { container } = render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Should have 2 progress bars for 2 insights - look for the specific progress container
    const progressContainer = container.querySelector('.flex.space-x-1')
    const progressBars = progressContainer?.querySelectorAll('.flex-1.h-1')
    expect(progressBars).toHaveLength(2)
  })

  it('shows current insight content', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('Your Favorite Colors')).toBeInTheDocument()
    expect(screen.getByText('You love earth tones and neutrals')).toBeInTheDocument()
    expect(screen.getByText('85% confident')).toBeInTheDocument()
  })

  it('renders StyleDNAVisualizer for color-palette insights', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByTestId('style-dna-visualizer')).toBeInTheDocument()
    expect(screen.getByText('Mock StyleDNAVisualizer: Your Favorite Colors')).toBeInTheDocument()
  })

  it('displays shoppable products when available', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('Shop this vibe')).toBeInTheDocument()
    expect(screen.getByText('Organic Cotton Tee')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('calls onShare when share button is clicked', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const shareButton = screen.getByLabelText('Share story')
    fireEvent.click(shareButton)

    expect(mockOnShare).toHaveBeenCalledTimes(1)
  })

  it('calls onProductClick when product is clicked', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const productButton = screen.getByText('Organic Cotton Tee').closest('button')
    fireEvent.click(productButton!)

    expect(mockOnProductClick).toHaveBeenCalledWith('product-1')
  })

  it('shows insight counter', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('applies correct background gradient based on story type', () => {
    const { container } = render(
      <StoryCard
        story={mockStoryData}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const backgroundDiv = container.querySelector('.from-purple-600.to-pink-600')
    expect(backgroundDiv).toBeInTheDocument()
  })

  it('shows expiration date when story expires', () => {
    const expiringStory = {
      ...mockStoryData,
      expiresAt: new Date('2024-02-15')
    }

    render(
      <StoryCard
        story={expiringStory}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText(/Expires/)).toBeInTheDocument()
  })

  it('does not auto-progress when inactive', () => {
    render(
      <StoryCard
        story={mockStoryData}
        isActive={false}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Should still show first insight
    expect(screen.getByText('Your Favorite Colors')).toBeInTheDocument()
  })

  it('handles different insight visual types', () => {
    const chartInsight = {
      ...mockStoryData,
      insights: [{
        id: 'chart-insight',
        type: 'category-trend' as const,
        title: 'Category Breakdown',
        description: 'Your shopping categories',
        confidence: 0.9,
        data: { value: '42%', metric: 'casual wear' },
        visualType: 'chart' as const
      }]
    }

    render(
      <StoryCard
        story={chartInsight}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('42%')).toBeInTheDocument()
    expect(screen.getByText('casual wear')).toBeInTheDocument()
  })

  it('handles brand cloud visualization', () => {
    const brandInsight = {
      ...mockStoryData,
      insights: [{
        id: 'brand-insight',
        type: 'brand-affinity' as const,
        title: 'Your Brands',
        description: 'Top brand preferences',
        confidence: 0.88,
        data: { brands: ['Nike', 'Adidas', 'Puma'] },
        visualType: 'brand-cloud' as const
      }]
    }

    render(
      <StoryCard
        story={brandInsight}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText('Puma')).toBeInTheDocument()
  })

  it('handles trend line visualization', () => {
    const trendInsight = {
      ...mockStoryData,
      insights: [{
        id: 'trend-insight',
        type: 'seasonal-shift' as const,
        title: 'Trend Analysis',
        description: 'Your style is evolving',
        confidence: 0.75,
        data: { trend: 'up', percentage: '23%', period: 'this month' },
        visualType: 'trend-line' as const
      }]
    }

    render(
      <StoryCard
        story={trendInsight}
        isActive={true}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('23%')).toBeInTheDocument()
    expect(screen.getByText('this month')).toBeInTheDocument()
  })
})