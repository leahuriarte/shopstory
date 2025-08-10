import {ColorScreen} from './screens/ColorScreen'
import {PopularProductsScreen} from './screens/PopularProductsScreen'
import {TitleScreen} from './screens/TitleScreen'
import {CarbonFootprintScreen} from './screens/CarbonFootprint'
import {TopBrandsScreen} from './screens/TopBrandsScreen'
import {PaletteScreen} from './screens/Palette'
import {SmallBusinessScreen} from './screens/SmallBusiness'
import {ShippingTimeScreen} from './screens/ShippingTime'
import {AestheticsScreen} from './screens/AestheticsScreen'
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
    case 'title':
      return <TitleScreen onNext={onNext} screen={screen} />
    case 'color':
      return <ColorScreen onNext={onNext} screen={screen} />
    case 'popularProducts':
      return <PopularProductsScreen onNext={onNext} />
    case 'carbonFootprint':
      return <CarbonFootprintScreen onNext={onNext} />
    case 'topBrands':
      return <TopBrandsScreen onNext={onNext} />
    case 'palette':
      return <PaletteScreen onNext={onNext} />
    case 'smallBusiness':
      return <SmallBusinessScreen onNext={onNext} />
    case 'shippingTime':
      return <ShippingTimeScreen onNext={onNext} />
    case 'aesthetics':
      return <AestheticsScreen onNext={onNext} />
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

