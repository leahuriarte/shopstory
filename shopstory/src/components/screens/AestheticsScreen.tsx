import {useState, useEffect} from 'react'
import {geminiService, AestheticsAnalysis} from '../../services/gemini'
import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type AestheticsScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes saved products to generate a Spotify Daylist-style
 * headline and identifies the user's top 3 style aesthetics with percentages.
 * Now styled with scrapbook theme to match TitleScreen.
 */
export function AestheticsScreen({onNext}: AestheticsScreenProps) {
  const {products, loading: productsLoading, error: productsError} = usePreloadedSavedProducts({first: 15})

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
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer relative overflow-hidden" 
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Loading Your Products</h3>
          <p className="text-amber-800 text-lg">Gathering your saved items...</p>
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Unable to Load Products</h3>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-amber-900">
            Your Style DNA
          </h2>
          <p className="text-amber-800 mb-8 text-lg leading-relaxed">
            Start saving products to discover your unique aesthetic DNA and style personality!
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
          {/* Animated aesthetic analyzer with scrapbook styling */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-white border-4 border-amber-300 shadow-md animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">
            Analyzing Your Aesthetic DNA
          </h3>
          <p className="text-amber-800 mb-8 text-lg">Discovering your unique style personality...</p>
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Analysis Unavailable</h3>
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
        
        {/* Header with scrapbook styling */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-900">
              Your Style DNA
            </h2>
          </div>
          
          {/* Spotify Daylist-style headline as a scrapbook note */}
          <div className="bg-white rounded-lg p-6 mb-6 text-amber-900 shadow-lg border-2 border-amber-200 relative transform -rotate-1">
            {/* Tape corners for the note */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
            
            <p className="text-sm font-medium mb-2 text-amber-700">Your aesthetic right now</p>
            <h1 className="text-2xl font-bold leading-tight text-amber-900">
              {analysis.headline}
            </h1>
          </div>
          
        </div>

        {/* Top 3 Aesthetics as polaroid-style cards */}
        <div className="mb-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-center text-amber-900">Your Top Aesthetics</h3>
          <div className="space-y-4">
            {analysis.topAesthetics.map((aesthetic, index) => {
              const rotations = ['rotate-2', '-rotate-1', 'rotate-1']
              const rotation = rotations[index] || 'rotate-0'
              
              return (
                <div key={index} className={`bg-white rounded-lg p-4 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 relative ${rotation}`}>
                  {/* Tape corners */}
                  <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{aesthetic.emoji}</span>
                      <div>
                        <h4 className="font-bold text-amber-900 text-lg">{aesthetic.name}</h4>
                        <p className="text-sm text-amber-800">{aesthetic.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-800">
                        {aesthetic.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar with scrapbook styling */}
                  <div className="w-full bg-amber-100 rounded-full h-2 border border-amber-200">
                    <div 
                      className="h-2 rounded-full bg-amber-600 transition-all duration-1000 ease-out"
                      style={{ width: `${aesthetic.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
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
        <h3 className="text-2xl font-bold mb-2 text-amber-900">Preparing Analysis</h3>
        <p className="text-amber-800 text-lg">Getting ready to analyze your aesthetics...</p>
      </div>
    </div>
  )
}