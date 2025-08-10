import {
  Product,
} from '@shopify/shop-minis-react'
import {TitleScreenData} from '../StoryView'
import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type TitleScreenProps = {
  onNext: () => void
  onPrevious: () => void
  screen: TitleScreenData
}

/**
 * A title screen with scrapbook paper background, original Tailwind styling,
 * and animated product images that slide across the screen.
 */
export function TitleScreen({onNext, onPrevious}: TitleScreenProps) {
  // Use preloaded saved products for animations
  const {products, loading, error} = usePreloadedSavedProducts({first: 5})

  // Base component structure
  const renderContent = () => (
    <>
      {/* Sliding Product Images - only render if not loading, no error, and products exist */}
      {!loading &&
        !error &&
        products &&
        products.map((product, index) => (
          <AnimatedProduct key={product.id} product={product} index={index} />
        ))}

      {/* Title and Subtitle - brown text for scrapbook aesthetic */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-amber-900 drop-shadow-sm">ShopStory</h1>
        <p className="text-xl font-light mt-2 text-amber-800">Your Style, Unboxed</p>
      </div>
    </>
  )

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
      className="w-full h-full rounded-lg flex items-center justify-center text-gray-800 cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      style={{
        // Beautiful scrapbook paper background
        background: `
          radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.03) 1px, transparent 1px),
          radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.02) 1px, transparent 1px),
          radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 69, 19, 0.01) 50%, transparent 50%),
          linear-gradient(180deg, rgba(139, 69, 19, 0.01) 50%, transparent 50%),
          linear-gradient(135deg, 
            #faf5f0 0%, 
            #f7f1ea 25%,
            #f5ede4 50%,
            #f3e9de 75%,
            #f1e5d8 100%
          )
        `,
        backgroundSize: '40px 40px, 60px 60px, 30px 30px, 8px 8px, 12px 12px, 100% 100%',
        // Add some aged paper effect
        boxShadow: 'inset 0 0 120px rgba(139, 69, 19, 0.1), inset 0 0 40px rgba(139, 69, 19, 0.05)',
      }}
    >

      {/* Decorative tape pieces in corners */}
      <div 
        className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-gray-300 shadow-sm transform -rotate-12 z-20"
        style={{ borderRadius: '1px' }}
      />
      
      <div 
        className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-gray-300 shadow-sm transform rotate-12 z-20"
        style={{ borderRadius: '1px' }}
      />

      <div 
        className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-gray-300 shadow-sm transform rotate-6 z-20"
        style={{ borderRadius: '1px' }}
      />

      {/* Handle loading and error states */}
      {loading ? (
        <div className="relative z-10 text-center">
          <div className="text-5xl font-extrabold tracking-tight text-amber-900 drop-shadow-sm mb-2">ShopStory</div>
          <p className="text-xl font-light text-amber-800">Curating your vibe...</p>
        </div>
      ) : error ? (
        <p className="relative z-10 text-center text-red-600">
          Oops, your items are being shy rn.
        </p>
      ) : (
        renderContent()
      )}
    </div>
  )
}

/**
 * A component to render a single product image with a sliding animation.
 * The animation properties (duration, delay, vertical position) are staggered
 * based on the component's index.
 */
function AnimatedProduct({product, index}: {product: Product; index: number}) {
  // Array of vertical positions for a more staggered "up and down" look.
  const topPositions = ['15%', '65%', '40%', '75%', '5%']
  const topPosition = topPositions[index % topPositions.length]

  // Faster animation start times and slightly varied durations.
  const animationDuration = 6 + index * 1 // e.g., 6s, 7s, 8s...
  const animationDelay = index * 0.2 // e.g., 0s, 0.2s, 0.4s...

  // Use the featuredImage property, which is of type ProductImage.
  if (!product.featuredImage) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(-200px);
          }
          100% {
            transform: translateX(calc(100vw + 200px));
          }
        }
        .animate-slide-${index} {
          animation: slide ${animationDuration}s linear ${animationDelay}s infinite;
        }
      `}</style>
      <div
        className={`absolute w-24 h-24 animate-slide-${index}`}
        style={{top: topPosition, left: '-200px'}} // Start further off-screen
      >
        {/* Scrapbook photo styling with Tailwind */}
        <div className="relative w-full h-full bg-white p-1 rounded-sm shadow-lg border border-gray-200">
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            className="w-full h-full object-cover rounded-sm"
          />
          
          {/* Tape corners with Tailwind */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-gray-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-gray-300 transform -rotate-12 z-10" />
        </div>
      </div>
    </>
  )
}