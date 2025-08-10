import {useState, useEffect} from 'react'
import {geminiService, SmallBusinessAnalysis} from '../../services/gemini'
import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type SmallBusinessScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes saved products to identify small businesses
 * and displays merchant cards for small businesses the user has purchased from most.
 * Now styled with authentic scrapbook theme to match TitleScreen.
 */
export function SmallBusinessScreen({onNext}: SmallBusinessScreenProps) {
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
        onClick={onNext}
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
            {loading ? 'Loading Your Purchases' : 'Analyzing Small Businesses'}
          </h3>
          <p className="text-amber-800 mb-8 text-lg">
            {loading ? 'Getting your saved products...' : 'Using AI to identify small businesses...'}
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
        onClick={onNext}
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
          <h3 className="text-2xl font-bold mb-2 text-amber-600">Analysis Error</h3>
          <p className="text-amber-700 text-lg mb-6">
            {error ? 'Unable to load products' : analysisError}
          </p>
          <p className="text-amber-600">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // No products state
  if (!products || products.length === 0) {
    return (
      <div
        className="w-full h-full rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={onNext}
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-amber-800 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-amber-700"
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
      className="w-full h-full rounded-lg p-4 overflow-y-auto cursor-pointer relative"
      onClick={onNext}
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
            Small Businesses You Support
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
          <h3 className="text-xl font-semibold text-amber-700 mb-2">No Small Businesses Found</h3>
          <p className="text-amber-500">
            Start exploring local businesses to make an impact!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Grid of Polaroid-style Small Business Cards */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 p-2 mb-6">
            {smallBusinessShops.slice(0, 4).map((business, index) => {
              const rotations = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2']
              const rotation = rotations[index % rotations.length]
              const shop = business.shop
              
              return (
                <div
                  key={business.businessId}
                  className={`bg-white rounded-lg p-4 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${rotation} relative`}
                >
                  {/* Tape corners for each polaroid */}
                  <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  
                  {/* Small Business Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border border-green-500">
                      Small
                    </div>
                  </div>
                  
                  {/* Shop logo with polaroid styling */}
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      {(shop as any).logoUrl || (shop as any).logo ? (
                        <img 
                          src={(shop as any).logoUrl || (shop as any).logo} 
                          alt={`${shop.name} logo`}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-amber-100 shadow-sm bg-white p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 bg-white border-2 border-amber-200 rounded-lg flex items-center justify-center shadow-sm p-1 ${((shop as any).logoUrl || (shop as any).logo) ? 'hidden' : ''}`}>
                        <span className="text-amber-700 font-bold text-xl">
                          {shop.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shop info with handwritten note styling */}
                  <div className="text-center">
                    <h3 className="font-bold text-sm text-amber-900 mb-2 leading-tight">
                      {shop.name || 'Unknown Business'}
                    </h3>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-xs text-green-700 font-medium">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        {business.purchaseCount} purchase{business.purchaseCount !== 1 ? 's' : ''}
                      </div>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-amber-700">
                        👥
                        {business.employeeEstimate || 1} employee{(business.employeeEstimate || 1) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Note as handwritten scrapbook note */}
          {smallBusinessShops.length > 4 && (
            <div className="bg-white rounded-lg p-4 border-2 border-amber-200 mb-4 relative transform rotate-1 shadow-md">
              {/* Tape corners */}
              <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
              
              <p className="text-sm text-amber-800 text-center">
                +{smallBusinessShops.length - 4} more small businesses you support
              </p>
            </div>
          )}
        </div>
      )}

      {/* Continue Button with scrapbook styling */}
      <div className="sticky bottom-0 pt-4 relative z-10" style={{
        background: 'linear-gradient(to top, #faf5f0 0%, #faf5f0 70%, transparent 100%)'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="w-full bg-amber-800 text-white py-3 rounded-lg font-semibold text-base hover:bg-amber-900 transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group border border-amber-700"
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