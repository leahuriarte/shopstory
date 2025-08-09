import React, { useState } from 'react'
import { usePopularProducts } from '@shopify/shop-minis-react'
import { ShoppableSetCard, ProductCuration } from '../commerce'
import { ProductCard } from './ProductCard'

import { SkeletonLoader } from './SkeletonLoader'
import type { Product } from '../../types/story'
import type { ShoppableSet, PurchaseOption } from '../../types/commerce'

// Mock shoppable sets data
const mockShoppableSets: ShoppableSet[] = [
  {
    id: 'shoppable-set-1',
    productSet: {
      id: 'set-1',
      name: 'Earth Tones Collection',
      insight: 'Based on your love for warm, natural colors',
      products: [], // Will be populated with real products
      originalPrice: 174.99,
      urgencyLevel: 'medium',
      completionStatus: 0.6,
      savings: 25.00,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
      tags: ['earth-tones', 'natural', 'warm'],
      category: 'clothing'
    },
    displayConfig: {
      layout: 'grid',
      aspectRatio: '1:1',
      maxProducts: 4,
      showPricing: true,
      showSavings: true,
      showUrgency: true
    },
    interactionData: {
      views: 0,
      clicks: 0,
      addToCarts: 0,
      purchases: 0,
      shares: 0,
      conversionRate: 0
    },
    purchaseOptions: [
      {
        type: 'bundle',
        price: 149.99,
        currency: 'USD',
        savings: 25.00,
        description: 'Complete set',
        available: true
      },
      {
        type: 'individual',
        price: 174.99,
        currency: 'USD',
        description: 'Buy separately',
        available: true
      }
    ]
  },
  {
    id: 'shoppable-set-2',
    productSet: {
      id: 'set-2',
      name: 'Sustainable Essentials',
      insight: 'Curated eco-friendly brands you love',
      products: [], // Will be populated with real products
      originalPrice: 104.99,
      urgencyLevel: 'low',
      completionStatus: 0.8,
      savings: 15.00,
      createdAt: new Date(),
      tags: ['sustainable', 'eco-friendly', 'ethical'],
      category: 'clothing'
    },
    displayConfig: {
      layout: 'grid',
      aspectRatio: '1:1',
      maxProducts: 3,
      showPricing: true,
      showSavings: true,
      showUrgency: false
    },
    interactionData: {
      views: 0,
      clicks: 0,
      addToCarts: 0,
      purchases: 0,
      shares: 0,
      conversionRate: 0
    },
    purchaseOptions: [
      {
        type: 'bundle',
        price: 89.99,
        currency: 'USD',
        savings: 15.00,
        description: 'Eco bundle',
        available: true
      }
    ]
  }
]

export const ShopView: React.FC = () => {
  const { products, loading } = usePopularProducts()
  const [activeSection, setActiveSection] = useState<'curated' | 'popular'>('curated')

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product.title)
    // In a real app, this would add to cart
  }

  const handleBuyBundle = (option: PurchaseOption) => {
    console.log('Buying bundle:', option)
    // In a real app, this would initiate purchase
  }

  const handleShare = () => {
    console.log('Sharing set')
    // In a real app, this would open share modal
  }

  // Transform Shop Minis products to our internal Product type
  const transformProduct = (shopMinisProduct: any): Product => ({
    id: shopMinisProduct.id,
    title: shopMinisProduct.title,
    description: shopMinisProduct.description,
    images: shopMinisProduct.images?.map((img: any) => ({
      id: img.id || `img-${shopMinisProduct.id}`,
      url: img.url,
      altText: img.altText,
      width: img.width,
      height: img.height
    })) || [],
    price: {
      amount: shopMinisProduct.price?.amount || '0',
      currencyCode: shopMinisProduct.price?.currencyCode || 'USD'
    },
    vendor: shopMinisProduct.vendor,
    productType: shopMinisProduct.productType,
    tags: shopMinisProduct.tags,
    variants: shopMinisProduct.variants
  })

  // Populate mock sets with real products
  const populatedSets = mockShoppableSets.map((set, index) => ({
    ...set,
    productSet: {
      ...set.productSet,
      products: products?.slice(index * 3, (index + 1) * 3).map(transformProduct) || []
    }
  }))

  if (loading) {
    return (
      <div className="pt-16 px-4 pb-20">
        <div className="mb-6">
          <SkeletonLoader height="2rem" className="mb-2" />
          <SkeletonLoader height="1rem" width="60%" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLoader key={index} variant="product-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 px-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Shop
        </h1>
        <p className="text-sm text-gray-600">
          Personalized collections based on your style DNA
        </p>
      </div>

      {/* Section Toggle */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('curated')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'curated'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Curated for You
        </button>
        <button
          onClick={() => setActiveSection('popular')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'popular'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Popular Now
        </button>
      </div>

      {/* Content */}
      {activeSection === 'curated' ? (
        <div className="space-y-6">
          {/* Product Curation Component */}
          <ProductCuration 
            styleProfile={{
              userId: 'demo-user',
              dominantColors: [
                { color: '#8B4513', name: 'Saddle Brown', frequency: 0.4, confidence: 0.89 },
                { color: '#DEB887', name: 'Burlywood', frequency: 0.3, confidence: 0.76 }
              ],
              preferredBrands: [
                { 
                  brandName: 'Patagonia', 
                  affinity: 1.2, 
                  purchaseCount: 5, 
                  averageSpend: 120, 
                  lastPurchase: new Date(), 
                  categories: ['outdoor', 'clothing'] 
                },
                { 
                  brandName: 'Everlane', 
                  affinity: 1.0, 
                  purchaseCount: 3, 
                  averageSpend: 80, 
                  lastPurchase: new Date(), 
                  categories: ['basics', 'clothing'] 
                }
              ],
              categoryPreferences: [
                { 
                  category: 'Shirts', 
                  weight: 0.8, 
                  purchaseFrequency: 12, 
                  averageSpend: 65, 
                  trendDirection: 'stable' 
                },
                { 
                  category: 'Sweaters', 
                  weight: 0.7, 
                  purchaseFrequency: 8, 
                  averageSpend: 95, 
                  trendDirection: 'increasing' 
                }
              ],
              priceRanges: [],
              seasonalTrends: [],
              evolutionScore: 0.23,
              lastUpdated: new Date()
            }}
            productSets={populatedSets.map(set => set.productSet)}
            onAddToCart={handleAddToCart}
            onBuyBundle={handleBuyBundle}
            onShareSet={handleShare}
          />
          
          {/* Shoppable Sets */}
          {populatedSets.map((set) => (
            <ShoppableSetCard
              key={set.productSet.id}
              shoppableSet={set}
              onAddToCart={handleAddToCart}
              onBuyBundle={handleBuyBundle}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div>
          <p className="text-base text-gray-600 mb-6">
            Popular products today
          </p>
          <div className="grid grid-cols-2 gap-4">
            {products?.map(product => (
              <ProductCard 
                key={product.id} 
                product={transformProduct(product)} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}