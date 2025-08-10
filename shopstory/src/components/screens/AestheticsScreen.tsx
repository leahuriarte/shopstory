import {useState, useEffect} from 'react'
import {useSavedProducts} from '@shopify/shop-minis-react'
import {geminiService, AestheticsAnalysis} from '../../services/gemini'

type AestheticsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes saved products to generate a Spotify Daylist-style
 * headline and identifies the user's top 3 style aesthetics with percentages.
 */
export function AestheticsScreen({onNext}: AestheticsScreenProps) {
  const {products, loading: productsLoading, error: productsError} = useSavedProducts({first: 15})
  const [analysis, setAnalysis] = useState<AestheticsAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Automatically start analysis when products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !hasStartedAnalysis && !isAnalyzing && !analysis) {
      startAestheticsAnalysis()
    }
  }, [products, hasStartedAnalysis, isAnalyzing, analysis])

  // Add delay before showing results
  useEffect(() => {
    if (analysis && !showResults) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 2500) // 2.5 second delay

      return () => clearTimeout(timer)
    }
    return undefined
  }, [analysis, showResults])

  const startAestheticsAnalysis = async (): Promise<void> => {
    if (!products || products.length === 0) {
      setAnalysisError('No saved products found to analyze')
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

      console.log('Starting aesthetics analysis for', productsData.length, 'products')
      
      const result = await geminiService.analyzeAesthetics(productsData)

      console.log('Aesthetics analysis result:', result)
      
      if (result.success && result.data) {
        console.log('Analysis successful - Headline:', result.data.headline)
        console.log('Top aesthetics:', result.data.topAesthetics?.map((a: any) => `${a.name} ${a.percentage}%`))
        setAnalysis(result.data)
      } else {
        console.error('Aesthetics analysis failed:', result.error)
        setAnalysisError(result.error || 'Failed to analyze aesthetics')
      }
    } catch (error) {
      console.error('Aesthetics analysis error:', error)
      setAnalysisError('An unexpected error occurred during analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white cursor-pointer" onClick={onNext}>
        <div className="text-center z-10 p-8">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Loading Your Products</h3>
          <p className="text-purple-200 text-lg">Gathering your saved items...</p>
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
          <h3 className="text-2xl font-bold mb-2">Unable to Load Products</h3>
          <p className="text-rose-100 text-lg">Click anywhere to continue</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={onNext}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="text-center z-10 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Style DNA
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Start saving products to discover your unique aesthetic DNA and style personality!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
      <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl flex items-center justify-center text-white cursor-pointer overflow-hidden relative" onClick={onNext}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="text-center z-10 p-8">
          {/* Animated aesthetic analyzer */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-indigo-900 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Analyzing Your Aesthetic DNA
          </h3>
          <p className="text-purple-200 mb-8 text-lg">Discovering your unique style personality...</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Skip Analysis
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
          <h3 className="text-2xl font-bold mb-2">Analysis Unavailable</h3>
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
        className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-purple-50 rounded-2xl p-4 overflow-y-auto cursor-pointer"
        onClick={onNext}
      >
        {/* Header with Spotify-style headline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Your Style DNA
            </h2>
          </div>
          
          {/* Spotify Daylist-style headline */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-sm font-medium mb-2 opacity-90">Your aesthetic right now</p>
            <h1 className="text-2xl font-bold leading-tight">
              {analysis.headline}
            </h1>
          </div>
          
          <p className="text-gray-600 text-sm">Based on {products.length} saved products</p>
        </div>

        {/* Top 3 Aesthetics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Your Top Aesthetics</h3>
          <div className="space-y-4">
            {analysis.topAesthetics.map((aesthetic, index) => {
              const gradients = [
                'from-purple-500 to-pink-600',
                'from-blue-500 to-purple-600', 
                'from-pink-500 to-rose-600'
              ]
              const bgColors = [
                'bg-purple-50 border-purple-200',
                'bg-blue-50 border-blue-200',
                'bg-pink-50 border-pink-200'
              ]
              
              return (
                <div key={index} className={`bg-white rounded-xl p-4 border-2 ${bgColors[index]} shadow-sm hover:shadow-md transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{aesthetic.emoji}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{aesthetic.name}</h4>
                        <p className="text-sm text-gray-600">{aesthetic.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                        {aesthetic.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${gradients[index]} transition-all duration-1000 ease-out`}
                      style={{ width: `${aesthetic.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Style Summary
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Continue Button */}
        <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold text-base hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
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
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white cursor-pointer" onClick={onNext}>
      <div className="text-center z-10 p-8">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Preparing Analysis</h3>
        <p className="text-purple-200 text-lg">Getting ready to analyze your aesthetics...</p>
      </div>
    </div>
  )
}