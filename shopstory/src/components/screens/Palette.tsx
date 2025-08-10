import {useState, useEffect} from 'react'
import {useSavedProducts} from '@shopify/shop-minis-react'
import {geminiService} from '../../services/gemini'

type PaletteScreenProps = {
  onNext: () => void
}

interface ColorPalette {
  colors: Array<{
    hex: string
    name: string
    percentage: number
    description: string
  }>
  overallDescription: string
  mood: string
  style: string
}

/**
 * A screen component that analyzes the color palette of saved products using Gemini
 * and displays a beautiful visualization of the user's color preferences.
 */
export function PaletteScreen({onNext}: PaletteScreenProps) {
  const {products, loading: productsLoading, error: productsError} = useSavedProducts({first: 10})
  const [colorAnalysis, setColorAnalysis] = useState<ColorPalette | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Automatically start analysis when products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !hasStartedAnalysis && !isAnalyzing && !colorAnalysis) {
      startColorAnalysis()
    }
  }, [products, hasStartedAnalysis, isAnalyzing, colorAnalysis])

  // Add delay before showing results
  useEffect(() => {
    if (colorAnalysis && !showResults) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 2000) // 2 second delay

      return () => clearTimeout(timer)
    }
    return undefined
  }, [colorAnalysis, showResults])

  const startColorAnalysis = async (): Promise<void> => {
    if (!products || products.length === 0) {
      setAnalysisError('No saved products found to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setHasStartedAnalysis(true)

    try {
      // Prepare product data for analysis
      const productsData = products
        .filter(product => product.featuredImage?.url) // Only include products with images
        .slice(0, 20) // Limit to prevent API overload
        .map(product => ({
          id: product.id,
          title: product.title,
          imageUrl: product.featuredImage!.url,
          description: (product as any).description || '',
          vendor: (product as any).vendor || '',
          productType: (product as any).productType || '',
        }))

      if (productsData.length === 0) {
        setAnalysisError('No products with images found to analyze')
        setIsAnalyzing(false)
        return
      }

      console.log('Starting color analysis for', productsData.length, 'products')
      console.log('Sample products:', productsData.slice(0, 3).map(p => ({title: p.title, vendor: p.vendor})))
      
      const result = await geminiService.analyzeColorPalette(productsData)

      console.log('Analysis result:', result)
      
      if (result.success && result.data) {
        console.log('Color analysis successful - Colors:', result.data.colors?.map((c: any) => c.name))
        console.log('Style:', result.data.style, 'Mood:', result.data.mood)
        setColorAnalysis(result.data)
      } else {
        console.error('Color analysis failed:', result.error)
        setAnalysisError(result.error || 'Failed to analyze color palette')
      }
    } catch (error) {
      console.error('Color analysis error:', error)
      setAnalysisError('An unexpected error occurred during analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white cursor-pointer" onClick={onNext}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Color Story
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Start saving products to discover your unique color palette and style preferences!
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
          {/* Animated color palette */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-indigo-900"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Analyzing Your Color Palette
          </h3>
          <p className="text-purple-200 mb-8 text-lg">Discovering your unique style preferences...</p>
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
  if (colorAnalysis && showResults) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-purple-50 rounded-2xl p-4 overflow-y-auto cursor-pointer"
        onClick={onNext}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Your Color Story
            </h2>
          </div>
          <p className="text-gray-600 text-sm">Based on {products.length} saved products</p>
        </div>

        {/* Style and Mood Tags */}
        <div className="flex justify-center gap-3 mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
            {colorAnalysis.style}
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-pink-100 text-pink-800 border border-pink-200">
            {colorAnalysis.mood}
          </span>
        </div>

        {/* Color Palette */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Your Dominant Colors</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {colorAnalysis.colors.map((color, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-md border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{color.name}</h4>
                    <p className="text-xs text-gray-500">{color.percentage}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{color.description}</p>
              </div>
            ))}
          </div>

          {/* Color Palette Visualization */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3 text-center">Palette Overview</h4>
            <div className="flex rounded-lg overflow-hidden shadow-md h-16">
              {colorAnalysis.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-grow flex items-end justify-center pb-2 text-white text-xs font-medium"
                  style={{ 
                    backgroundColor: color.hex,
                    width: `${color.percentage}%`
                  }}
                >
                  {color.percentage >= 15 && `${color.percentage}%`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Description */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Style Analysis
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{colorAnalysis.overallDescription}</p>
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
        <p className="text-purple-200 text-lg">Getting ready to analyze your colors...</p>
      </div>
    </div>
  )
}