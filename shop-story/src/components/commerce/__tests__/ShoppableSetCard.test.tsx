import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShoppableSetCard } from '../ShoppableSetCard'
import type { ShoppableSet, PurchaseOption } from '../../../types/commerce'
import type { Product } from '../../../types/story'

describe('ShoppableSetCard', () => {
  let mockShoppableSet: ShoppableSet
  let mockOnAddToCart: ReturnType<typeof vi.fn>
  let mockOnBuyBundle: ReturnType<typeof vi.fn>
  let mockOnShare: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnAddToCart = vi.fn()
    mockOnBuyBundle = vi.fn()
    mockOnShare = vi.fn()

    const mockProducts: Product[] = [
      {
        id: 'prod-1',
        title: 'Sage Green Linen Shirt',
        description: 'Comfortable linen shirt',
        images: [{ id: 'img-1', url: '/test-image-1.jpg', altText: 'Sage green shirt' }],
        price: { amount: '89.99', currencyCode: 'USD' },
        vendor: 'Everlane',
        productType: 'Shirts'
      },
      {
        id: 'prod-2',
        title: 'Matching Linen Pants',
        description: 'Comfortable linen pants',
        images: [{ id: 'img-2', url: '/test-image-2.jpg', altText: 'Linen pants' }],
        price: { amount: '79.99', currencyCode: 'USD' },
        vendor: 'Everlane',
        productType: 'Pants'
      }
    ]

    const mockPurchaseOptions: PurchaseOption[] = [
      {
        type: 'individual',
        price: 169.98,
        currency: 'USD',
        description: 'Buy items separately',
        available: true
      },
      {
        type: 'bundle',
        price: 144.48,
        currency: 'USD',
        savings: 25.50,
        description: 'Save $25.50 with bundle',
        available: true
      }
    ]

    mockShoppableSet = {
      id: 'shoppable-set-1',
      productSet: {
        id: 'set-1',
        name: 'Sage Green Collection',
        insight: 'Your top color is sage green - complete your sage green capsule',
        products: mockProducts,
        bundlePrice: 144.48,
        originalPrice: 169.98,
        savings: 25.50,
        urgencyLevel: 'medium',
        completionStatus: 0.7,
        createdAt: new Date(),
        tags: ['color-match', 'sage-green'],
        category: 'color-curated'
      },
      displayConfig: {
        layout: 'grid',
        aspectRatio: '1:1',
        showPricing: true,
        showSavings: true,
        showUrgency: true,
        maxProducts: 4
      },
      interactionData: {
        views: 0,
        clicks: 0,
        addToCarts: 0,
        purchases: 0,
        shares: 0,
        conversionRate: 0
      },
      purchaseOptions: mockPurchaseOptions
    }
  })

  it('renders the shoppable set card with basic information', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Sage Green Collection')).toBeInTheDocument()
    expect(screen.getByText('Your top color is sage green - complete your sage green capsule')).toBeInTheDocument()
    expect(screen.getByText('70% complete')).toBeInTheDocument()
  })

  it('displays products in a grid layout', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Sage Green Linen Shirt')).toBeInTheDocument()
    expect(screen.getByText('Matching Linen Pants')).toBeInTheDocument()
    expect(screen.getAllByText('Everlane')).toHaveLength(2)
    expect(screen.getByText('$89.99')).toBeInTheDocument()
    expect(screen.getByText('$79.99')).toBeInTheDocument()
  })

  it('shows product images with proper alt text', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('alt', 'Sage green shirt')
    expect(images[0]).toHaveAttribute('src', '/test-image-1.jpg')
  })

  it('displays completion status bar correctly', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const progressBar = screen.getByText('70% complete').previousElementSibling
    const progressFill = progressBar?.querySelector('div')
    expect(progressFill).toHaveStyle({ width: '70%' })
  })

  it('calls onAddToCart when add button is clicked', async () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const addButtons = screen.getAllByText('Add')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockShoppableSet.productSet.products[0])
    })
  })

  it('calls onShare when share button is clicked', async () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const shareButton = screen.getByLabelText('Share set')
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalled()
    })
  })

  it('displays bundle pricing when showPricing is true', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Bundle & Save')).toBeInTheDocument()
    expect(screen.getByText('$144.48')).toBeInTheDocument()
    expect(screen.getByText('Save $25.50')).toBeInTheDocument()
  })

  it('calls onBuyBundle when bundle button is clicked', async () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const buyBundleButton = screen.getByText('Buy Bundle')
    fireEvent.click(buyBundleButton)

    await waitFor(() => {
      expect(mockOnBuyBundle).toHaveBeenCalledWith(mockShoppableSet.purchaseOptions[1])
    })
  })

  it('shows urgency indicator for high urgency sets', () => {
    const highUrgencySet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        urgencyLevel: 'high' as const
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={highUrgencySet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Limited time')).toBeInTheDocument()
  })

  it('shows expiration countdown when expiresAt is set', () => {
    const expiringSet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={expiringSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('2 days left')).toBeInTheDocument()
  })

  it('shows complete the set CTA when completion status is less than 100%', () => {
    render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Complete your collection')).toBeInTheDocument()
    expect(screen.getByText(/Add .* more items to complete the look/)).toBeInTheDocument()
  })

  it('does not show complete the set CTA when completion status is 100%', () => {
    const completeSet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        completionStatus: 1.0
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={completeSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.queryByText('Complete your collection')).not.toBeInTheDocument()
  })

  it('limits displayed products to maxProducts setting', () => {
    const manyProductsSet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        products: [
          ...mockShoppableSet.productSet.products,
          {
            id: 'prod-3',
            title: 'Extra Product 1',
            images: [{ id: 'img-3', url: '/test3.jpg' }],
            price: { amount: '50.00', currencyCode: 'USD' }
          },
          {
            id: 'prod-4',
            title: 'Extra Product 2',
            images: [{ id: 'img-4', url: '/test4.jpg' }],
            price: { amount: '60.00', currencyCode: 'USD' }
          },
          {
            id: 'prod-5',
            title: 'Extra Product 3',
            images: [{ id: 'img-5', url: '/test5.jpg' }],
            price: { amount: '70.00', currencyCode: 'USD' }
          }
        ]
      },
      displayConfig: {
        ...mockShoppableSet.displayConfig,
        maxProducts: 3
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={manyProductsSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    // Should show only 3 products initially
    expect(screen.getByText('Sage Green Linen Shirt')).toBeInTheDocument()
    expect(screen.getByText('Matching Linen Pants')).toBeInTheDocument()
    expect(screen.getByText('Extra Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Extra Product 2')).not.toBeInTheDocument()

    // Should show "Show more" button
    expect(screen.getByText('Show 2 more items')).toBeInTheDocument()
  })

  it('expands to show all products when "Show more" is clicked', async () => {
    const manyProductsSet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        products: [
          ...mockShoppableSet.productSet.products,
          {
            id: 'prod-3',
            title: 'Extra Product 1',
            images: [{ id: 'img-3', url: '/test3.jpg' }],
            price: { amount: '50.00', currencyCode: 'USD' }
          }
        ]
      },
      displayConfig: {
        ...mockShoppableSet.displayConfig,
        maxProducts: 2
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={manyProductsSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const showMoreButton = screen.getByText('Show 1 more items')
    fireEvent.click(showMoreButton)

    await waitFor(() => {
      expect(screen.getByText('Extra Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Show 1 more items')).not.toBeInTheDocument()
    })
  })

  it('handles products without images gracefully', () => {
    const noImageSet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        products: [
          {
            id: 'prod-no-image',
            title: 'Product Without Image',
            images: [],
            price: { amount: '50.00', currencyCode: 'USD' }
          }
        ]
      }
    }

    render(
      <ShoppableSetCard
        shoppableSet={noImageSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    expect(screen.getByText('Product Without Image')).toBeInTheDocument()
    // Should show placeholder icon instead of image - the inner div has the flex classes
    const placeholderInner = screen.getByText('Product Without Image').closest('.group')?.querySelector('.w-full.h-full')
    expect(placeholderInner).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('applies correct urgency styling based on urgency level', () => {
    const { rerender } = render(
      <ShoppableSetCard
        shoppableSet={mockShoppableSet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    // Medium urgency should have yellow styling
    const mediumUrgencyHeader = screen.getByText('Sage Green Collection').closest('.p-4')
    expect(mediumUrgencyHeader).toHaveClass('border-yellow-200', 'bg-yellow-50')

    // Test high urgency
    const highUrgencySet = {
      ...mockShoppableSet,
      productSet: {
        ...mockShoppableSet.productSet,
        urgencyLevel: 'high' as const
      }
    }

    rerender(
      <ShoppableSetCard
        shoppableSet={highUrgencySet}
        onAddToCart={mockOnAddToCart}
        onBuyBundle={mockOnBuyBundle}
        onShare={mockOnShare}
      />
    )

    const highUrgencyHeader = screen.getByText('Sage Green Collection').closest('.p-4')
    expect(highUrgencyHeader).toHaveClass('border-red-200', 'bg-red-50')
  })
})