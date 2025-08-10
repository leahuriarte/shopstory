import {ColorScreen} from './screens/ColorScreen'
import {PopularProductsScreen} from './screens/PopularProductsScreen'
import {TitleScreen} from './screens/TitleScreen'
import {CarbonFootprintScreen} from './screens/CarbonFootprint'
import {TopBrandsScreen} from './screens/TopBrandsScreen'
import {PaletteScreen} from './screens/Palette'
import {SmallBusinessScreen} from './screens/SmallBusiness'
import {ShippingTimeScreen} from './screens/ShippingTime'
import {AestheticsScreen} from './screens/AestheticsScreen'
import {RecommendationsScreen} from './screens/RecommendationsScreen'
import {ShareScreen} from './screens/ShareScreen'
import {Screen} from './StoryView'

type StoryScreenProps = {
  onNext: () => void
  onPrevious: () => void
  screen: Screen
  allScreens?: Screen[]
}

/**
 * This component is the "router" for our screens. It checks the screen's `type`
 * and renders the correct component.
 */
export function StoryScreen({onNext, onPrevious, screen, allScreens}: StoryScreenProps) {
  if (!screen) {
    return null
  }

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

  switch (screen.type) {
    case 'title':
      return <TitleScreen onNext={onNext} onPrevious={onPrevious} screen={screen} />
    case 'color':
      return <ColorScreen onNext={onNext} onPrevious={onPrevious} screen={screen} />
    case 'popularProducts':
      return <PopularProductsScreen onNext={onNext} onPrevious={onPrevious} />
    case 'carbonFootprint':
      return <CarbonFootprintScreen onNext={onNext} onPrevious={onPrevious} />
    case 'topBrands':
      return <TopBrandsScreen onNext={onNext} onPrevious={onPrevious} />
    case 'palette':
      return <PaletteScreen onNext={onNext} onPrevious={onPrevious} />
    case 'smallBusiness':
      return <SmallBusinessScreen onNext={onNext} onPrevious={onPrevious} />
    case 'shippingTime':
      return <ShippingTimeScreen onNext={onNext} onPrevious={onPrevious} />
    case 'aesthetics':
      return <AestheticsScreen onNext={onNext} onPrevious={onPrevious} />
    case 'recommendations':
      return <RecommendationsScreen onNext={onNext} onPrevious={onPrevious} />
    case 'share':
      return <ShareScreen onNext={onNext} onPrevious={onPrevious} allScreens={allScreens} />
    default:
      return (
        <div
          className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-white"
          onClick={handleClick}
        >
          Unknown screen type
        </div>
      )
  }
}

