import {useState} from 'react'
import {StoryScreen} from './StoryScreen'
import {usePreloadedData} from '../contexts/DataContext'

// Define the shape of our different screen types.
export type ColorScreenData = {
  type: 'color'
  value: string
  text: string
}

export type PopularProductsScreenData = {
  type: 'popularProducts'
}

export type TitleScreenData = {
  type: 'title'
  imageUrl: string
}


export type CarbonFootprintScreenData = {
  type: 'carbonFootprint'
}

export type TopBrandsScreenData = {
  type: 'topBrands'
}

export type PaletteScreenData = {
  type: 'palette'
}

export type SmallBusinessScreenData = {
  type: 'smallBusiness'
}

export type ShippingTimeScreenData = {
  type: 'shippingTime'
}

export type AestheticsScreenData = {
  type: 'aesthetics'
}
export type RecommendationsScreenData = {
  type: 'recommendations'
}

export type ShareScreenData = {
  type: 'share'
}

// A screen can be one of the types we've defined.
export type Screen = TitleScreenData | ColorScreenData | PopularProductsScreenData | CarbonFootprintScreenData | TopBrandsScreenData | PaletteScreenData | SmallBusinessScreenData | ShippingTimeScreenData | AestheticsScreenData | RecommendationsScreenData | ShareScreenData

// A story is an array of these screen types.
type Story = {
  id: string
  screens: Screen[]
}

type StoryViewProps = {
  stories: Story[]
}

/**
 * Manages the state and navigation for the story-style interface.
 */
export function StoryView({stories}: StoryViewProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)
  const {isDataReady} = usePreloadedData()

  const currentStory = stories[currentStoryIndex]

  const handleNext = () => {
    // Don't allow navigation from title screen until data is ready
    if (currentScreenIndex === 0 && currentStory.screens[0].type === 'title' && !isDataReady) {
      return
    }
    if (currentScreenIndex < currentStory.screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1)
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setCurrentScreenIndex(0)
    } else {
      setCurrentStoryIndex(0)
      setCurrentScreenIndex(0)
    }
  }

  if (!currentStory) {
    return null
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md h-full flex flex-col items-center justify-center p-4">
        <div className="flex w-full mb-2">
          {currentStory.screens.map((screen, index) => {
            const isCurrentScreen = index === currentScreenIndex
            const isShareScreen = isCurrentScreen && screen.type === 'share'
            
            return (
              <div key={index} className="flex-1 h-1 bg-gray-600 mx-0.5 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    index < currentScreenIndex ? 'bg-white' : 'bg-transparent'
                  } ${isCurrentScreen && !isShareScreen ? 'bg-white animate-progress' : ''} ${isShareScreen ? 'bg-white' : ''}`}
                  style={{
                    animationDuration: isShareScreen ? '0s' : '5s', // No animation for share screen
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                  }}
                />
              </div>
            )
          })}
        </div>
        <StoryScreen
          onNext={handleNext}
          screen={currentStory.screens[currentScreenIndex]}
          allScreens={currentStory.screens}
        />
      </div>
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation-name: progress;
        }
      `}</style>
    </div>
  )
}