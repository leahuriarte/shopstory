import {usePopularProducts, ProductCard} from '@shopify/shop-minis-react'

type PopularProductsScreenProps = {
  onNext: () => void
  onPrevious: () => void
}

/**
 * A screen component that fetches and displays popular products in a grid.
 * It handles its own loading and error states.
 */
export function PopularProductsScreen({onNext, onPrevious}: PopularProductsScreenProps) {
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
  const {products, loading, error} = usePopularProducts({first: 6})

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-white">
        <p>Loading what's trending rn...</p>
      </div>
    )
  }

  if (error || !products) {
    return (
      <div
        className="w-full h-full bg-red-900 rounded-lg flex items-center justify-center text-white cursor-pointer"
        onClick={handleClick}
      >
        <p>That's not very popular of us. Tap to continue.</p>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full bg-white rounded-lg p-4 overflow-y-auto cursor-pointer"
      onClick={handleClick}
    >
      <h2 className="text-xl font-bold mb-4 text-center">What's Trending</h2>
      <div 
        className="grid grid-cols-2 gap-4"
        onClick={e => e.stopPropagation()}
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Next
      </button>
    </div>
  )
}