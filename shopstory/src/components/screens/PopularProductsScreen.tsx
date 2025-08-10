import {usePopularProducts, ProductCard} from '@shopify/shop-minis-react'

type PopularProductsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that fetches and displays popular products in a grid.
 * It handles its own loading and error states.
 */
export function PopularProductsScreen({onNext}: PopularProductsScreenProps) {
  const {products, loading, error} = usePopularProducts({first: 6})

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-white">
        <p>Loading popular products...</p>
      </div>
    )
  }

  if (error || !products) {
    return (
      <div
        className="w-full h-full bg-red-900 rounded-lg flex items-center justify-center text-white cursor-pointer"
        onClick={onNext}
      >
        <p>Error loading products. Click to continue.</p>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full bg-white rounded-lg p-4 overflow-y-auto cursor-pointer"
      onClick={onNext}
    >
      <h2 className="text-xl font-bold mb-4 text-center">Popular Products</h2>
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