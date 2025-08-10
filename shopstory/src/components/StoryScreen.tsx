type StoryScreenProps = {
  onNext: () => void
}

/**
 * Represents a single screen in a story.
 * This component is a placeholder that displays a message and can be clicked
 * to navigate to the next screen.
 */
export function StoryScreen({onNext}: StoryScreenProps) {
  return (
    <div
      className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-white cursor-pointer"
      onClick={onNext}
    >
      <p>Story Screen - Click to advance</p>
    </div>
  )
}