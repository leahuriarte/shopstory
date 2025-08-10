import {ColorScreenData} from '../StoryView'

type ColorScreenProps = {
  onNext: () => void
  screen: ColorScreenData
}

/**
 * Renders a simple screen with a solid background color and text.
 */
export function ColorScreen({onNext, screen}: ColorScreenProps) {
  return (
    <div
      className={`w-full h-full rounded-lg flex items-center justify-center text-white text-2xl font-bold text-center p-4 cursor-pointer ${screen.value}`}
      onClick={onNext}
    >
      <p>{screen.text}</p>
    </div>
  )
}