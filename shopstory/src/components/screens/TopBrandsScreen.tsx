import {useSavedProducts} from '@shopify/shop-minis-react'

type TopBrandsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that fetches and displays top brands from saved products in a modern, visually appealing grid.
 * Features enhanced UI with gradients, animations, improved visual hierarchy, and product images from each shop.
 * Shows actual saved product images instead of shop logos for a more personal and engaging experience.
 */
export function TopBrandsScreen({onNext}: TopBrandsScreenProps) {
  const {products, loading, error} = useSavedProducts({first: 50})
  
  console.log('TopBrandsScreen render:', { products, loading, error })

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl flex items-center justify-center text-white cursor-pointer overflow-hidden relative" onClick={onNext}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="text-center z-10 p-8">
          {/* Animated loading spinner */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Discovering Your Top Brands
          </h3>
          <p className="text-purple-200 mb-8 text-lg">Analyzing your saved products...</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Skip Loading
          </button>
        </div>
      </div>
    )
  }

  if (error || !products) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 rounded-2xl flex items-center justify-center text-white cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center z-10 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Unable to Load Brands</h3>
          <p className="text-rose-100 text-lg">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // Debug: Log the products to see what we're working with
  console.log('Products from useSavedProducts:', products)
  
  // Debug: Log the first shop object to see available properties
  if (products.length > 0) {
    const firstShop = products[0].shop as any
    console.log('First shop object properties:', {
      id: firstShop.id,
      name: firstShop.name,
      logo: firstShop.logo,
      description: firstShop.description,
      followersCount: firstShop.followersCount,
      reviewAnalytics: firstShop.reviewAnalytics,
      isFollowing: firstShop.isFollowing,
      allProperties: Object.keys(firstShop)
    })
  }

  // Extract unique shops and count their occurrences, storing shop objects and sample products
  const shopCounts = products.reduce((acc, product) => {
    const shop = product.shop
    const shopId = shop.id || shop.name || 'unknown'
    
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: shop,
        count: 0,
        sampleProducts: []
      }
    }
    acc[shopId].count += 1
    // Keep up to 3 sample products for variety
    if (acc[shopId].sampleProducts.length < 3) {
      acc[shopId].sampleProducts.push(product)
    }
    return acc
  }, {} as Record<string, {shop: any, count: number, sampleProducts: any[]}>)

  // Get top 5 shops by count
  const topShops = Object.values(shopCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  console.log('Top shops with sample products:', topShops.map(({shop, count, sampleProducts}) => ({
    shopName: shop.name,
    count,
    sampleProductsCount: sampleProducts.length,
    firstProductImage: sampleProducts[0]?.featuredImage?.url,
    firstProductTitle: sampleProducts[0]?.title
  })))

  // If no shops found, show a message and allow navigation
  if (topShops.length === 0) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Top Brands
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Start saving products to discover your favorite brands and build your personalized shopping insights!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Continue Journey
          </button>
        </div>
      </div>
    )
  }

  // Define rank colors and gradients
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return {
        gradient: 'from-yellow-400 to-amber-500',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        border: 'border-yellow-200',
        shadow: 'shadow-yellow-100'
      }
      case 1: return {
        gradient: 'from-gray-300 to-gray-400',
        badge: 'bg-gradient-to-r from-gray-300 to-gray-400',
        border: 'border-gray-200',
        shadow: 'shadow-gray-100'
      }
      case 2: return {
        gradient: 'from-amber-600 to-orange-600',
        badge: 'bg-gradient-to-r from-amber-600 to-orange-600',
        border: 'border-amber-200',
        shadow: 'shadow-amber-100'
      }
      default: return {
        gradient: 'from-blue-500 to-purple-600',
        badge: 'bg-gradient-to-r from-blue-500 to-purple-600',
        border: 'border-blue-200',
        shadow: 'shadow-blue-100'
      }
    }
  }

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl p-4 overflow-y-auto cursor-pointer"
      onClick={onNext}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Your Top Brands
          </h2>
        </div>
        <p className="text-gray-600 text-sm">Based on your {products.length} saved products</p>
      </div>

      {/* Brands Grid */}
      <div className="space-y-3 mb-5">
        {topShops.map(({shop, count, sampleProducts}, index) => {
          const rankStyle = getRankStyle(index)
          const shopData = shop as any // Type assertion for extended properties
          
          return (
            <div
              key={shop.id || shop.name}
              className={`group bg-white rounded-xl p-4 border-2 ${rankStyle.border} hover:border-opacity-50 hover:shadow-lg ${rankStyle.shadow} transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden`}
            >
              {/* Background decoration for top 3 */}
              {index < 3 && (
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${rankStyle.gradient} opacity-5 rounded-full transform translate-x-12 -translate-y-12`}></div>
              )}
              
              <div className="flex items-center relative z-10">
                {/* Rank badge with crown for #1 */}
                <div className="flex-shrink-0 mr-4">
                  <div className={`relative w-10 h-10 ${rankStyle.badge} text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-md`}>
                    {index === 0 && (
                      <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 21l5.25-1.31L12 21l3.75-1.31L21 21l-2-5-2-1V9.5c0-.83-.67-1.5-1.5-1.5S14 8.67 14 9.5V10h-4v-.5C10 8.67 9.33 8 8.5 8S7 8.67 7 9.5V15l-2 1z"/>
                      </svg>
                    )}
                    #{index + 1}
                  </div>
                </div>
                
                {/* Product images from this shop */}
                <div className="flex-shrink-0 mr-4">
                  {sampleProducts.length > 0 && sampleProducts.some(p => p.featuredImage) ? (
                    <div className="relative w-14 h-14">
                      {/* Main product image */}
                      {sampleProducts[0]?.featuredImage && (
                        <img 
                          src={sampleProducts[0].featuredImage.url} 
                          alt={sampleProducts[0].featuredImage.altText || sampleProducts[0].title}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Secondary product images as small overlays */}
                      {sampleProducts.length > 1 && sampleProducts[1]?.featuredImage && (
                        <img 
                          src={sampleProducts[1].featuredImage.url} 
                          alt={sampleProducts[1].featuredImage.altText || sampleProducts[1].title}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Third product image if available */}
                      {sampleProducts.length > 2 && sampleProducts[2]?.featuredImage && (
                        <img 
                          src={sampleProducts[2].featuredImage.url} 
                          alt={sampleProducts[2].featuredImage.altText || sampleProducts[2].title}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-md object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                      <span className="text-white font-bold text-lg">
                        {shop.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Shop info with enhanced typography */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {shop.name || 'Unknown Brand'}
                    </h3>
                    {shopData.isFollowing && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-200">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Following
                      </span>
                    )}
                  </div>
                  
                  {/* Shop description */}
                  {shopData.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1 leading-relaxed">
                      {shopData.description}
                    </p>
                  )}
                  
                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-600">
                        {count} product{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {shopData.followersCount && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{shopData.followersCount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {shopData.reviewAnalytics?.averageRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="font-semibold text-gray-700">
                            {shopData.reviewAnalytics.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {shopData.reviewAnalytics.reviewCount && (
                          <span className="text-gray-500">
                            ({shopData.reviewAnalytics.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Next Button */}
      <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          Continue Your Journey
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}



