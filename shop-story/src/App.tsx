import {usePopularProducts, ProductCard} from '@shopify/shop-minis-react'
import { RealisticBook } from './RealisticBook'
import { shopWrappedPages } from './bookData'

export function App() {
  const {products} = usePopularProducts()

  return (
    <div className="pt-6 px-4 pb-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Your 2024 Shop Wrapped
      </h1>
      <p className="text-xs text-purple-600 mb-6 text-center bg-purple-50 py-2 px-4 rounded border border-purple-200">
        📖 Click pages or corners to flip like a real book!
      </p>
      
      {/* Realistic Book with Page Flipping */}
      <div className="mb-6">
        <RealisticBook pages={shopWrappedPages} />
      </div>
    </div>
  )
}
