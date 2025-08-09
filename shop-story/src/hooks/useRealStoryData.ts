import { useState, useEffect, useMemo } from 'react'
import { 
  useRecentProducts, 
  useSavedProducts, 
  usePopularProducts,
  useOrders,
  useCurrentUser
} from '@shopify/shop-minis-react'
import type { StoryData } from '../types/story'
import type { Product } from '../types/story'

interface UseRealStoryDataReturns {
  stories: StoryData[]
  loading: boolean
  error: string | null
}

export const useRealStoryData = (): UseRealStoryDataReturns => {
  const [error, setError] = useState<string | null>(null)
  
  // Fetch real data from Shop Minis hooks
  const { products: recentProducts, loading: recentLoading } = useRecentProducts()
  const { products: savedProducts, loading: savedLoading } = useSavedProducts()
  const { products: popularProducts, loading: popularLoading } = usePopularProducts()
  const { orders, loading: ordersLoading } = useOrders()
  const { loading: userLoading } = useCurrentUser()

  const loading = recentLoading || savedLoading || popularLoading || ordersLoading || userLoading

  // Transform Shop Minis Product to our internal Product type
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

  // Generate stories from real data
  const stories = useMemo((): StoryData[] => {
    if (loading || !recentProducts) return []

    const generatedStories: StoryData[] = []

    try {
      // Story 1: Shopping DNA based on recent products
      if (recentProducts && recentProducts.length > 0) {
        const colorAnalysis = analyzeColors(recentProducts)
        const brandAnalysis = analyzeBrands(recentProducts)
        
        generatedStories.push({
          id: 'real-story-1',
          type: 'behavioral',
          title: 'Your Shopping DNA',
          insights: [
            {
              id: 'real-insight-1',
              type: 'color-preference',
              title: colorAnalysis.title,
              description: colorAnalysis.description,
              confidence: colorAnalysis.confidence,
              data: {
                colors: colorAnalysis.colors
              },
              visualType: 'color-palette'
            },
            {
              id: 'real-insight-2',
              type: 'brand-affinity',
              title: brandAnalysis.title,
              description: brandAnalysis.description,
              confidence: brandAnalysis.confidence,
              data: {
                brands: brandAnalysis.brands
              },
              visualType: 'brand-cloud'
            }
          ],
          visualElements: [],
          shareableContent: {
            title: 'My Shopping DNA',
            description: 'Discover your unique style profile based on real shopping data',
            hashtags: ['#ShopStory', '#StyleDNA', '#RealData'],
            platforms: ['instagram'],
            exportFormats: ['story-9x16']
          },
          createdAt: new Date(),
          shoppableProducts: recentProducts.slice(0, 4).map(transformProduct)
        })
      }

      // Story 2: Style Evolution based on recent vs saved products
      if (recentProducts && savedProducts && recentProducts.length > 0 && savedProducts.length > 0) {
        const evolutionAnalysis = analyzeStyleEvolution(recentProducts, savedProducts)
        
        generatedStories.push({
          id: 'real-story-2',
          type: 'style-evolution',
          title: 'Style Evolution',
          insights: [
            {
              id: 'real-insight-3',
              type: 'seasonal-shift',
              title: evolutionAnalysis.title,
              description: evolutionAnalysis.description,
              confidence: evolutionAnalysis.confidence,
              data: evolutionAnalysis.data,
              visualType: 'trend-line'
            }
          ],
          visualElements: [],
          shareableContent: {
            title: 'My Style Evolution',
            description: 'See how my style has changed over time',
            hashtags: ['#StyleEvolution', '#ShopStory'],
            platforms: ['instagram'],
            exportFormats: ['story-9x16']
          },
          createdAt: new Date(),
          shoppableProducts: [...(recentProducts.slice(0, 2).map(transformProduct)), ...(savedProducts.slice(0, 2).map(transformProduct))]
        })
      }

      // Story 3: Purchase History Recap (if orders available)
      if (orders && orders.length > 0) {
        const purchaseAnalysis = analyzePurchaseHistory(orders)
        
        generatedStories.push({
          id: 'real-story-3',
          type: 'recap',
          title: 'Shopping Recap',
          insights: [
            {
              id: 'real-insight-4',
              type: 'price-pattern',
              title: purchaseAnalysis.title,
              description: purchaseAnalysis.description,
              confidence: purchaseAnalysis.confidence,
              data: purchaseAnalysis.data,
              visualType: 'chart'
            }
          ],
          visualElements: [],
          shareableContent: {
            title: 'My Shopping Recap',
            description: 'A look back at my recent purchases',
            hashtags: ['#ShoppingRecap', '#ShopStory'],
            platforms: ['instagram'],
            exportFormats: ['story-9x16']
          },
          createdAt: new Date(),
          shoppableProducts: popularProducts?.slice(0, 4).map(transformProduct) || []
        })
      }

    } catch (err) {
      console.error('Error generating stories from real data:', err)
      setError('Failed to generate stories from your shopping data')
    }

    return generatedStories
  }, [recentProducts, savedProducts, popularProducts, orders, loading])

  return {
    stories,
    loading,
    error
  }
}

// Helper functions to analyze real data
function analyzeColors(products: any[]) {
  // Extract colors from product tags, titles, or other metadata
  const colorKeywords = ['red', 'blue', 'green', 'black', 'white', 'brown', 'pink', 'purple', 'yellow', 'orange', 'gray', 'beige', 'navy', 'olive']
  const colorCounts: Record<string, number> = {}
  
  products.forEach(product => {
    const searchText = `${product.title} ${product.tags?.join(' ') || ''}`.toLowerCase()
    colorKeywords.forEach(color => {
      if (searchText.includes(color)) {
        colorCounts[color] = (colorCounts[color] || 0) + 1
      }
    })
  })

  const sortedColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([color, count], index) => ({
      color: getColorHex(color),
      name: color.charAt(0).toUpperCase() + color.slice(1),
      frequency: count / products.length
    }))

  const dominantColor = sortedColors[0]?.name || 'Neutral'
  
  return {
    title: `${dominantColor} Enthusiast`,
    description: `Your recent purchases show a strong preference for ${dominantColor.toLowerCase()} tones and complementary colors.`,
    confidence: Math.min(0.9, 0.6 + (sortedColors.length * 0.1)),
    colors: sortedColors.length > 0 ? sortedColors : [
      { color: '#8B4513', name: 'Earth Tone', frequency: 0.4 },
      { color: '#DEB887', name: 'Neutral', frequency: 0.3 }
    ]
  }
}

function analyzeBrands(products: any[]) {
  const brandCounts: Record<string, number> = {}
  
  products.forEach(product => {
    if (product.vendor) {
      brandCounts[product.vendor] = (brandCounts[product.vendor] || 0) + 1
    }
  })

  const sortedBrands = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([brand, count]) => ({
      brandName: brand,
      affinity: Math.min(1.5, count / products.length * 2)
    }))

  const topBrand = sortedBrands[0]?.brandName || 'Quality Brands'
  
  return {
    title: `${topBrand} Loyalist`,
    description: `You have a strong affinity for ${topBrand} and similar quality brands.`,
    confidence: Math.min(0.95, 0.7 + (sortedBrands.length * 0.1)),
    brands: sortedBrands.length > 0 ? sortedBrands : [
      { brandName: 'Quality Brands', affinity: 1.0 }
    ]
  }
}

function analyzeStyleEvolution(recentProducts: any[], savedProducts: any[]) {
  // Compare product types, price ranges, or categories between recent and saved
  const recentCategories = extractCategories(recentProducts)
  const savedCategories = extractCategories(savedProducts)
  
  const newCategories = recentCategories.filter(cat => !savedCategories.includes(cat))
  const evolutionScore = newCategories.length / Math.max(recentCategories.length, 1)
  
  return {
    title: evolutionScore > 0.3 ? 'Style Explorer' : 'Consistent Taste',
    description: evolutionScore > 0.3 
      ? `You're exploring new styles! ${Math.round(evolutionScore * 100)}% of your recent interests are in new categories.`
      : `You have consistent taste, staying true to your preferred style categories.`,
    confidence: 0.8,
    data: {
      trend: evolutionScore > 0.3 ? 'up' : 'stable',
      percentage: `${Math.round(evolutionScore * 100)}%`,
      period: 'recently'
    }
  }
}

function analyzePurchaseHistory(orders: any[]) {
  const totalOrders = orders.length
  const totalValue = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice?.amount || '0')), 0)
  const avgOrderValue = totalValue / totalOrders
  
  return {
    title: 'Shopping Insights',
    description: `You've made ${totalOrders} orders with an average value of $${avgOrderValue.toFixed(2)}.`,
    confidence: 0.9,
    data: {
      totalOrders,
      totalValue: totalValue.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      period: 'recent months'
    }
  }
}

function extractCategories(products: any[]): string[] {
  const categories = products.map(p => p.productType).filter(Boolean)
  return Array.from(new Set(categories))
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    black: '#000000',
    white: '#FFFFFF',
    brown: '#8B4513',
    pink: '#FFC0CB',
    purple: '#800080',
    yellow: '#FFFF00',
    orange: '#FFA500',
    gray: '#808080',
    beige: '#F5F5DC',
    navy: '#000080',
    olive: '#808000'
  }
  return colorMap[colorName] || '#8B4513'
}