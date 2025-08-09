import React, { useState, useEffect } from 'react'
import type { StoryData } from '../../types/story'
import { StyleDNAVisualizer } from './StyleDNAVisualizer'

interface StoryCardProps {
  story: StoryData
  isActive: boolean
  onShare: () => void
  onProductClick?: (productId: string) => void
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isActive,
  onShare,
  onProductClick
}) => {
  const [progress, setProgress] = useState(0)
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)

  // Auto-progress through insights when card is active
  useEffect(() => {
    if (!isActive || story.insights.length === 0) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1
        if (newProgress >= 100) {
          setCurrentInsightIndex(current => 
            current < story.insights.length - 1 ? current + 1 : 0
          )
          return 0
        }
        return newProgress
      })
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(interval)
  }, [isActive, story.insights.length, currentInsightIndex])

  const currentInsight = story.insights[currentInsightIndex]

  const getBackgroundGradient = () => {
    switch (story.type) {
      case 'behavioral':
        return 'from-purple-600 to-pink-600'
      case 'style-evolution':
        return 'from-blue-600 to-teal-600'
      case 'recap':
        return 'from-orange-600 to-red-600'
      case 'seasonal':
        return 'from-green-600 to-emerald-600'
      default:
        return 'from-gray-600 to-gray-800'
    }
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}% confident`
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br overflow-hidden rounded-lg shadow-lg">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()}`} />
      
      {/* Progress indicators */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex space-x-1">
          {story.insights.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{
                  width: index === currentInsightIndex 
                    ? `${progress}%` 
                    : index < currentInsightIndex 
                      ? '100%' 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-10">
        <h1 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
          {story.title}
        </h1>
        <p className="text-white/80 text-sm">
          {new Date(story.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Main content area */}
      <div className="absolute inset-0 pt-32 pb-20 px-4 flex flex-col justify-center">
        {currentInsight && (
          <div className="text-center text-white space-y-6">
            {/* Insight visualization */}
            {currentInsight.visualType === 'color-palette' && (
              <StyleDNAVisualizer 
                insight={currentInsight}
                animated={isActive}
              />
            )}
            
            {currentInsight.visualType === 'chart' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">
                  {currentInsight.data.value || '42%'}
                </div>
                <div className="text-sm opacity-80">
                  {currentInsight.data.metric || 'of your style'}
                </div>
              </div>
            )}

            {currentInsight.visualType === 'brand-cloud' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {(currentInsight.data.brands || ['Nike', 'Adidas', 'Zara']).map((brand: string, index: number) => (
                    <span
                      key={brand}
                      className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                      style={{
                        fontSize: `${1 + (index === 0 ? 0.5 : index === 1 ? 0.3 : 0)}rem`
                      }}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentInsight.visualType === 'trend-line' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
                  <span>{currentInsight.data.trend === 'up' ? '↗️' : '↘️'}</span>
                  <span>{currentInsight.data.percentage || '23%'}</span>
                </div>
                <div className="text-sm opacity-80 mt-2">
                  {currentInsight.data.period || 'this month'}
                </div>
              </div>
            )}

            {/* Insight text */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">
                {currentInsight.title}
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                {currentInsight.description}
              </p>
              <p className="text-white/70 text-xs">
                {formatConfidence(currentInsight.confidence)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Shoppable products */}
      {story.shoppableProducts && story.shoppableProducts.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Shop this vibe</h3>
            <div className="flex space-x-3 overflow-x-auto">
              {story.shoppableProducts.slice(0, 3).map((product) => (
                <button
                  key={product.id}
                  onClick={() => onProductClick?.(product.id)}
                  className="flex-shrink-0 bg-white/20 rounded-lg p-2 min-w-[80px] text-center"
                >
                  <div className="w-12 h-12 bg-white/30 rounded-lg mb-2 mx-auto" />
                  <p className="text-white text-xs font-medium truncate">
                    {product.title}
                  </p>
                  <p className="text-white/80 text-xs">
                    ${product.price.amount}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <button
          onClick={onShare}
          className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
          aria-label="Share story"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>

        <div className="text-white/60 text-xs">
          {currentInsightIndex + 1} of {story.insights.length}
        </div>

        <button
          className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
          aria-label="More options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Expiration indicator */}
      {story.expiresAt && (
        <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
          Expires {new Date(story.expiresAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}