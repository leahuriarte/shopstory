import { useState } from 'react'
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
  allScreens?: Screen[]
}

type SocialPlatform = 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin'

export function ShareScreen({ onNext, allScreens = [] }: ShareScreenProps) {
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0)
  const [showSocialOptions, setShowSocialOptions] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Only allow shareable types
  const shareableScreens = allScreens.filter(
    (screen) => screen.type !== 'share' && screen.type !== 'color'
  )

  const handleScreenSelect = (index: number) => {
    setSelectedScreenIndex(index)
    setShowSocialOptions(false)
  }

  const handleShareClick = () => {
    setShowSocialOptions(true)
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

  const handleSocialShare = async (platform: SocialPlatform) => {
    const selectedScreen = shareableScreens[selectedScreenIndex]
    const shareText = getShareText(selectedScreen)
    const shareUrl = window.location.href

    let socialUrl = ''

    switch (platform) {
      case 'instagram':
      case 'tiktok':
        try {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
          alert(`Share text copied! Paste it in ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`)
        } catch {
          alert('Unable to copy to clipboard.')
        }
        break
      case 'twitter':
        socialUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
        break
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400')
    }

    setShowSocialOptions(false)
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
        return <TitleScreen onNext={dummyOnNext} screen={screen} />
      case 'color':
        return <ColorScreen onNext={dummyOnNext} screen={screen} />
      case 'popularProducts':
        return <PopularProductsScreen onNext={dummyOnNext} />
      case 'carbonFootprint':
        return <CarbonFootprintScreen onNext={dummyOnNext} />
      case 'topBrands':
        return <TopBrandsScreen onNext={dummyOnNext} />
      case 'palette':
        return <PaletteScreen onNext={dummyOnNext} />
      case 'smallBusiness':
        return <SmallBusinessScreen onNext={dummyOnNext} />
      case 'shippingTime':
        return <ShippingTimeScreen onNext={dummyOnNext} />
      case 'aesthetics':
        return <AestheticsScreen onNext={dummyOnNext} />
      case 'recommendations':
        return <RecommendationsScreen onNext={dummyOnNext} />
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
          <button
            onClick={onNext}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Continue →
          </button>
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
        className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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

      {/* Social share modal */}
      {showSocialOptions && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-6 text-center">Share on</h4>
            <div className="flex justify-center space-x-4 mb-6">
              {(['instagram', 'twitter', 'facebook', 'tiktok', 'linkedin'] as SocialPlatform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSocialShare(p)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
                    p === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    p === 'twitter' ? 'bg-blue-500' :
                    p === 'facebook' ? 'bg-blue-600' :
                    p === 'tiktok' ? 'bg-black border border-gray-600' :
                    'bg-blue-700'
                  }`}
                >
                  {p === 'instagram' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  )}
                  {p === 'twitter' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )}
                  {p === 'facebook' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  {p === 'tiktok' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  )}
                  {p === 'linkedin' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm text-center mb-4">
              {getShareText(shareableScreens[selectedScreenIndex])}
            </p>
            <div className="text-center">
              <button
                onClick={() => setShowSocialOptions(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue button */}
      <div className="p-4 border-t border-gray-800 text-center">
        <button
          onClick={onNext}
          className="text-gray-400 hover:text-white text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
