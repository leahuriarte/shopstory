// Social sharing and comparison type definitions

export interface SocialShareData {
  contentId: string
  contentType: 'story' | 'product-set' | 'style-comparison' | 'achievement'
  title: string
  description: string
  imageUrl?: string
  deepLink: string
  hashtags: string[]
  platforms: SocialPlatformConfig[]
}

export interface SocialPlatformConfig {
  platform: SocialPlatform
  enabled: boolean
  customMessage?: string
  aspectRatio: string
  maxLength?: number
  requiresImage: boolean
}

export interface FriendComparison {
  id: string
  userId: string
  friendId: string
  comparisonType: 'style-dna' | 'shopping-habits' | 'brand-affinity' | 'seasonal-trends'
  results: ComparisonResult[]
  shareableContent: SocialShareData
  createdAt: Date
  privacy: 'public' | 'friends' | 'private'
}

export interface ComparisonResult {
  metric: string
  userValue: number | string
  friendValue: number | string
  similarity: number // 0-1, how similar the values are
  winner?: 'user' | 'friend' | 'tie'
  description: string
}

export interface CreatorTemplate {
  id: string
  name: string
  description: string
  category: 'style-showcase' | 'product-review' | 'trend-analysis' | 'shopping-haul'
  template: TemplateConfig
  requirements: TemplateRequirement[]
  popularity: number
}

export interface TemplateConfig {
  aspectRatio: string
  duration?: number // for video templates
  sections: TemplateSection[]
  styling: TemplateStyle
  animations?: AnimationConfig[]
}

export interface TemplateSection {
  id: string
  type: 'header' | 'content' | 'product-grid' | 'stats' | 'call-to-action'
  position: Position
  size: Size
  content: SectionContent
}

export interface SectionContent {
  text?: string
  products?: string[] // product IDs
  stats?: StatDisplay[]
  image?: string
  backgroundColor?: string
  textColor?: string
}

export interface StatDisplay {
  label: string
  value: string | number
  format: 'number' | 'percentage' | 'currency' | 'text'
  highlight?: boolean
}

export interface TemplateStyle {
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  borderRadius: number
  spacing: number
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'bounce'
  duration: number
  delay?: number
  easing: string
}

export interface TemplateRequirement {
  type: 'min-products' | 'min-purchases' | 'style-data' | 'time-period'
  value: number | string
  description: string
}

export interface SocialProof {
  type: 'likes' | 'shares' | 'comments' | 'saves' | 'views'
  count: number
  recent: boolean // within last 24 hours
  trending: boolean // above average engagement
}

export interface CommunityValidation {
  styleScore: number // 0-100 community rating
  trendiness: number // 0-100 how on-trend the style is
  uniqueness: number // 0-100 how unique/original
  votes: ValidationVote[]
  badges: StyleBadge[]
}

export interface ValidationVote {
  userId: string
  vote: 'love' | 'like' | 'meh' | 'dislike'
  comment?: string
  timestamp: Date
}

export interface StyleBadge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: Date
}

export interface SocialFeatures {
  shareContent(data: SocialShareData): Promise<ShareResult>
  compareWithFriend(friendId: string, comparisonType: string): Promise<FriendComparison>
  generateCreatorContent(templateId: string, userData: any): Promise<CreatorContent>
  getCommunityValidation(contentId: string): Promise<CommunityValidation>
}

export interface ShareResult {
  success: boolean
  platform: SocialPlatform
  shareUrl?: string
  error?: string
  analytics: ShareAnalytics
}

export interface ShareAnalytics {
  impressions: number
  clicks: number
  shares: number
  engagement: number
}

export interface CreatorContent {
  id: string
  templateId: string
  content: TemplateConfig
  exportUrls: ExportUrl[]
  analytics: ContentAnalytics
}

export interface ExportUrl {
  format: ExportFormat
  url: string
  size: Size
  quality: 'low' | 'medium' | 'high'
}

export interface ContentAnalytics {
  views: number
  shares: number
  saves: number
  clickThroughs: number
  conversionRate: number
}

// Import shared types
import type { SocialPlatform, ExportFormat, Position, Size } from './story'