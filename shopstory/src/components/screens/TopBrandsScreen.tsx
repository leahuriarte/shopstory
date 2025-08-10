import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type TopBrandsScreenProps = {
  onNext: () => void
  onPrevious: () => void
}

/**
 * A screen component that fetches and displays top brands from saved products in a scrapbook style.
 * Features authentic scrapbook aesthetics with polaroid-style brand cards, handwritten notes,
 * and decorative tape elements. Shows actual saved product images for a personal touch.
 */
export function TopBrandsScreen({onNext, onPrevious}: TopBrandsScreenProps) {
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
  const {products, loading, error} = usePreloadedSavedProducts({first: 20})
  
  console.log('TopBrandsScreen render:', { products, loading, error })

  // Base scrapbook background style
  const scrapbookStyle = {
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
    boxShadow: 'inset 0 0 120px rgba(139, 69, 19, 0.1), inset 0 0 40px rgba(139, 69, 19, 0.05)',
  }

  if (loading) {
    return (
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer overflow-hidden relative" 
        onClick={handleClick}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10 p-8">
          {/* Animated loading spinner with scrapbook styling */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-amber-800/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-800 animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">
            Discovering Your Brand Obsessions
          </h3>
          <p className="text-amber-800 mb-8 text-lg">Analyzing your shopping receipts...</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/90 backdrop-blur-md border-2 border-amber-300 text-amber-800 px-8 py-3 rounded-lg hover:bg-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
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
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer overflow-hidden relative"
        onClick={handleClick}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 right-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-sm">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Brands Are Being Shy</h3>
          <p className="text-amber-800 text-lg">Tap anywhere to keep it moving</p>
        </div>
      </div>
    )
  }

  // Debug: Log the products to see what we're working with
  console.log('Products from preloaded data:', products)
  
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
        className="w-full h-full rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={handleClick}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-white border-2 border-amber-200 rounded-lg shadow-md relative p-4">
            <svg className="w-full h-full text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-amber-900">
            Your Brand Loyalty Era
          </h2>
          <p className="text-amber-800 mb-8 text-lg leading-relaxed">
            Start saving items to see which brands have your heart! We'll spill the tea on your shopping patterns ✨
          </p>
        </div>
      </div>
    )
  }

  // Define rank styling for top 3 with scrapbook aesthetics
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return {
        badgeColor: 'bg-yellow-600 border-yellow-500',
        borderColor: 'border-yellow-300',
        rotation: 'rotate-2'
      }
      case 1: return {
        badgeColor: 'bg-gray-500 border-gray-400',
        borderColor: 'border-gray-300',
        rotation: '-rotate-1'
      }
      case 2: return {
        badgeColor: 'bg-orange-600 border-orange-500',
        borderColor: 'border-orange-300',
        rotation: 'rotate-1'
      }
      default: return {
        badgeColor: 'bg-amber-600 border-amber-500',
        borderColor: 'border-amber-300',
        rotation: '-rotate-1'
      }
    }
  }

  return (
    <div
      className="w-full h-full rounded-lg p-4 overflow-y-auto cursor-pointer relative"
      onClick={handleClick}
      style={scrapbookStyle}
    >
      {/* Decorative tape pieces */}
      <div className="absolute top-2 left-3 w-8 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
      <div className="absolute top-2 right-3 w-7 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
      
      {/* Header with scrapbook styling */}
      <div className="text-center mb-5 relative z-10">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-900">
            Your Brand Hall of Fame
          </h2>
        </div>
        <p className="text-amber-800 text-sm">Based on your {products.length} saved products</p>
      </div>

      {/* Brands as scrapbook polaroid-style cards */}
      <div className="space-y-3 mb-5 relative z-10">
        {topShops.map(({shop, count, sampleProducts}, index) => {
          const rankStyle = getRankStyle(index)
          const shopData = shop as any // Type assertion for extended properties
          
          return (
            <div
              key={shop.id || shop.name}
              className={`bg-white rounded-lg p-4 border-2 ${rankStyle.borderColor} hover:border-opacity-70 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden shadow-md ${rankStyle.rotation}`}
            >
              {/* Tape corners for each card */}
              <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
              
              <div className="flex items-center relative z-10">
                {/* Rank badge with crown for #1 */}
                <div className="flex-shrink-0 mr-4">
                  <div className={`relative w-10 h-10 ${rankStyle.badgeColor} text-white text-sm font-bold rounded-lg flex items-center justify-center shadow-md border-2`}>
                    {index === 0 && (
                      <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 21l5.25-1.31L12 21l3.75-1.31L21 21l-2-5-2-1V9.5c0-.83-.67-1.5-1.5-1.5S14 8.67 14 9.5V10h-4v-.5C10 8.67 9.33 8 8.5 8S7 8.67 7 9.5V15l-2 1z"/>
                      </svg>
                    )}
                    #{index + 1}
                  </div>
                </div>
                
                {/* Product images from this shop as polaroid collage */}
                <div className="flex-shrink-0 mr-4">
                  {sampleProducts.length > 0 && sampleProducts.some(p => p.featuredImage) ? (
                    <div className="relative w-14 h-14">
                      {/* Main product image with polaroid styling */}
                      {sampleProducts[0]?.featuredImage && (
                        <div className="w-14 h-14 bg-white p-1 rounded-lg shadow-md border border-amber-200">
                          <img 
                            src={sampleProducts[0].featuredImage.url} 
                            alt={sampleProducts[0].featuredImage.altText || sampleProducts[0].title}
                            className="w-full h-full rounded-md object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Secondary product images as small polaroids */}
                      {sampleProducts.length > 1 && sampleProducts[1]?.featuredImage && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white p-0.5 rounded-md shadow-sm border border-amber-200">
                          <img 
                            src={sampleProducts[1].featuredImage.url} 
                            alt={sampleProducts[1].featuredImage.altText || sampleProducts[1].title}
                            className="w-full h-full rounded-sm object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Third product image if available */}
                      {sampleProducts.length > 2 && sampleProducts[2]?.featuredImage && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white p-0.5 rounded-md shadow-sm border border-amber-200">
                          <img 
                            src={sampleProducts[2].featuredImage.url} 
                            alt={sampleProducts[2].featuredImage.altText || sampleProducts[2].title}
                            className="w-full h-full rounded-sm object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-white p-2 rounded-lg shadow-md border border-amber-200 flex items-center justify-center">
                      <span className="text-amber-700 font-bold text-lg">
                        {shop.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Shop info with handwritten note styling */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-amber-900 truncate pr-2 hover:text-amber-700 transition-colors">
                      {shop.name || 'Unknown Brand'}
                    </h3>
                    {shopData.isFollowing && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium border border-amber-300">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Following
                      </span>
                    )}
                  </div>
                  
                  {/* Shop description */}
                  {shopData.description && (
                    <p className="text-amber-700 text-xs mb-2 line-clamp-1 leading-relaxed">
                      {shopData.description}
                    </p>
                  )}
                  
                  {/* Stats row with scrapbook styling */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                      <span className="font-semibold text-amber-800">
                        {count} product{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {shopData.followersCount && (
                      <div className="flex items-center gap-2 text-amber-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{shopData.followersCount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {shopData.reviewAnalytics?.averageRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="font-semibold text-amber-800">
                            {shopData.reviewAnalytics.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {shopData.reviewAnalytics.reviewCount && (
                          <span className="text-amber-700">
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

    </div>
  )
}