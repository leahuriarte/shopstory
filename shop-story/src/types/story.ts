// Story-related type definitions

export interface StoryData {
  id: string
  type: 'behavioral' | 'style-evolution' | 'recap' | 'seasonal'
  title: string
  insights: Insight[]
  visualElements: VisualElement[]
  shoppableProducts?: Product[]
  shareableContent: ShareableContent
  createdAt: Date
  expiresAt?: Date
}

export interface Insight {
  id: string
  type: 'color-preference' | 'brand-affinity' | 'category-trend' | 'price-pattern' | 'seasonal-shift'
  title: string
  description: string
  confidence: number // 0-1 score
  data: Record<string, any>
  visualType: 'chart' | 'color-palette' | 'brand-cloud' | 'trend-line'
}

export interface VisualElement {
  id: string
  type: 'background' | 'chart' | 'text-overlay' | 'product-grid' | 'color-swatch'
  position: Position
  size: Size
  style: Record<string, any>
  data?: any
}

export interface Position {
  x: number
  y: number
  z?: number
}

export interface Size {
  width: number
  height: number
}

export interface ShareableContent {
  title: string
  description: string
  imageUrl?: string
  hashtags: string[]
  platforms: SocialPlatform[]
  exportFormats: ExportFormat[]
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'snapchat'
export type ExportFormat = 'story-9x16' | 'post-1x1' | 'landscape-16x9'

// Re-export Product type from Shop Minis (will be imported from @shopify/shop-minis-react)
export interface Product {
  id: string
  title: string
  description?: string
  images: ProductImage[]
  price: Price
  vendor?: string
  productType?: string
  tags?: string[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  width?: number
  height?: number
}

export interface Price {
  amount: string
  currencyCode: string
}

export interface ProductVariant {
  id: string
  title: string
  price: Price
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

export interface SelectedOption {
  name: string
  value: string
}