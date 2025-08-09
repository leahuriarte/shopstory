import React, { useState } from 'react'
import { usePopularProducts, ProductCard } from '@shopify/shop-minis-react'
import { StoryCardContainer } from './components/story'
import type { StoryData } from './types/story'

// Mock story data for demo
const mockStories: StoryData[] = [
  {
    id: 'story-1',
    type: 'behavioral',
    title: 'Your Shopping DNA',
    insights: [
      {
        id: 'insight-1',
        type: 'color-preference',
        title: 'Earth Tones Lover',
        description: 'You gravitate toward warm, natural colors that reflect your grounded style.',
        confidence: 0.89,
        data: {
          colors: [
            { color: '#8B4513', name: 'Saddle Brown', frequency: 0.4 },
            { color: '#DEB887', name: 'Burlywood', frequency: 0.3 },
            { color: '#F5DEB3', name: 'Wheat', frequency: 0.2 },
            { color: '#D2691E', name: 'Chocolate', frequency: 0.1 }
          ]
        },
        visualType: 'color-palette'
      },
      {
        id: 'insight-2',
        type: 'brand-affinity',
        title: 'Sustainable Shopper',
        description: 'Your brand choices show a strong preference for eco-conscious companies.',
        confidence: 0.92,
        data: {
          brands: [
            { brandName: 'Patagonia', affinity: 1.2 },
            { brandName: 'Everlane', affinity: 1.0 },
            { brandName: 'Reformation', affinity: 0.8 }
          ]
        },
        visualType: 'brand-cloud'
      }
    ],
    visualElements: [],
    shareableContent: {
      title: 'My Shopping DNA',
      description: 'Discover your unique style profile',
      hashtags: ['#ShopStory', '#StyleDNA'],
      platforms: ['instagram'],
      exportFormats: ['story-9x16']
    },
    createdAt: new Date(),
    shoppableProducts: []
  },
  {
    id: 'story-2',
    type: 'style-evolution',
    title: 'Style Evolution',
    insights: [
      {
        id: 'insight-3',
        type: 'seasonal-shift',
        title: 'Fall Fashion Forward',
        description: 'Your style is evolving toward more experimental fall trends.',
        confidence: 0.76,
        data: {
          trend: 'up',
          percentage: '23%',
          period: 'this season'
        },
        visualType: 'trend-line'
      }
    ],
    visualElements: [],
    shareableContent: {
      title: 'My Style Evolution',
      description: 'See how my style has changed',
      hashtags: ['#StyleEvolution', '#FallFashion'],
      platforms: ['instagram'],
      exportFormats: ['story-9x16']
    },
    createdAt: new Date()
  }
]

export function App() {
  const { products } = usePopularProducts()
  const [showStories, setShowStories] = useState(false)

  const handleStoryChange = (index: number, story: StoryData) => {
    console.log('Story changed to:', story.title)
  }

  const handleShare = (story: StoryData) => {
    console.log('Sharing story:', story.title)
    // In a real app, this would open the share modal
  }

  const handleProductClick = (productId: string, story: StoryData) => {
    console.log('Product clicked:', productId, 'from story:', story.title)
    // In a real app, this would navigate to the product
  }

  if (showStories) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowStories(false)}
              className="text-white bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm"
            >
              ← Back to Products
            </button>
          </div>
          <div style={{ aspectRatio: '9/16', height: '80vh' }}>
            <StoryCardContainer
              stories={mockStories}
              onStoryChange={handleStoryChange}
              onShare={handleShare}
              onProductClick={handleProductClick}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-12 px-4 pb-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Shop Story Demo
      </h1>
      <p className="text-xs text-blue-600 mb-4 text-center bg-blue-50 py-2 px-4 rounded border border-blue-200">
        🎨 Story card components implemented with swipe navigation and animated insights!
      </p>
      
      <div className="mb-6 text-center">
        <button
          onClick={() => setShowStories(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          View Your Stories
        </button>
      </div>

      <p className="text-base text-gray-600 mb-6 text-center">
        Popular products today
      </p>
      <div className="grid grid-cols-2 gap-4">
        {products?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
