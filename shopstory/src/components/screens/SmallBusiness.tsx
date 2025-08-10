import {useState, useEffect} from 'react'
import {geminiService, SmallBusinessAnalysis} from '../../services/gemini'
import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type SmallBusinessScreenProps = {
  onNext: () => void
  onPrevious: () => void
}

/**
 * A screen component that analyzes saved products to identify small businesses
 * and displays merchant cards for small businesses the user has purchased from most.
 * Now styled with authentic scrapbook theme to match TitleScreen.
 */
export function SmallBusinessScreen({onNext, onPrevious}: SmallBusinessScreenProps) {
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
  const {products, loading, error} = usePreloadedSavedProducts({first: 10})
  const [analysis, setAnalysis] = useState<SmallBusinessAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Analyze businesses when products are loaded
  useEffect(() => {
    if (!loading && !error && products && products.length > 0 && !analysis && !analyzing) {
      analyzeBusinesses()
    }
  }, [products, loading, error, analysis, analyzing])

  const analyzeBusinesses = async () => {
    if (!products) return

    setAnalyzing(true)
    setAnalysisError(null)

    try {
      // Extract unique shops and count their occurrences, storing shop objects and sample products
      const shopCounts = products.reduce((acc, product) => {
        const shop = product.shop
        const shopId = shop.id || shop.name || 'unknown'
        
        // Debug: Log shop properties to understand what's available
        if (!acc[shopId]) {
          console.log('Shop object for small business analysis:', {
            id: shop.id,
            name: shop.name,
            logo: (shop as any).logo,
            description: (shop as any).description,
            allProperties: Object.keys(shop)
          })
        }
        
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

      // Prepare business data for analysis
      const businesses = Object.values(shopCounts).map(({shop, count}) => ({
        id: shop.id || shop.name || 'unknown',
        name: shop.name || 'Unknown Business',
        description: (shop as any).description || '',
        followersCount: (shop as any).followersCount || 0,
        reviewCount: (shop as any).reviewAnalytics?.reviewCount || 0,
        purchaseCount: count,
      }))

      console.log('Analyzing businesses:', businesses)

      const result = await geminiService.analyzeSmallBusinesses(businesses)
      
      if (result.success && result.data) {
        setAnalysis(result.data)
      } else {
        setAnalysisError(result.error || 'Failed to analyze businesses')
      }
    } catch (error) {
      console.error('Error analyzing businesses:', error)
      setAnalysisError('An error occurred while analyzing businesses')
    } finally {
      setAnalyzing(false)
    }
  }

  // Base scrapbook background style (matching TitleScreen)
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

  // Loading state
  if (loading || analyzing) {
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
            {loading ? 'Loading Your Shopping Receipts' : 'Finding Your Small Biz Supports'}
          </h3>
          <p className="text-amber-800 mb-8 text-lg">
            {loading ? 'Gathering your shopping evidence...' : 'AI is checking which brands are small biz...'}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/90 backdrop-blur-md border-2 border-amber-300 text-amber-800 px-8 py-3 rounded-lg hover:bg-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Skip Analysis
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (error || analysisError) {
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
          <h3 className="text-2xl font-bold mb-2 text-amber-600">That's Not Very Small Biz of Us</h3>
          <p className="text-amber-700 text-lg mb-6">
            {error ? 'Your items are being shy rn' : `The small biz detector broke: ${analysisError}`}
          </p>
          <p className="text-amber-600">Tap anywhere to keep it moving</p>
        </div>
      </div>
    )
  }

  // No products state
  if (!products || products.length === 0) {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7 3v2m8-2v2M7 7h8m-8 4h8m-8 4h8" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-amber-900">
            Support Small Businesses
          </h2>
          <p className="text-amber-800 mb-8 text-lg leading-relaxed">
            Start saving products to discover which businesses are small and local, and see how your purchases can make a difference!
          </p>
        </div>
      </div>
    )
  }

  // Extract shop counts for small businesses
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

  // Get small businesses from analysis, sorted by purchase count
  const smallBusinessShops = analysis?.smallBusinesses
    ?.filter(business => business.isSmallBusiness)
    ?.map(business => {
      const shopData = Object.values(shopCounts).find(
        ({shop}) => (shop.id || shop.name) === business.businessId
      )
      return {
        ...business,
        shop: shopData?.shop,
        purchaseCount: shopData?.count || 0,
        sampleProducts: shopData?.sampleProducts || []
      }
    })
    ?.filter(business => business.shop) // Only include businesses where we found shop data
    ?.sort((a, b) => b.purchaseCount - a.purchaseCount) || []

  console.log('Small business shops:', smallBusinessShops)

  // Function to determine shop genre from sample products
  const getShopGenre = (sampleProducts: any[]): string => {
    if (!sampleProducts || sampleProducts.length === 0) return 'Small Business'
    
    // Collect all product types and titles
    const productInfo = sampleProducts.map(product => ({
      title: product.title?.toLowerCase() || '',
      type: (product as any).productType || (product as any).category || (product as any).type || '',
      description: (product as any).description?.toLowerCase() || ''
    }))
    
    // Analyze common themes
    const allText = productInfo.map(p => `${p.title} ${p.type} ${p.description}`).join(' ').toLowerCase()
    
    // Electronics & Tech
    if (allText.includes('phone') || allText.includes('electronics') || allText.includes('tech') || 
        allText.includes('computer') || allText.includes('headphone') || allText.includes('speaker')) {
      return 'Electronics'
    }
    
    // Fashion & Clothing
    if (allText.includes('clothing') || allText.includes('fashion') || allText.includes('shirt') || 
        allText.includes('dress') || allText.includes('shoes') || allText.includes('apparel')) {
      return 'Fashion'
    }
    
    // Home & Living
    if (allText.includes('home') || allText.includes('furniture') || allText.includes('decor') || 
        allText.includes('kitchen') || allText.includes('living') || allText.includes('house')) {
      return 'Home & Living'
    }
    
    // Beauty & Personal Care
    if (allText.includes('beauty') || allText.includes('skincare') || allText.includes('cosmetic') || 
        allText.includes('makeup') || allText.includes('care') || allText.includes('health')) {
      return 'Beauty & Care'
    }
    
    // Food & Beverage
    if (allText.includes('food') || allText.includes('drink') || allText.includes('beverage') || 
        allText.includes('coffee') || allText.includes('tea') || allText.includes('snack')) {
      return 'Food & Drink'
    }
    
    // Sports & Fitness
    if (allText.includes('sport') || allText.includes('fitness') || allText.includes('gym') || 
        allText.includes('exercise') || allText.includes('workout') || allText.includes('athletic')) {
      return 'Sports & Fitness'
    }
    
    // Arts & Crafts
    if (allText.includes('art') || allText.includes('craft') || allText.includes('handmade') || 
        allText.includes('creative') || allText.includes('design') || allText.includes('artisan')) {
      return 'Arts & Crafts'
    }
    
    // Books & Media
    if (allText.includes('book') || allText.includes('media') || allText.includes('magazine') || 
        allText.includes('reading') || allText.includes('literature')) {
      return 'Books & Media'
    }
    
    // Fallback to Small Business if no clear category
    return 'Small Business'
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
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7 3v2m8-2v2M7 7h8m-8 4h8m-8 4h8" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-900">
            Your Small Biz Era
          </h2>
        </div>
        {analysis && (
          <p className="text-amber-800 text-sm">
            {analysis.smallBusinessCount} of {analysis.totalBusinesses} businesses
          </p>
        )}
      </div>

      {smallBusinessShops.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-white border-2 border-amber-200 rounded-lg shadow-md relative p-4">
            <svg className="w-full h-full text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7 3v2m8-2v2M7 7h8m-8 4h8m-8 4h8" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h3 className="text-xl font-semibold text-amber-700 mb-2">No Small Biz Vibes Detected</h3>
          <p className="text-amber-500">
            Time to support some local legends and small business queens!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Small Business Cards in TopBrands style */}
          <div className="space-y-6 mb-5 relative z-10">
            {smallBusinessShops.slice(0, 5).map((business, index) => {
              const shop = business.shop
              const sampleProducts = business.sampleProducts || []
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1']
              const rotation = rotations[index % rotations.length]
              const shopGenre = getShopGenre(sampleProducts)
              
              return (
                <div
                  key={business.businessId}
                  className={`bg-white rounded-lg p-5 border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden shadow-md ${rotation}`}
                >
                  {/* Tape corners for each card */}
                  <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  
                  <div className="flex items-start relative z-10">
                    {/* Product images from this shop as polaroid collage (only show if available) */}
                    {sampleProducts.length > 0 && sampleProducts.some(p => p.featuredImage) && (
                      <div className="flex-shrink-0 mr-4">
                        <div className="relative w-16 h-16">
                          {/* Main product image with polaroid styling */}
                          {sampleProducts[0]?.featuredImage && (
                            <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-md border border-green-200">
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
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white p-0.5 rounded-md shadow-sm border border-green-200">
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
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white p-0.5 rounded-md shadow-sm border border-green-200">
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
                      </div>
                    )}
                    
                    {/* Shop info with enhanced styling to fill the space */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-xl text-amber-900 hover:text-amber-700 transition-colors leading-tight flex-1 pr-2">
                            {shop.name || 'Unknown Business'}
                          </h3>
                          
                          {/* Genre Badge - positioned to prevent cutoff */}
                          <div className="flex-shrink-0 ml-2">
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium border border-green-200 whitespace-nowrap">
                              {shopGenre}
                            </div>
                          </div>
                        </div>
                        
                        {/* Shop description with more space */}
                        {(shop as any).description && (
                          <p className="text-amber-700 text-sm mb-3 leading-relaxed">
                            {(shop as any).description}
                          </p>
                        )}
                        
                        {/* Enhanced stats row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            <span className="font-semibold text-amber-800">
                              {business.purchaseCount} product{business.purchaseCount !== 1 ? 's' : ''} purchased
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-amber-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{business.employeeEstimate || 1} employee{(business.employeeEstimate || 1) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Note if more businesses exist */}
          {smallBusinessShops.length > 5 && (
            <div className="bg-white rounded-lg p-4 border-2 border-green-200 mb-4 relative transform rotate-1 shadow-md">
              {/* Tape corners */}
              <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
              
              <p className="text-sm text-amber-800 text-center">
                +{smallBusinessShops.length - 5} more small businesses you support 💚
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}