import {useState, useEffect} from 'react'
import {useSavedProducts} from '@shopify/shop-minis-react'
import {falAIService, SmallBusinessAnalysis} from '../../services/falai'

type SmallBusinessScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes saved products to identify small businesses
 * and displays merchant cards for small businesses the user has purchased from most.
 */
export function SmallBusinessScreen({onNext}: SmallBusinessScreenProps) {
  const {products, loading, error} = useSavedProducts({first: 50})
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
      // Extract unique shops and count their occurrences
      const shopCounts = products.reduce((acc, product) => {
        const shop = product.shop
        const shopId = shop.id || shop.name || 'unknown'
        
        if (!acc[shopId]) {
          acc[shopId] = {
            shop: shop,
            count: 0
          }
        }
        acc[shopId].count += 1
        return acc
      }, {} as Record<string, {shop: any, count: number}>)

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

      const result = await falAIService.analyzeSmallBusinesses(businesses)
      
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

  // Loading state
  if (loading || analyzing) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-gray-800 cursor-pointer overflow-hidden relative" onClick={onNext}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10"></div>
        <div className="text-center z-10 p-8">
          {/* Animated loading spinner */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {loading ? 'Loading Your Purchases' : 'Analyzing Small Businesses'}
          </h3>
          <p className="text-green-700 mb-8 text-lg">
            {loading ? 'Getting your saved products...' : 'Using AI to identify small businesses...'}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-green-500/10 backdrop-blur-md border border-green-200 text-green-700 px-8 py-3 rounded-full hover:bg-green-500/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
        className="w-full h-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl flex items-center justify-center text-gray-800 cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/10"></div>
        <div className="text-center z-10 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-red-600">Analysis Error</h3>
          <p className="text-red-700 text-lg mb-6">
            {error ? 'Unable to load products' : analysisError}
          </p>
          <p className="text-gray-600">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // No products state
  if (!products || products.length === 0) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10"></div>
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7 3v2m8-2v2M7 7h8m-8 4h8m-8 4h8" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Support Small Businesses
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Start saving products to discover which businesses are small and local, and see how your purchases can make a difference!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Continue Journey
          </button>
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
        count: 0
      }
    }
    acc[shopId].count += 1
    return acc
  }, {} as Record<string, {shop: any, count: number}>)

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
        purchaseCount: shopData?.count || 0
      }
    })
    ?.filter(business => business.shop) // Only include businesses where we found shop data
    ?.sort((a, b) => b.purchaseCount - a.purchaseCount) || []

  console.log('Small business shops:', smallBusinessShops)

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 flex flex-col cursor-pointer"
      onClick={onNext}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
          Small Businesses You Support
        </h2>
        {analysis && (
          <p className="text-green-600 font-medium">
            {analysis.smallBusinessCount} of {analysis.totalBusinesses} businesses
          </p>
        )}
      </div>

      {smallBusinessShops.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M7 3v2m8-2v2M7 7h8m-8 4h8m-8 4h8" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Small Businesses Found</h3>
          <p className="text-gray-500">
            Start exploring local businesses to make an impact!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Grid of Tilted Small Business Cards */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 p-2">
            {smallBusinessShops.slice(0, 4).map((business, index) => {
              const shop = business.shop
              const rotations = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2']
              const rotation = rotations[index % rotations.length]
              
              return (
                <div
                  key={business.businessId}
                  className={`bg-white rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${rotation} relative`}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                  }}
                >
                  {/* Small Business Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      Small
                    </div>
                  </div>
                  
                  {/* Shop logo - Larger and more prominent */}
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      {(shop as any).logoUrl || (shop as any).logo ? (
                        <img 
                          src={(shop as any).logoUrl || (shop as any).logo} 
                          alt={`${shop.name} logo`}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-green-100 shadow-sm bg-white"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm border-2 border-green-100 ${((shop as any).logoUrl || (shop as any).logo) ? 'hidden' : ''}`}>
                        <span className="text-white font-bold text-xl">
                          {shop.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      
                      {/* Fallback background for broken images */}
                      <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl -z-10"></div>
                    </div>
                  </div>
                  
                  {/* Shop info */}
                  <div className="text-center">
                    <h3 className="font-bold text-sm text-gray-900 mb-2 leading-tight">
                      {shop.name || 'Unknown Business'}
                    </h3>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs text-blue-600 font-medium">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {business.purchaseCount} purchase{business.purchaseCount !== 1 ? 's' : ''}
                      </div>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                        👥
                        {business.employeeEstimate || 1} employee{(business.employeeEstimate || 1) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Footer */}
          {smallBusinessShops.length > 4 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-700 font-medium">
                +{smallBusinessShops.length - 4} more small businesses
              </p>
            </div>
          )}
        </div>
      )}

      {/* Continue Button */}
      <div className="mt-6">
        <div 
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          <span>Continue Journey</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  )
}