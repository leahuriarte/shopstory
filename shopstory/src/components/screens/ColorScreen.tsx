import {ColorScreenData} from '../StoryView'

type ColorScreenProps = {
  onNext: () => void
  onPrevious: () => void
  screen: ColorScreenData
}

/**
 * Renders a simple screen with a solid background color and text.
 */
export function ColorScreen({onNext, onPrevious, screen}: ColorScreenProps) {
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

  return (
    <div
      className={`w-full h-full rounded-lg flex items-center justify-center text-white text-2xl font-bold text-center p-4 cursor-pointer ${screen.value}`}
      onClick={handleClick}
    >
      <p>{screen.text}</p>
    </div>
  )
}