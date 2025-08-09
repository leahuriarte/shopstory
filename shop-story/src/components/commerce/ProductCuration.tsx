import React, { useState, useEffect } from 'react'
import { ShoppableSetCard } from './ShoppableSetCard'
import type { ProductSet, ShoppableSet, PurchaseOption } from '../../types/commerce'
import type { StyleProfile } from '../../types/analytics'
import type { Product } from '../../types/story'

interface ProductCurationProps {
  styleProfile: StyleProfile
  productSets: ProductSet[]
  onAddToCart: (product: Product) => void
  onBuyBundle: (option: PurchaseOption) => void
  onShareSet: (setId: string) => void
  className?: string
}

export const ProductCuration: React.FC<ProductCurationProps> = ({
  styleProfile,
  productSets,
  onAddToCart,
  onBuyBundle,
  onShareSet,
  className = ''
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'urgency'>('relevance')
  const [filteredSets, setFilteredSets] = useState<ProductSet[]>(productSets)

  // Available filters based on product set categories
  const availableFilters = [
    { id: 'all', label: 'All Sets', count: productSets.length },
    { id: 'color-curated', label: 'Color Match', count: productSets.filter(s => s.category === 'color-curated').length },
    { id: 'brand-curated', label: 'Brand Favorites', count: productSets.filter(s => s.category === 'brand-curated').length },
    { id: 'category-curated', label: 'Complete Look', count: productSets.filter(s => s.category === 'category-curated').length },
    { id: 'seasonal-curated', label: 'Seasonal', count: productSets.filter(s => s.category === 'seasonal-curated').length }
  ].filter(filter => filter.count > 0)

  // Filter and sort product sets
  useEffect(() => {
    let filtered = productSets

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(set => set.category === activeFilter)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      
      switch (sortBy) {
        case 'price':
          return (a.bundlePrice || a.originalPrice) - (b.bundlePrice || b.originalPrice)
        case 'urgency':
          return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel]
        case 'relevance':
        default:
          // Sort by completion status (lower = more potential), then by urgency
          if (a.completionStatus !== b.completionStatus) {
            return a.completionStatus - b.completionStatus
          }
          return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel]
      }
    })

    setFilteredSets(filtered)
  }, [productSets, activeFilter, sortBy])

  // Convert ProductSet to ShoppableSet
  const createShoppableSet = (productSet: ProductSet): ShoppableSet => {
    // Generate purchase options
    const individualPrice = productSet.originalPrice
    const bundlePrice = productSet.bundlePrice || individualPrice
    const savings = individualPrice - bundlePrice

    const purchaseOptions: PurchaseOption[] = [
      {
        type: 'individual',
        price: individualPrice,
        currency: 'USD',
        description: 'Buy items separately',
        available: true
      }
    ]

    if (savings > 0) {
      purchaseOptions.push({
        type: 'bundle',
        price: bundlePrice,
        currency: 'USD',
        savings,
        description: `Save $${savings.toFixed(2)} with bundle`,
        available: true
      })
    }

    // Add subscription option for eligible sets
    if (isSubscriptionEligible(productSet)) {
      purchaseOptions.push({
        type: 'subscription',
        price: bundlePrice * 0.9,
        currency: 'USD',
        savings: individualPrice - (bundlePrice * 0.9),
        description: 'Subscribe and save 10% more',
        available: true
      })
    }

    return {
      id: `shoppable-${productSet.id}`,
      productSet,
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
      purchaseOptions
    }
  }

  const isSubscriptionEligible = (productSet: ProductSet): boolean => {
    const eligibleCategories = ['basics', 'skincare', 'supplements']
    return productSet.products.some(product => 
      eligibleCategories.some(category => 
        product.productType?.toLowerCase().includes(category)
      )
    )
  }

  if (productSets.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Building Your Style Profile
          </h3>
          <p className="text-gray-600 mb-4">
            We're analyzing your shopping behavior to create personalized product collections. 
            Keep browsing and shopping to unlock curated sets!
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explore Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header with style insights */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Curated For You
        </h2>
        <p className="text-gray-600">
          Based on your Style DNA and shopping patterns
        </p>
        
        {/* Style DNA summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Your Style DNA</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {styleProfile.dominantColors.slice(0, 3).map((color, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <span>{color.name}</span>
                  </div>
                ))}
                {styleProfile.preferredBrands.length > 0 && (
                  <span>• {styleProfile.preferredBrands[0].brandName}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Evolution Score</div>
              <div className="text-lg font-semibold text-gray-900">
                {styleProfile.evolutionScore > 0 ? '+' : ''}{(styleProfile.evolutionScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Category filters */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {availableFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sort dropdown */}
        <div className="sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="price">Sort by Price</option>
            <option value="urgency">Sort by Urgency</option>
          </select>
        </div>
      </div>

      {/* Product sets grid */}
      {filteredSets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {filteredSets.map(productSet => {
            const shoppableSet = createShoppableSet(productSet)
            return (
              <ShoppableSetCard
                key={productSet.id}
                shoppableSet={shoppableSet}
                onAddToCart={onAddToCart}
                onBuyBundle={onBuyBundle}
                onShare={() => onShareSet(productSet.id)}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No sets found for the selected filter. Try a different category.
          </p>
        </div>
      )}

      {/* Load more button (if needed for pagination) */}
      {filteredSets.length >= 10 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Sets
          </button>
        </div>
      )}
    </div>
  )
}