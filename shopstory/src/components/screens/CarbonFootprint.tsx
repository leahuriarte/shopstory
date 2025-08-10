import {useState, useEffect} from 'react'
import {ProductCard} from '@shopify/shop-minis-react'
import {geminiService, CarbonFootprintAnalysis} from '../../services/gemini'
import {usePreloadedSavedProducts, usePreloadedData} from '../../contexts/DataContext'

type CarbonFootprintScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes the carbon footprint of saved products
 * using Gemini LLM integration. Shows total emissions and eco-friendly rankings.
 * Now styled with scrapbook theme and green environmental accents.
 */
export function CarbonFootprintScreen({onNext}: CarbonFootprintScreenProps) {
  const {products, loading: productsLoading, error: productsError} = usePreloadedSavedProducts({first: 20})
  const {getAnalysisCache, setAnalysisCache} = usePreloadedData()
  
  const [analysis, setAnalysis] = useState<CarbonFootprintAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Check for cached results first, then start analysis when products are loaded
  useEffect(() => {
    const cachedAnalysis = getAnalysisCache('carbonFootprint')
    if (cachedAnalysis) {
      setAnalysis(cachedAnalysis)
      setShowResults(true)
      return
    }
    
    if (products && products.length > 0 && !hasStartedAnalysis && !isAnalyzing && !analysis) {
      startAnalysis()
    }
  }, [products, hasStartedAnalysis, isAnalyzing, analysis, getAnalysisCache])

  // Add delay before showing results
  useEffect(() => {
    if (analysis && !showResults) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 3500) // 3.5 second delay

      return () => clearTimeout(timer)
    }
    return undefined
  }, [analysis, showResults])

  const startAnalysis = async () => {
    if (!products || products.length === 0) {
      setAnalysisError('No saved products found to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setHasStartedAnalysis(true)

    try {
      const productsData = products.map(product => {
        // Debug: Log the actual product structure
        console.log('Product structure:', JSON.stringify(product, null, 2))
        
        // Extract data more carefully from the Shopify product
        const title = product.title || 'Unknown Product'
        const description = (product as any).description || 
                           (product as any).excerpt || 
                           (product as any).summary || 
                           ''
        const vendor = (product as any).vendor || 
                      product.shop?.name || 
                      'Unknown Vendor'
        const productType = (product as any).productType || 
                           (product as any).category || 
                           (product as any).type ||
                           'Unknown Type'

        return {
          id: product.id,
          title: title,
          description: description,
          vendor: vendor,
          productType: productType,
        }
      })

      console.log('Processed products data:', productsData)

      const result = await geminiService.analyzeCarbonFootprint(productsData)

      if (result.success && result.data) {
        setAnalysis(result.data)
        setAnalysisCache('carbonFootprint', result.data)
      } else {
        setAnalysisError(result.error || 'Failed to analyze carbon footprint')
      }
    } catch (error) {
      setAnalysisError('An unexpected error occurred during analysis')
      console.error('Analysis error:', error)
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
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10">
          <p className="text-lg mb-4">🌱</p>
          <p className="text-amber-900 font-semibold">Loading your saved products...</p>
        </div>
      </div>
    )
  }

  // Error state for products
  if (productsError || !products) {
    return (
      <div
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer p-4 relative overflow-hidden"
        onClick={onNext}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 right-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10">
          <p className="text-lg mb-2">⚠️</p>
          <p className="text-amber-900 font-semibold">Error loading saved products.</p>
          <p className="text-sm mt-2 text-amber-800">Click to continue.</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
    return (
      <div
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer p-4 relative overflow-hidden"
        onClick={onNext}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-white border-2 border-green-300 rounded-lg shadow-md relative p-4">
            <span className="text-3xl">📦</span>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <p className="text-amber-900 font-semibold">No saved products found.</p>
          <p className="text-sm mt-2 text-amber-800">Save some products first, then check your carbon footprint!</p>
          <p className="text-xs mt-4 text-amber-700">Click to continue.</p>
        </div>
      </div>
    )
  }

  // Show loading while starting analysis
  if (!hasStartedAnalysis && products && products.length > 0) {
    return (
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 relative" 
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10">
          <div className="animate-spin text-3xl mb-4">🌍</div>
          <p className="text-lg font-semibold text-amber-900">Starting Carbon Footprint Analysis...</p>
          <p className="text-sm text-amber-800 mt-2">Analyzing {products.length} saved products</p>
        </div>
      </div>
    )
  }

  // Analysis loading state OR waiting to show results
  if (isAnalyzing || (analysis && !showResults)) {
    return (
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 relative" 
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10">
          <div className="animate-spin text-3xl mb-4">🌍</div>
          <p className="text-lg font-semibold text-amber-900">Analyzing Carbon Footprint...</p>
          <p className="text-sm text-amber-800 mt-2">
            {isAnalyzing ? 'Processing your saved products...' : 'Finalizing analysis...'}
          </p>
        </div>
      </div>
    )
  }

  // Analysis results with scrapbook styling and green accents
  if (analysis && showResults) {
    return (
      <div
        className="w-full h-full rounded-lg p-4 overflow-y-auto cursor-pointer relative"
        onClick={onNext}
        style={{
          ...scrapbookStyle,
          animation: 'fadeIn 1.2s ease-in-out forwards',
          opacity: 0,
        }}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-2 left-3 w-8 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-2 right-3 w-7 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center mb-6 relative z-10">
          <p className="text-3xl mb-2">🌱</p>
          <h2 className="text-xl font-bold text-amber-900">Carbon Footprint Analysis</h2>
        </div>

        {/* Total Emissions as a scrapbook card with green accents */}
        <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4 relative shadow-md transform -rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <h3 className="font-semibold text-green-800 mb-2">Total Emissions</h3>
          <p className="text-2xl font-bold text-green-900">
            {analysis.totalEmissionsKgCO2.toFixed(2)} kg CO₂
          </p>
          <p className="text-sm text-green-700">
            Average: {analysis.averageEmissionsPerProduct.toFixed(2)} kg CO₂ per product
          </p>
        </div>

        {/* Analysis as a scrapbook note */}
        <div className="bg-white border-2 border-green-200 rounded-lg p-4 mb-4 relative shadow-md transform rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <h3 className="font-semibold text-green-800 mb-2">Analysis</h3>
          <ul className="space-y-1">
            {analysis.analysis.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).map((sentence, index) => (
              <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>{sentence.trim()}.</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Eco-Friendly Products as polaroid-style cards */}
        <div className="mb-4 relative z-10">
          <h3 className="font-semibold text-amber-900 mb-3">🏆 Most Eco-Friendly Purchases</h3>
          <div className="space-y-3">
            {analysis.lowestEmissionProducts.map((product, index) => {
              const originalProduct = products.find(p => p.id === product.productId)
              const rotations = ['rotate-2', '-rotate-1', 'rotate-1']
              const rotation = rotations[index] || 'rotate-0'
              
              return (
                <div key={product.productId} className={`bg-white border-2 border-green-200 rounded-lg p-4 relative shadow-md ${rotation}`}>
                  {/* Tape corners */}
                  <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  
                  <div className="flex items-center gap-4">
                    <span className="bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-full flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        {originalProduct && (
                          <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-amber-50 border border-amber-200">
                            <div className="transform scale-[0.4] origin-top-left w-[200px] h-[200px]">
                              <ProductCard product={originalProduct} />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-amber-900 text-base truncate">{product.productTitle}</p>
                          <p className="text-base text-green-600 font-bold mt-1">
                            {product.estimatedEmissionsKgCO2.toFixed(2)} kg CO₂
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommendations as a handwritten note */}
        <div className="bg-white border-2 border-green-200 rounded-lg p-4 mb-4 relative shadow-md transform -rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <h3 className="font-semibold text-green-800 mb-2">💡 Recommendations</h3>
          <ul className="space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Continue Button with scrapbook styling */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-green-600 shadow-md relative z-10"
        >
          Continue
        </button>
      </div>
    )
  }

  // Error state for analysis
  if (analysisError) {
    return (
      <div 
        className="w-full h-full rounded-lg p-4 flex flex-col justify-center items-center text-amber-900 relative" 
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 right-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <p className="text-2xl mb-4">⚠️</p>
        <p className="text-lg font-semibold mb-2 text-amber-900">Analysis Failed</p>
        <p className="text-sm text-center mb-4 text-amber-800">{analysisError}</p>
        <div className="space-y-2 w-full max-w-xs">
          <button
            onClick={() => {
              setAnalysisError(null)
              setHasStartedAnalysis(false)
            }}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-amber-600"
          >
            Try Again
          </button>
          <button
            onClick={onNext}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-amber-500"
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {null}
    </>
  )
}