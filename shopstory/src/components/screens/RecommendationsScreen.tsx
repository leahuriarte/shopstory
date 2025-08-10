import {useState, useEffect} from 'react'
import {useRecommendedProducts, ProductCard} from '@shopify/shop-minis-react'
import {geminiService, RecommendationsAnalysis} from '../../services/gemini'

type RecommendationsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes recommended products to generate a Spotify Daylist-style
 * headline and displays product recommendations to match the user's future self.
 */
export function RecommendationsScreen({onNext}: RecommendationsScreenProps) {
  const {products, loading: productsLoading, error: productsError} = useRecommendedProducts({first: 12})
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

  const handleFavoriteToggled = (productId: string, isFavorited: boolean) => {
    console.log('Favorite toggled:', productId, isFavorited)
  }

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl flex items-center justify-center text-white cursor-pointer" onClick={onNext}>
        <div className="text-center z-10 p-8">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Loading Recommendations</h3>
          <p className="text-emerald-200 text-lg">Finding your future style...</p>
        </div>
      </div>
    )
  }

  // Error state for products
  if (productsError || !products) {
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
          <h3 className="text-2xl font-bold mb-2">Unable to Load Recommendations</h3>
          <p className="text-rose-100 text-lg">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Your Future Style
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            No recommendations available right now. Keep exploring to discover your future style evolution!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Continue Journey
          </button>
        </div>
      </div>
    )
  }

  // Analyzing state
  if (isAnalyzing) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-emerald-900 to-teal-900 rounded-2xl flex items-center justify-center text-white cursor-pointer overflow-hidden relative" onClick={onNext}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="text-center z-10 p-8">
          {/* Animated crystal ball */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-indigo-900 flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Predicting Your Future Style
          </h3>
          <p className="text-emerald-200 mb-8 text-lg">Reading the style crystal ball...</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
        className="w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-white cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center z-10 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Prediction Unavailable</h3>
          <p className="text-rose-100 text-lg mb-4">{analysisError}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300 font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Results state
  if (analysis && showResults) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-emerald-50 rounded-2xl p-4 overflow-y-auto cursor-pointer"
        onClick={onNext}
      >
        {/* Header with future style headline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🔮</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Your Future Style
            </h2>
          </div>
          
          {/* Spotify Daylist-style headline for future self */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-4 text-white shadow-lg">
            <p className="text-sm font-medium mb-2 opacity-90">Your style evolution</p>
            <h1 className="text-2xl font-bold leading-tight">
              {analysis.headline}
            </h1>
          </div>
          
          {/* Future self description */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-2">To match your future self</h3>
            <p className="text-emerald-700 text-sm leading-relaxed">{analysis.futureSelfdescription}</p>
          </div>
          
          <p className="text-gray-600 text-sm">Based on {products.length} curated recommendations</p>
        </div>

        {/* Product Recommendations Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Recommended for You</h3>
          <div 
            className="grid grid-cols-2 gap-4"
            onClick={e => e.stopPropagation()}
          >
            {products.slice(0, 8).map(product => (
              <div key={product.id} className="hover:scale-105 transition-transform duration-200">
                <ProductCard 
                  product={product} 
                  onFavoriteToggled={handleFavoriteToggled}
                />
              </div>
            ))}
          </div>
          
          {products.length > 8 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                +{products.length - 8} more recommendations waiting for you
              </p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-base hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
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

  // Default loading state while waiting for analysis to start
  return (
    <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl flex items-center justify-center text-white cursor-pointer" onClick={onNext}>
      <div className="text-center z-10 p-8">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Preparing Predictions</h3>
        <p className="text-emerald-200 text-lg">Getting ready to see your future style...</p>
      </div>
    </div>
  )
}