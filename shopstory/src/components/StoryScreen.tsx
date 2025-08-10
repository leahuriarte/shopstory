import {ColorScreen} from './screens/ColorScreen'
import {PopularProductsScreen} from './screens/PopularProductsScreen'
import {Screen} from './StoryView'

type StoryScreenProps = {
  onNext: () => void
  screen: Screen
}

/**
 * This component is the "router" for our screens. It checks the screen's `type`
 * and renders the correct component.
 */
export function StoryScreen({onNext, screen}: StoryScreenProps) {
  if (!screen) {
    return null
  }

  switch (screen.type) {
    case 'color':
      return <ColorScreen onNext={onNext} screen={screen} />
    case 'popularProducts':
      return <PopularProductsScreen onNext={onNext} />
    default:
      return (
        <div
          className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-white"
          onClick={onNext}
        >
          Unknown screen type
        </div>
      )
  }
}