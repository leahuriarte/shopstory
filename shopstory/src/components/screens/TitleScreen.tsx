import {
  useSavedProducts,
  Product,
  ProductImage,
} from '@shopify/shop-minis-react'
import {TitleScreenData} from '../StoryView'

type TitleScreenProps = {
  onNext: () => void
  screen: TitleScreenData
}

/**
 * A title screen with a background image, titles, and animated product images
 * that slide across the screen.
 */
export function TitleScreen({onNext, screen}: TitleScreenProps) {
  // Fetch the user's saved products to display as animations.
  const {products, loading, error} = useSavedProducts({first: 5})

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

      {/* Title and Subtitle */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">ShopStory</h1>
        <p className="text-xl font-light mt-2">Your Life Unboxed</p>
      </div>
    </>
  )

  return (
    <div
      className="w-full h-full rounded-lg flex items-center justify-center text-white cursor-pointer relative overflow-hidden"
      onClick={onNext}
    >
      {/* Background Image */}
      <img
        src={screen.imageUrl}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Handle loading and error states */}
      {loading ? (
        <p>Loading saved items...</p>
      ) : error ? (
        <p className="text-center text-red-400">
          Could not load saved items.
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
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(calc(100vw + 100%));
          }
        }
        .animate-slide-${index} {
          animation: slide ${animationDuration}s linear ${animationDelay}s infinite;
        }
      `}</style>
      <div
        className={`absolute w-24 h-24 animate-slide-${index}`}
        style={{top: topPosition, left: '-24rem'}} // Start off-screen
      >
        <img
          src={product.featuredImage.url}
          alt={product.featuredImage.altText || product.title}
          className="w-full h-full object-cover rounded-lg shadow-2xl"
        />
      </div>
    </>
  )
}