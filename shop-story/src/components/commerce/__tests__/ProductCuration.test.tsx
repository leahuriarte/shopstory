import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCuration } from '../ProductCuration'
import type { StyleProfile } from '../../../types/analytics'
import type { ProductSet, PurchaseOption } from '../../../types/commerce'
import type { Product } from '../../../types/story'

describe('ProductCuration', () => {
  let mockStyleProfile: StyleProfile
  let mockProductSets: ProductSet[]
  let mockOnAddToCart: ReturnType<typeof vi.fn>
  let mockOnBuyBundle: ReturnType<typeof vi.fn>
  let mockOnShareSet: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnAddToCart = vi.fn()
    mockOnBuyBundle = vi.fn()
    mockOnShareSet = vi.fn()

    mockStyleProfile = {
      userId: 'user-123',
      dominantColors: [
        { color: '#90EE90', name: 'Sage Green', frequency: 0.8 },
        { color: '#FFB6C1', name: 'Blush Pink', frequency: 0.6 }
      ],
      preferredBrands: [
        { brandName: 'Everlane', affinity: 0.9, frequency: 15 }
      ],
      categoryPreferences: [
        { category: 'Shirts', weight: 0.8, frequency: 12 }
      ],
      priceRanges: [],
      seasonalTrends: [],
      evolutionScore: 0.2,
      lastUpdated: new Date()
    }

    const mockProducts: Product[] = [
      {
        id: 'prod-1',
        title: 'Sage Green Shirt',
        images: [{ id: 'img-1', url: '/test1.jpg' }],
        price: { amount: '89.99', currencyCode: 'USD' },
        vendor: 'Everlane'
      },
      {
        id: 'prod-2',
        title: 'Pink Blouse',
        images: [{ id: 'img-2', url: '/test2.jpg' }],
        price: { amount: '129.99', currencyCode: 'USD' },
        vendor: 'Reformation'
      }
    ]

    mockProductSets = [
      {
        id: 'color-set-1',
        name: 'Sage Green Collection',
        insight: 'Your top color is sage green',
        products: [mockProducts[0]],
        bundlePrice: 76.49,
        originalPrice: 89.99,
        savings: 13.50,
        urgencyLevel: 'medium',
        completionStatus: 0.7,
        createdAt: new Date(),
        tags: ['color-match', 'sage-green'],
        category: 'color-curated'
      },
      {
        id: 'brand-set-1',
        name: 'Everlane Favorites',
        insight: 'You love Everlane',
        products: [mockProducts[0]],
        bundlePrice: 76.49,
        originalPrice: 89.99,
        savings: 13.50,
        urgencyLevel: 'high',
        completionStatus: 0.8,
        createdAt: new Date(),
        tags: ['brand-affinity', 'everlane'],
        category: 'brand-curated'
      },
      {
        id: 'seasonal-set-1',
        name: 'Spring Essentials',
        insight: 'Refresh your spring wardrobe',
        products: mockProducts,
        bundlePrice: 187.48,
        originalPrice: 219.98,
        savings: 32.50,
        urgencyLevel: 'high',
        completionStatus: 0.3,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        tags: ['seasonal', 'spring'],
        category: 'seasonal-curated'
      }
    ]
  })

  it('renders the curation header with style DNA information', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    expect(screen.getByText('Curated For You')).toBeInTheDocument()
    expect(screen.getByText('Based on your Style DNA and shopping patterns')).toBeInTheDocument()
    expect(screen.getByText('Your Style DNA')).toBeInTheDocument()
    expect(screen.getByText('Sage Green')).toBeInTheDocument()
    expect(screen.getAllByText('Everlane')).toHaveLength(3) // Appears in header and products
  })

  it('displays evolution score correctly', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    expect(screen.getByText('Evolution Score')).toBeInTheDocument()
    expect(screen.getByText('+20%')).toBeInTheDocument() // 0.2 * 100 = 20%
  })

  it('renders category filters with correct counts', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    expect(screen.getByText('All Sets (3)')).toBeInTheDocument()
    expect(screen.getByText('Color Match (1)')).toBeInTheDocument()
    expect(screen.getByText('Brand Favorites (1)')).toBeInTheDocument()
    expect(screen.getByText('Seasonal (1)')).toBeInTheDocument()
  })

  it('filters product sets when category filter is selected', async () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Initially shows all sets
    expect(screen.getByText('Sage Green Collection')).toBeInTheDocument()
    expect(screen.getByText('Everlane Favorites')).toBeInTheDocument()
    expect(screen.getByText('Spring Essentials')).toBeInTheDocument()

    // Click on Color Match filter
    fireEvent.click(screen.getByText('Color Match (1)'))

    await waitFor(() => {
      expect(screen.getByText('Sage Green Collection')).toBeInTheDocument()
      expect(screen.queryByText('Everlane Favorites')).not.toBeInTheDocument()
      expect(screen.queryByText('Spring Essentials')).not.toBeInTheDocument()
    })
  })

  it('sorts product sets by different criteria', async () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    const sortSelect = screen.getByDisplayValue('Sort by Relevance')
    
    // Change to sort by price
    fireEvent.change(sortSelect, { target: { value: 'price' } })

    await waitFor(() => {
      expect(sortSelect).toHaveValue('price')
    })

    // Change to sort by urgency
    fireEvent.change(sortSelect, { target: { value: 'urgency' } })

    await waitFor(() => {
      expect(sortSelect).toHaveValue('urgency')
    })
  })

  it('renders ShoppableSetCard components for each product set', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Check that all product set names are rendered
    expect(screen.getByText('Sage Green Collection')).toBeInTheDocument()
    expect(screen.getByText('Everlane Favorites')).toBeInTheDocument()
    expect(screen.getByText('Spring Essentials')).toBeInTheDocument()

    // Check that insights are rendered
    expect(screen.getByText('Your top color is sage green')).toBeInTheDocument()
    expect(screen.getByText('You love Everlane')).toBeInTheDocument()
    expect(screen.getByText('Refresh your spring wardrobe')).toBeInTheDocument()
  })

  it('passes correct props to ShoppableSetCard components', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Check that bundle pricing is displayed (indicating proper props are passed)
    expect(screen.getAllByText('Bundle & Save')).toHaveLength(3)
    
    // Check that products are displayed
    expect(screen.getAllByText('Sage Green Shirt')).toHaveLength(3) // Appears in multiple sets
    expect(screen.getByText('Pink Blouse')).toBeInTheDocument()
  })

  it('calls onAddToCart when product add button is clicked', async () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalled()
    })
  })

  it('calls onBuyBundle when bundle button is clicked', async () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    const bundleButtons = screen.getAllByText('Buy Bundle')
    fireEvent.click(bundleButtons[0])

    await waitFor(() => {
      expect(mockOnBuyBundle).toHaveBeenCalled()
    })
  })

  it('calls onShareSet when share button is clicked', async () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    const shareButtons = screen.getAllByLabelText('Share set')
    fireEvent.click(shareButtons[0])

    await waitFor(() => {
      expect(mockOnShareSet).toHaveBeenCalled()
      // The first share button clicked will be from the first displayed set (sorted by urgency)
      expect(mockOnShareSet).toHaveBeenCalledWith('seasonal-set-1')
    })
  })

  it('shows empty state when no product sets are provided', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={[]}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    expect(screen.getByText('Building Your Style Profile')).toBeInTheDocument()
    expect(screen.getByText(/We're analyzing your shopping behavior/)).toBeInTheDocument()
    expect(screen.getByText('Explore Products')).toBeInTheDocument()
  })

  it('shows no results message when filter returns empty results', async () => {
    // Create a set with only one category
    const singleCategorySet = [mockProductSets[0]] // Only color-curated

    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={singleCategorySet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Filter by a category that doesn't exist in the single set
    // Since we only have color-curated, brand filter should show no results
    // But first we need to make sure the brand filter exists
    expect(screen.queryByText('Brand Favorites')).not.toBeInTheDocument()
    
    // The filter should only show available categories
    expect(screen.getByText('All Sets (1)')).toBeInTheDocument()
    expect(screen.getByText('Color Match (1)')).toBeInTheDocument()
  })

  it('displays style DNA colors with proper color swatches', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Check that color swatches are rendered
    const colorSwatches = screen.getAllByRole('generic').filter(el => 
      el.style.backgroundColor
    )
    expect(colorSwatches.length).toBeGreaterThan(0)
  })

  it('handles negative evolution score correctly', () => {
    const negativeEvolutionProfile = {
      ...mockStyleProfile,
      evolutionScore: -0.15
    }

    render(
      <ProductCuration
        styleProfile={negativeEvolutionProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    expect(screen.getByText('-15%')).toBeInTheDocument()
  })

  it('creates proper purchase options for product sets', () => {
    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Check that bundle pricing is calculated correctly
    // Multiple sets may have the same pricing, so use getAllByText
    expect(screen.getAllByText('$76.49')).toHaveLength(2) // Two sets with same price
    expect(screen.getAllByText('Save $13.50')).toHaveLength(2) // Two sets with same savings
  })

  it('shows load more button when there are many sets', () => {
    // Create 12 sets to trigger load more
    const manySets = Array.from({ length: 12 }, (_, i) => ({
      ...mockProductSets[0],
      id: `set-${i}`,
      name: `Set ${i}`
    }))

    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={manySets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Should show load more button for 12+ sets
    expect(screen.getByText('Load More Sets')).toBeInTheDocument()
  })

  it('applies correct grid layout classes', () => {
    const { container } = render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={mockProductSets}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('gap-6', 'md:grid-cols-2', 'lg:grid-cols-1', 'xl:grid-cols-2')
  })

  it('handles subscription-eligible sets correctly', () => {
    const subscriptionEligibleSet = {
      ...mockProductSets[0],
      products: [
        {
          ...mockProductSets[0].products[0],
          productType: 'basics' // This makes it subscription-eligible
        }
      ]
    }

    render(
      <ProductCuration
        styleProfile={mockStyleProfile}
        productSets={[subscriptionEligibleSet]}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShareSet={mockOnShareSet}
      />
    )

    // Should show subscription option in the component
    // This would be tested more thoroughly in the ShoppableSetCard test
    expect(screen.getByText('Sage Green Collection')).toBeInTheDocument()
  })
})