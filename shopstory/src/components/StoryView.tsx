import {useState} from 'react'
import {StoryScreen} from './StoryScreen'

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

// A screen can be one of the types we've defined.
export type Screen = TitleScreenData | ColorScreenData | PopularProductsScreenData | CarbonFootprintScreenData | TopBrandsScreenData

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

  const currentStory = stories[currentStoryIndex]

  const handleNext = () => {
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
            const isCarbonFootprint = isCurrentScreen && screen.type === 'carbonFootprint'
            
            return (
              <div key={index} className="flex-1 h-1 bg-gray-600 mx-0.5 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    index < currentScreenIndex ? 'bg-white' : 'bg-transparent'
                  } ${isCurrentScreen ? 'bg-white animate-progress' : ''}`}
                  style={{
                    animationDuration: isCarbonFootprint ? '4.7s' : '5s', // 4.7s = 3.5s delay + 1.2s fade-in
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