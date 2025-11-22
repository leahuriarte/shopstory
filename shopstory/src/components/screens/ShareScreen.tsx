import { useState } from 'react'
import { useShare } from '@shopify/shop-minis-react'
import { Screen } from '../StoryView'
import { ColorScreen } from './ColorScreen'
import { PopularProductsScreen } from './PopularProductsScreen'
import { TitleScreen } from './TitleScreen'
import { CarbonFootprintScreen } from './CarbonFootprint'
import { TopBrandsScreen } from './TopBrandsScreen'
import { PaletteScreen } from './Palette'
import { SmallBusinessScreen } from './SmallBusiness'
import { ShippingTimeScreen } from './ShippingTime'
import { AestheticsScreen } from './AestheticsScreen'
import { RecommendationsScreen } from './RecommendationsScreen'

type ShareScreenProps = {
  onNext: () => void
  onPrevious: () => void
  allScreens?: Screen[]
}

export function ShareScreen({ onNext, onPrevious, allScreens = [] }: ShareScreenProps) {
  const { share } = useShare()

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const screenWidth = rect.width

    // If clicked on left half, go back; if clicked on right half, go forward
    if (clickX < screenWidth / 2) {
      onPrevious()
    } else {
      onNext()
    }
  }
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Only allow shareable types
  const shareableScreens = allScreens.filter(
    (screen) => screen.type !== 'share' && screen.type !== 'color'
  )

  const handleScreenSelect = (index: number) => {
    setSelectedScreenIndex(index)
  }

  const handleShareClick = async () => {
    const selectedScreen = shareableScreens[selectedScreenIndex]
    const shareText = getShareText(selectedScreen)

    try {
      await share({
        title: `My Shop Story - ${shareText}`,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  // Handle touch events for swiping
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedScreenIndex < shareableScreens.length - 1) {
      handleScreenSelect(selectedScreenIndex + 1)
    }
    if (isRightSwipe && selectedScreenIndex > 0) {
      handleScreenSelect(selectedScreenIndex - 1)
    }
  }

  const getShareText = (screen: Screen): string => {
    const texts: Record<string, string> = {
      aesthetics: 'Check out my shopping aesthetic analysis! 🛍️✨',
      carbonFootprint: 'Just discovered my shopping carbon footprint! 🌱♻️',
      topBrands: 'My top shopping brands revealed! 🏆👜',
      palette: 'Look at my shopping color palette! 🎨🌈',
      smallBusiness: 'Supporting small businesses in my shopping! 🏪❤️',
      shippingTime: 'My shipping analytics are in! 📦⚡',
      recommendations: 'Got some amazing shopping recommendations! 💫🛒',
      popularProducts: 'Check out these popular products! 🔥🛍️',
      title: 'Check out my shopping story! 🛍️',
    }
    return texts[screen.type] || 'Check out my shopping story! 🛍️'
  }

  const renderActualScreen = (screen: Screen) => {
    const dummyOnNext = () => {}
    switch (screen.type) {
      case 'title':
        return <TitleScreen onNext={dummyOnNext} onPrevious={dummyOnNext} screen={screen} />
      case 'color':
        return <ColorScreen onNext={dummyOnNext} onPrevious={dummyOnNext} screen={screen} />
      case 'popularProducts':
        return <PopularProductsScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'carbonFootprint':
        return <CarbonFootprintScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'topBrands':
        return <TopBrandsScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'palette':
        return <PaletteScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'smallBusiness':
        return <SmallBusinessScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'shippingTime':
        return <ShippingTimeScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'aesthetics':
        return <AestheticsScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      case 'recommendations':
        return <RecommendationsScreen onNext={dummyOnNext} onPrevious={dummyOnNext} />
      default:
        return (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white rounded-lg">
            Unknown screen type
          </div>
        )
    }
  }

  if (shareableScreens.length === 0) {
    return (
      <div className="w-full h-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No screens to share</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black text-white flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h1 className="text-xl font-bold">Share Your Story</h1>
          <p className="text-gray-400 text-sm">Browse your favorite screen to share</p>
        </div>
        <button
          onClick={handleShareClick}
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 shadow-lg transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16,6 12,2 8,6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </div>

      {/* Current screen */}
      <div 
        className="flex-1 relative overflow-hidden cursor-pointer"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
      >
        {renderActualScreen(shareableScreens[selectedScreenIndex])}

        {/* Navigation dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
          {shareableScreens.map((_, i) => (
            <button
              key={i}
              onClick={() => handleScreenSelect(i)}
              className={`w-2 h-2 rounded-full ${
                i === selectedScreenIndex ? 'bg-white' : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        {selectedScreenIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleScreenSelect(selectedScreenIndex - 1)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-200 hover:scale-110 z-10"
          >
            ‹
          </button>
        )}
        {selectedScreenIndex < shareableScreens.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleScreenSelect(selectedScreenIndex + 1)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-200 hover:scale-110 z-10"
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}
