import {useState} from 'react'
import {StoryScreen} from './StoryScreen'

// The props for the StoryView component.
// It takes an array of stories, where each story has an array of screens.
type StoryViewProps = {
  stories: {
    id: string
    screens: object[]
  }[]
}

/**
 * A component that displays a series of stories in a style similar to Instagram Stories.
 * It manages the currently active story and screen, allowing users to navigate
 * through the stories by clicking on the screens.
 */
export function StoryView({stories}: StoryViewProps) {
  // State to keep track of the currently active story and screen index.
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)

  // Retrieves the current story based on the currentStoryIndex.
  const currentStory = stories[currentStoryIndex]

  /**
   * Handles the navigation to the next screen or story.
   * If there are more screens in the current story, it moves to the next screen.
   * If it's the last screen of the current story, it moves to the next story.
   * If it's the last screen of the last story, it loops back to the beginning.
   */
  const handleNext = () => {
    if (currentScreenIndex < currentStory.screens.length - 1) {
      // Go to the next screen in the same story.
      setCurrentScreenIndex(currentScreenIndex + 1)
    } else if (currentStoryIndex < stories.length - 1) {
      // Go to the next story.
      setCurrentStoryIndex(currentStoryIndex + 1)
      setCurrentScreenIndex(0) // Reset screen index for the new story.
    } else {
      // Loop back to the first story and screen.
      setCurrentStoryIndex(0)
      setCurrentScreenIndex(0)
    }
  }

  // If there are no stories, render nothing.
  if (!currentStory) {
    return null
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md h-full flex flex-col items-center justify-center p-4">
        {/* Progress bars to indicate the current screen within the story */}
        <div className="flex w-full mb-2">
          {currentStory.screens.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-gray-600 mx-0.5 rounded-full">
              <div
                className={`h-full rounded-full ${
                  index < currentScreenIndex ? 'bg-white' : 'bg-transparent'
                } ${index === currentScreenIndex ? 'bg-white animate-progress' : ''}`}
                style={{
                  animationDuration: '5s',
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
              />
            </div>
          ))}
        </div>
        {/* Render the current screen */}
        <StoryScreen onNext={handleNext} />
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