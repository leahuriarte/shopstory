import React, { useState } from 'react'
import type { ShoppableSet, PurchaseOption } from '../../types/commerce'
import type { Product } from '../../types/story'

interface ShoppableSetCardProps {
  shoppableSet: ShoppableSet
  onAddToCart: (product: Product) => void
  onBuyBundle: (option: PurchaseOption) => void
  onShare: () => void
  className?: string
}

export const ShoppableSetCard: React.FC<ShoppableSetCardProps> = ({
  shoppableSet,
  onAddToCart,
  onBuyBundle,
  onShare,
  className = ''
}) => {
  const [selectedOption, setSelectedOption] = useState<PurchaseOption | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  
  const { productSet, displayConfig, purchaseOptions } = shoppableSet
  const { products, insight, urgencyLevel, completionStatus, savings, expiresAt } = productSet

  // Determine how many products to show initially
  const maxProducts = displayConfig.maxProducts || 4
  const visibleProducts = showAllProducts ? products : products.slice(0, maxProducts)
  const hasMoreProducts = products.length > maxProducts

  // Get the best purchase option (bundle with highest savings)
  const bestOption = purchaseOptions
    .filter(opt => opt.available)
    .sort((a, b) => (b.savings || 0) - (a.savings || 0))[0]

  // Calculate urgency styling
  const urgencyStyles = {
    low: 'border-gray-200 bg-gray-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-red-200 bg-red-50'
  }

  const urgencyTextStyles = {
    low: 'text-gray-600',
    medium: 'text-yellow-700',
    high: 'text-red-700'
  }

  // Format expiration time
  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
    return 'Ending soon'
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with insight and urgency */}
      <div className={`p-4 border-l-4 ${urgencyStyles[urgencyLevel]}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {productSet.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{insight}</p>
            
            {/* Completion status bar */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionStatus * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(completionStatus * 100)}% complete
              </span>
            </div>
          </div>
          
          {/* Share button */}
          <button
            onClick={onShare}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Share set"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

        {/* Urgency indicator */}
        {(urgencyLevel === 'high' || expiresAt) && (
          <div className={`flex items-center gap-1 ${urgencyTextStyles[urgencyLevel]}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">
              {expiresAt ? formatTimeRemaining(expiresAt) : 'Limited time'}
            </span>
          </div>
        )}
      </div>

      {/* Product grid */}
      <div className="p-4">
        <div className={`grid gap-3 ${
          displayConfig.layout === 'grid' 
            ? 'grid-cols-2' 
            : displayConfig.layout === 'carousel' 
              ? 'grid-cols-1' 
              : 'grid-cols-1'
        }`}>
          {visibleProducts.map((product, index) => (
            <div key={product.id} className="group relative">
              {/* Product image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                {product.images[0]?.url ? (
                  <>
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const placeholder = target.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'flex'
                        }
                      }}
                    />
                    <div className="w-full h-full hidden items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.title}
                </h4>
                {product.vendor && (
                  <p className="text-xs text-gray-500">{product.vendor}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    ${product.price.amount}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show more products button */}
        {hasMoreProducts && !showAllProducts && (
          <button
            onClick={() => setShowAllProducts(true)}
            className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Show {products.length - maxProducts} more items
          </button>
        )}
      </div>

      {/* Purchase options */}
      {displayConfig.showPricing && purchaseOptions.length > 0 && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-3">
            {/* Bundle option highlight */}
            {bestOption && bestOption.type === 'bundle' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">
                    Bundle & Save
                  </span>
                  {displayConfig.showSavings && bestOption.savings && (
                    <span className="text-sm font-semibold text-green-700">
                      Save ${bestOption.savings.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-green-900">
                      ${bestOption.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      {bestOption.description}
                    </span>
                  </div>
                  <button
                    onClick={() => onBuyBundle(bestOption)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Buy Bundle
                  </button>
                </div>
              </div>
            )}

            {/* Other purchase options */}
            <div className="space-y-2">
              {purchaseOptions
                .filter(opt => opt !== bestOption && opt.available)
                .map((option, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        ${option.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {option.description}
                      </span>
                    </div>
                    <button
                      onClick={() => onBuyBundle(option)}
                      className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      {option.type === 'subscription' ? 'Subscribe' : 'Buy'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete the set CTA */}
      {completionStatus < 1 && (
        <div className="border-t border-gray-100 p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Complete your collection
              </p>
              <p className="text-xs text-blue-700">
                Add {Math.ceil((1 - completionStatus) * products.length)} more items to complete the look
              </p>
            </div>
            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              Explore
            </button>
          </div>
        </div>
      )}
    </div>
  )
}