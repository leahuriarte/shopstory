import {useState, useEffect} from 'react'
import {useSavedProducts, ProductCard} from '@shopify/shop-minis-react'
import {falAIService, CarbonFootprintAnalysis} from '../../services/falai'

type CarbonFootprintScreenProps = {
  onNext: () => void
}

/**
 * A screen component that analyzes the carbon footprint of saved products
 * using Fal.ai LLM integration. Shows total emissions and eco-friendly rankings.
 */
export function CarbonFootprintScreen({onNext}: CarbonFootprintScreenProps) {
  const {products, loading: productsLoading, error: productsError} = useSavedProducts()
  const [analysis, setAnalysis] = useState<CarbonFootprintAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Automatically start analysis when products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !hasStartedAnalysis && !isAnalyzing && !analysis) {
      startAnalysis()
    }
  }, [products, hasStartedAnalysis, isAnalyzing, analysis])

  // Add delay before showing results
  useEffect(() => {
    if (analysis && !showResults) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 3500) // 3.5 second delay

      return () => clearTimeout(timer)
    }
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
      const productsData = products.map(product => ({
        id: product.id,
        title: product.title,
        description: (product as any).description || '',
        vendor: (product as any).vendor || '',
        productType: (product as any).productType || '',
      }))

      const result = await falAIService.analyzeCarbonFootprint(productsData)

      if (result.success && result.data) {
        setAnalysis(result.data)
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

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="w-full h-full bg-green-900 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg">🌱</p>
          <p>Loading your saved products...</p>
        </div>
      </div>
    )
  }

  // Error state for products
  if (productsError || !products) {
    return (
      <div
        className="w-full h-full bg-red-900 rounded-lg flex items-center justify-center text-white cursor-pointer p-4"
        onClick={onNext}
      >
        <div className="text-center">
          <p className="text-lg mb-2">⚠️</p>
          <p>Error loading saved products.</p>
          <p className="text-sm mt-2">Click to continue.</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
    return (
      <div
        className="w-full h-full bg-blue-900 rounded-lg flex items-center justify-center text-white cursor-pointer p-4"
        onClick={onNext}
      >
        <div className="text-center">
          <p className="text-lg mb-2">📦</p>
          <p>No saved products found.</p>
          <p className="text-sm mt-2">Save some products first, then check your carbon footprint!</p>
          <p className="text-xs mt-4">Click to continue.</p>
        </div>
      </div>
    )
  }

  // Show loading while starting analysis (this will quickly transition to the main loading state)
  if (!hasStartedAnalysis && products && products.length > 0) {
    return (
      <div className="w-full h-full bg-green-800 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-4">🌍</div>
          <p className="text-lg">Starting Carbon Footprint Analysis...</p>
          <p className="text-sm opacity-80 mt-2">Analyzing {products.length} saved products</p>
        </div>
      </div>
    )
  }

  // Analysis loading state OR waiting to show results
  if (isAnalyzing || (analysis && !showResults)) {
    return (
      <div className="w-full h-full bg-green-800 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-4">🌍</div>
          <p className="text-lg">Analyzing Carbon Footprint...</p>
          <p className="text-sm opacity-80 mt-2">
            {isAnalyzing ? 'Processing your saved products...' : 'Finalizing analysis...'}
          </p>
        </div>
      </div>
    )
  }

  // Analysis results (only show after delay)
  if (analysis && showResults) {
    return (
      <div
        className="w-full h-full bg-white rounded-lg p-4 overflow-y-auto animate-fade-in cursor-pointer"
        onClick={onNext}
        style={{
          animation: 'fadeIn 1.2s ease-in-out forwards',
          opacity: 0,
        }}
      >
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🌱</p>
          <h2 className="text-xl font-bold text-gray-800">Carbon Footprint Analysis</h2>
        </div>

        {/* Total Emissions */}
        <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-green-800 mb-2">Total Emissions</h3>
          <p className="text-2xl font-bold text-green-900">
            {analysis.totalEmissionsKgCO2.toFixed(2)} kg CO₂
          </p>
          <p className="text-sm text-green-700">
            Average: {analysis.averageEmissionsPerProduct.toFixed(2)} kg CO₂ per product
          </p>
        </div>

        {/* Analysis */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">Analysis</h3>
          <p className="text-sm text-gray-700">{analysis.analysis}</p>
        </div>

        {/* Top Eco-Friendly Products */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">🏆 Most Eco-Friendly Purchases</h3>
          <div className="space-y-3">
            {analysis.lowestEmissionProducts.map((product, index) => {
              const originalProduct = products.find(p => p.id === product.productId)
              return (
                <div key={product.productId} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-2 rounded-full flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        {originalProduct && (
                          <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-gray-100">
                            <div className="transform scale-[0.4] origin-top-left w-[200px] h-[200px]">
                              <ProductCard product={originalProduct} />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-base truncate">{product.productTitle}</p>
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

        {/* Recommendations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Recommendations</h3>
          <ul className="space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  // Error state for analysis
  if (analysisError) {
    return (
      <div className="w-full h-full bg-red-800 rounded-lg p-4 flex flex-col justify-center items-center text-white">
        <p className="text-2xl mb-4">⚠️</p>
        <p className="text-lg font-semibold mb-2">Analysis Failed</p>
        <p className="text-sm text-center mb-4">{analysisError}</p>
        <div className="space-y-2 w-full max-w-xs">
          <button
            onClick={() => {
              setAnalysisError(null)
              setHasStartedAnalysis(false)
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onNext}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
