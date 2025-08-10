import {useState, useEffect} from 'react'
import {ProductCard} from '@shopify/shop-minis-react'
import {geminiService, RecommendationsAnalysis} from '../../services/gemini'
import {usePreloadedRecommendedProducts} from '../../contexts/DataContext'

type RecommendationsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes recommended products to generate a Spotify Daylist-style
 * headline and displays product recommendations to match the user's future self.
 * Now styled with scrapbook theme to match TitleScreen.
 */
export function RecommendationsScreen({onNext}: RecommendationsScreenProps) {
  const {products, loading: productsLoading, error: productsError} = usePreloadedRecommendedProducts({first: 12})

  const [analysis, setAnalysis] = useState<RecommendationsAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Automatically start analysis when products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !hasStartedAnalysis && !isAnalyzing && !analysis) {
      startRecommendationsAnalysis()
    }
  }, [products, hasStartedAnalysis, isAnalyzing, analysis])

  // Add delay before showing results
  useEffect(() => {
    if (analysis && !showResults) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 2000) // 2 second delay

      return () => clearTimeout(timer)
    }
    return undefined
  }, [analysis, showResults])

  const startRecommendationsAnalysis = async (): Promise<void> => {
    if (!products || products.length === 0) {
      setAnalysisError('No recommended products found to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setHasStartedAnalysis(true)

    try {
      // Prepare product data for analysis
      const productsData = products.map(product => ({
        id: product.id,
        title: product.title,
        description: (product as any).description || '',
        vendor: (product as any).vendor || '',
        productType: (product as any).productType || '',
        imageUrl: product.featuredImage?.url || '',
      }))

      console.log('Starting recommendations analysis for', productsData.length, 'products')
      
      const result = await geminiService.analyzeRecommendations(productsData)

      console.log('Recommendations analysis result:', result)
      
      if (result.success && result.data) {
        console.log('Analysis successful - Headline:', result.data.headline)
        console.log('Future self description:', result.data.futureSelfdescription)
        setAnalysis(result.data)
      } else {
        console.error('Recommendations analysis failed:', result.error)
        setAnalysisError(result.error || 'Failed to analyze recommendations')
      }
    } catch (error) {
      console.error('Recommendations analysis error:', error)
      setAnalysisError('An unexpected error occurred during analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFavoriteToggled = (isFavorited: boolean) => {
    console.log('Favorite toggled:', isFavorited)
  }

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

  // Loading state for products
  if (productsLoading) {
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
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-amber-800/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-800 animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Loading Recommendations</h3>
          <p className="text-amber-800 text-lg">Finding your future style...</p>
        </div>
      </div>
    )
  }

  // Error state for products
  if (productsError || !products) {
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Unable to Load Recommendations</h3>
          <p className="text-amber-800 text-lg">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-amber-900">
            Your Future Style
          </h2>
          <p className="text-amber-800 mb-8 text-lg leading-relaxed">
            No recommendations available right now. Keep exploring to discover your future style evolution!
          </p>
        </div>
      </div>
    )
  }

  // Analyzing state
  if (isAnalyzing) {
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
          {/* Animated crystal ball with scrapbook styling */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-white border-4 border-amber-300 shadow-md animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">
            Predicting Your Future Style
          </h3>
          <p className="text-amber-800 mb-8 text-lg">Reading the style crystal ball...</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/90 backdrop-blur-md border-2 border-amber-300 text-amber-800 px-8 py-3 rounded-lg hover:bg-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Skip Prediction
          </button>
        </div>
      </div>
    )
  }

  // Analysis error state
  if (analysisError) {
    return (
      <div
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer overflow-hidden relative"
        onClick={onNext}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-md">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Prediction Unavailable</h3>
          <p className="text-amber-800 text-lg mb-4">{analysisError}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/90 backdrop-blur-md border-2 border-amber-300 text-amber-800 px-6 py-3 rounded-lg hover:bg-white transition-all duration-300 font-semibold shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Results state with scrapbook styling
  if (analysis && showResults) {
    return (
      <div
        className="w-full h-full rounded-lg p-4 overflow-y-auto cursor-pointer relative"
        onClick={onNext}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-2 left-3 w-8 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-2 right-3 w-7 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />

        {/* Header with future style headline */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🔮</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-900">
              Your Future Style
            </h2>
          </div>
          
          {/* Spotify Daylist-style headline as a scrapbook note */}
          <div className="bg-white rounded-lg p-6 mb-4 text-amber-900 shadow-lg border-2 border-emerald-200 relative transform -rotate-1">
            {/* Tape corners for the note */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
            
            <p className="text-sm font-medium mb-2 text-emerald-700">Your style evolution</p>
            <h1 className="text-2xl font-bold leading-tight text-amber-900">
              {analysis.headline}
            </h1>
          </div>
          
          {/* Future self description as handwritten note */}
          <div className="bg-white rounded-lg p-4 border-2 border-emerald-200 mb-6 relative transform rotate-1 shadow-md">
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
            
            <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              To match your future self
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed">{analysis.futureSelfdescription}</p>
          </div>
          
          <p className="text-amber-700 text-sm">Based on {products.length} curated recommendations</p>
        </div>

        {/* Product Recommendations as polaroid grid */}
        <div className="mb-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-center text-amber-900">Recommended for You</h3>
          <div 
            className="grid grid-cols-2 gap-4"
            onClick={e => e.stopPropagation()}
          >
            {products.slice(0, 8).map((product, index) => {
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2']
              const rotation = rotations[index % rotations.length]
              
              return (
                <div key={product.id} className={`bg-white p-2 rounded-lg border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${rotation} relative`}>
                  {/* Tape corners for each product card */}
                  <div className="absolute -top-1 -right-1 w-3 h-1.5 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-1.5 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  
                  <div className="transform scale-90 origin-center">
                    <ProductCard 
                      product={product} 
                      onFavoriteToggled={handleFavoriteToggled}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {products.length > 8 && (
            <div className="bg-white rounded-lg p-3 border-2 border-amber-200 mt-4 relative transform -rotate-1 shadow-md">
              {/* Tape corners */}
              <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
              <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
              
              <p className="text-sm text-amber-800 text-center">
                +{products.length - 8} more recommendations waiting for you
              </p>
            </div>
          )}
        </div>

      </div>
    )
  }

  // Default loading state while waiting for analysis to start
  return (
    <div 
      className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer relative" 
      onClick={onNext}
      style={scrapbookStyle}
    >
      {/* Decorative tape pieces */}
      <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
      <div className="absolute bottom-5 right-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
      
      <div className="text-center z-10 p-8">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-amber-800/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-800 animate-spin"></div>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-amber-900">Preparing Predictions</h3>
        <p className="text-amber-800 text-lg">Getting ready to see your future style...</p>
      </div>
    </div>
  )
}