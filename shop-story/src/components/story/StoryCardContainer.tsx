import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { StoryData } from '../../types/story'
import { StoryCard } from './StoryCard'

interface StoryCardContainerProps {
  stories: StoryData[]
  initialIndex?: number
  onStoryChange?: (index: number, story: StoryData) => void
  onShare?: (story: StoryData) => void
  onProductClick?: (productId: string, story: StoryData) => void
  className?: string
}

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  startTime: number
}

export const StoryCardContainer: React.FC<StoryCardContainerProps> = ({
  stories,
  initialIndex = 0,
  onStoryChange,
  onShare,
  onProductClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [touchState, setTouchState] = useState<TouchState | null>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Constants for swipe behavior
  const SWIPE_THRESHOLD = 50 // Minimum distance for a swipe
  const SWIPE_VELOCITY_THRESHOLD = 0.3 // Minimum velocity for a swipe
  const MAX_TRANSLATE = 100 // Maximum translation percentage

  // Handle story change
  const changeStory = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= stories.length || newIndex === currentIndex) {
      return
    }

    setIsTransitioning(true)
    setCurrentIndex(newIndex)
    setTranslateX(0)
    
    // Call callback
    onStoryChange?.(newIndex, stories[newIndex])

    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentIndex, stories, onStoryChange])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
      startTime: Date.now()
    })
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchState.startX
    const deltaY = touch.clientY - touchState.startY

    // Determine if this is a horizontal swipe
    if (!touchState.isDragging) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10
      if (isHorizontalSwipe) {
        setTouchState(prev => prev ? { ...prev, isDragging: true } : null)
      } else if (Math.abs(deltaY) > 10) {
        // Vertical swipe, don't interfere
        setTouchState(null)
        return
      }
    }

    if (touchState.isDragging) {
      e.preventDefault()
      
      // Calculate translation with resistance at boundaries
      let translation = deltaX
      
      // Add resistance at boundaries
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === stories.length - 1 && deltaX < 0)) {
        translation = deltaX * 0.3 // Reduce movement at boundaries
      }

      // Limit translation
      const maxTranslation = containerRef.current?.clientWidth || 300
      translation = Math.max(-maxTranslation, Math.min(maxTranslation, translation))
      
      setTranslateX(translation)
      setTouchState(prev => prev ? { ...prev, currentX: touch.clientX, currentY: touch.clientY } : null)
    }
  }, [touchState, currentIndex, stories.length])

  const handleTouchEnd = useCallback(() => {
    if (!touchState || !touchState.isDragging) {
      setTouchState(null)
      return
    }

    const deltaX = touchState.currentX - touchState.startX
    const deltaTime = Date.now() - touchState.startTime
    const velocity = Math.abs(deltaX) / deltaTime

    // Determine if swipe should trigger navigation
    const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD

    if (shouldSwipe) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous story
        changeStory(currentIndex - 1)
      } else if (deltaX < 0 && currentIndex < stories.length - 1) {
        // Swipe left - go to next story
        changeStory(currentIndex + 1)
      } else {
        // Snap back
        setTranslateX(0)
      }
    } else {
      // Snap back
      setTranslateX(0)
    }

    setTouchState(null)
  }, [touchState, currentIndex, stories.length, changeStory])

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setTouchState({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: false,
      startTime: Date.now()
    })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchState) return

    const deltaX = e.clientX - touchState.startX
    const deltaY = e.clientY - touchState.startY

    if (!touchState.isDragging) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10
      if (isHorizontalSwipe) {
        setTouchState(prev => prev ? { ...prev, isDragging: true } : null)
      }
    }

    if (touchState.isDragging) {
      e.preventDefault()
      
      let translation = deltaX
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === stories.length - 1 && deltaX < 0)) {
        translation = deltaX * 0.3
      }

      const maxTranslation = containerRef.current?.clientWidth || 300
      translation = Math.max(-maxTranslation, Math.min(maxTranslation, translation))
      
      setTranslateX(translation)
      setTouchState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null)
    }
  }, [touchState, currentIndex, stories.length])

  const handleMouseUp = useCallback(() => {
    if (!touchState || !touchState.isDragging) {
      setTouchState(null)
      return
    }

    const deltaX = touchState.currentX - touchState.startX
    const deltaTime = Date.now() - touchState.startTime
    const velocity = Math.abs(deltaX) / deltaTime

    const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD

    if (shouldSwipe) {
      if (deltaX > 0 && currentIndex > 0) {
        changeStory(currentIndex - 1)
      } else if (deltaX < 0 && currentIndex < stories.length - 1) {
        changeStory(currentIndex + 1)
      } else {
        setTranslateX(0)
      }
    } else {
      setTranslateX(0)
    }

    setTouchState(null)
  }, [touchState, currentIndex, stories.length, changeStory])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        changeStory(currentIndex - 1)
      } else if (e.key === 'ArrowRight' && currentIndex < stories.length - 1) {
        changeStory(currentIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, stories.length, changeStory])

  // Handle share
  const handleShare = useCallback(() => {
    onShare?.(stories[currentIndex])
  }, [currentIndex, stories, onShare])

  // Handle product click
  const handleProductClick = useCallback((productId: string) => {
    onProductClick?.(productId, stories[currentIndex])
  }, [currentIndex, stories, onProductClick])

  if (stories.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-lg font-medium">No stories available</p>
          <p className="text-sm">Keep shopping to generate your style stories</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ aspectRatio: '9/16' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Story cards */}
      <div 
        className="flex h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          transitionDuration: isTransitioning || !touchState?.isDragging ? '300ms' : '0ms'
        }}
      >
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="w-full h-full flex-shrink-0"
          >
            <StoryCard
              story={story}
              isActive={index === currentIndex}
              onShare={handleShare}
              onProductClick={handleProductClick}
            />
          </div>
        ))}
      </div>

      {/* Navigation indicators */}
      {stories.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => changeStory(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows for desktop */}
      {stories.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={() => changeStory(currentIndex - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/40 transition-colors z-20 hidden md:block"
              aria-label="Previous story"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <button
              onClick={() => changeStory(currentIndex + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/40 transition-colors z-20 hidden md:block"
              aria-label="Next story"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Story counter */}
      <div className="absolute top-16 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm z-20">
        {currentIndex + 1} / {stories.length}
      </div>
    </div>
  )
}