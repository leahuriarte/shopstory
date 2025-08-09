import React from 'react'
import type { Product } from '../../types/story'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  const handleAddToCart = () => {
    onAddToCart?.(product)
  }

  const hasImage = product.images && product.images.length > 0 && product.images[0]?.url
  const imageUrl = hasImage ? product.images[0].url : null
  const altText = hasImage ? (product.images[0].altText || product.title) : product.title

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // If image fails to load, hide it and show placeholder
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const placeholder = target.nextElementSibling as HTMLElement
              if (placeholder) {
                placeholder.style.display = 'flex'
              }
            }}
          />
        ) : null}
        
        {/* Placeholder for missing/failed images */}
        <div 
          className={`w-full h-full flex items-center justify-center bg-gray-100 ${imageUrl ? 'hidden' : 'flex'}`}
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <svg 
              className="w-12 h-12 text-gray-400 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs text-gray-500">No image</p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        {product.vendor && (
          <p className="text-xs text-gray-500 mb-2">
            {product.vendor}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {product.price.currencyCode === 'USD' ? '$' : product.price.currencyCode + ' '}
            {product.price.amount}
          </span>
          
          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="text-xs bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}