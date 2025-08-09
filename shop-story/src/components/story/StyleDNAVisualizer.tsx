import React, { useEffect, useState } from 'react'
import type { Insight } from '../../types/story'
import type { StyleProfile } from '../../types/analytics'

interface StyleDNAVisualizerProps {
  insight?: Insight
  styleProfile?: StyleProfile
  animated?: boolean
  compact?: boolean
}

export const StyleDNAVisualizer: React.FC<StyleDNAVisualizerProps> = ({
  insight,
  styleProfile,
  animated = false,
  compact = false
}) => {
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setAnimationProgress(prev => Math.min(prev + 2, 100))
    }, 20)

    return () => clearInterval(interval)
  }, [animated])

  // Render color palette visualization
  const renderColorPalette = (colors: string[] | { color: string; name: string; frequency: number }[]) => {
    const colorArray = Array.isArray(colors) 
      ? colors.map(color => typeof color === 'string' ? { color, name: '', frequency: 1 } : color)
      : colors

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Your Color DNA</h3>
        <div className="grid grid-cols-2 gap-3">
          {colorArray.slice(0, compact ? 4 : 6).map((colorData, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg"
              style={{
                transform: animated ? `scale(${Math.min(animationProgress / 100, 1)})` : 'scale(1)',
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div
                className="h-16 w-full"
                style={{ backgroundColor: colorData.color }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                <p className="text-white text-xs font-medium">
                  {colorData.name || `Color ${index + 1}`}
                </p>
                {!compact && (
                  <p className="text-white/70 text-xs">
                    {Math.round((colorData.frequency || 0) * 100)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render brand affinity visualization
  const renderBrandCloud = (brands: string[] | { brandName: string; affinity: number }[]) => {
    const brandArray = Array.isArray(brands)
      ? brands.map(brand => typeof brand === 'string' ? { brandName: brand, affinity: 1 } : brand)
      : brands

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Brand Affinity</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {brandArray.slice(0, compact ? 6 : 10).map((brandData, index) => {
            const size = Math.max(0.8, brandData.affinity || 1)
            const opacity = animated ? Math.min(animationProgress / 100, 1) : 1
            
            return (
              <span
                key={index}
                className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white font-medium transition-all duration-300"
                style={{
                  fontSize: `${size}rem`,
                  opacity,
                  transform: animated ? `translateY(${20 - (animationProgress / 5)}px)` : 'translateY(0)',
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {brandData.brandName}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  // Render category preferences as a bar chart
  const renderCategoryChart = (categories: { category: string; weight: number }[]) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Style Categories</h3>
        <div className="space-y-3">
          {categories.slice(0, compact ? 3 : 5).map((categoryData, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium capitalize">
                  {categoryData.category.replace('-', ' ')}
                </span>
                <span className="text-white/70">
                  {Math.round(categoryData.weight * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{
                    width: animated 
                      ? `${Math.min(animationProgress, categoryData.weight * 100)}%`
                      : `${categoryData.weight * 100}%`,
                    transitionDelay: `${index * 200}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render evolution score as a circular progress
  const renderEvolutionScore = (score: number) => {
    const normalizedScore = (score + 1) / 2 // Convert from -1,1 to 0,1
    const circumference = 2 * Math.PI * 40
    const strokeDasharray = circumference
    const strokeDashoffset = animated
      ? circumference - (circumference * normalizedScore * (animationProgress / 100))
      : circumference - (circumference * normalizedScore)

    return (
      <div className="flex flex-col items-center space-y-3">
        <h3 className="text-lg font-semibold text-white">Style Evolution</h3>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="white"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {Math.round(normalizedScore * 100)}%
            </span>
          </div>
        </div>
        <p className="text-white/80 text-sm text-center">
          {score > 0.3 ? 'Experimental' : score < -0.3 ? 'Classic' : 'Balanced'}
        </p>
      </div>
    )
  }

  // Handle insight-based visualization
  if (insight) {
    switch (insight.visualType) {
      case 'color-palette':
        return renderColorPalette(insight.data.colors || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
      
      case 'brand-cloud':
        return renderBrandCloud(insight.data.brands || ['Nike', 'Adidas', 'Zara', 'H&M'])
      
      case 'chart':
        if (insight.data.categories) {
          return renderCategoryChart(insight.data.categories)
        }
        return (
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {insight.data.value || '42%'}
            </div>
            <p className="text-white/80">
              {insight.data.metric || 'of your style'}
            </p>
          </div>
        )
      
      case 'trend-line':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {insight.data.trend === 'up' ? '📈' : '📉'}
            </div>
            <div className="text-2xl font-bold text-white">
              {insight.data.percentage || '23%'}
            </div>
            <p className="text-white/80">
              {insight.data.period || 'this month'}
            </p>
          </div>
        )
      
      default:
        return (
          <div className="text-center text-white">
            <p className="text-lg font-semibold">{insight.title}</p>
            <p className="text-white/80 mt-2">{insight.description}</p>
          </div>
        )
    }
  }

  // Handle style profile visualization
  if (styleProfile) {
    return (
      <div className="space-y-8">
        {styleProfile.dominantColors.length > 0 && (
          renderColorPalette(styleProfile.dominantColors)
        )}
        
        {styleProfile.preferredBrands.length > 0 && (
          renderBrandCloud(styleProfile.preferredBrands)
        )}
        
        {styleProfile.categoryPreferences.length > 0 && (
          renderCategoryChart(styleProfile.categoryPreferences)
        )}
        
        {!compact && (
          renderEvolutionScore(styleProfile.evolutionScore)
        )}
      </div>
    )
  }

  // Fallback visualization
  return (
    <div className="text-center text-white space-y-4">
      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </div>
      <p className="text-lg font-semibold">Your Style DNA</p>
      <p className="text-white/80 text-sm">
        Keep shopping to unlock your personalized insights
      </p>
    </div>
  )
}