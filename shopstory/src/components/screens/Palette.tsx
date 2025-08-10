import {useState, useEffect} from 'react'
import {geminiService} from '../../services/gemini'
import {usePreloadedSavedProducts} from '../../contexts/DataContext'

type PaletteScreenProps = {
  onNext: () => void
  onPrevious: () => void
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
 * and displays a beautiful scrapbook visualization of the user's color preferences
 * with actual color swatches and polaroid-style presentation.
 */
export function PaletteScreen({onNext, onPrevious}: PaletteScreenProps) {
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
  const {products, loading: productsLoading, error: productsError} = usePreloadedSavedProducts({first: 10})

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
        className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer relative" 
        onClick={handleClick}
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Loading Your Color Story</h3>
          <p className="text-amber-800 text-lg">Gathering your aesthetic evidence...</p>
        </div>
      </div>
    )
  }

  // Error state for products
  if (productsError || !products) {
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Colors Are Being Shy</h3>
          <p className="text-amber-800 text-lg">Tap anywhere to keep the vibe going</p>
        </div>
      </div>
    )
  }

  // No products state
  if (products.length === 0) {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V5z" />
            </svg>
            {/* Tape corners */}
            <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
            <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-amber-900">
            Your Color Story
          </h2>
          <p className="text-amber-800 mb-8 text-lg leading-relaxed">
            Start saving items to unlock your color DNA and discover your aesthetic signature!
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
        onClick={handleClick}
        style={scrapbookStyle}
      >
        {/* Decorative tape pieces */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 right-8 w-11 h-4 bg-white bg-opacity-80 border border-amber-200 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        <div className="text-center z-10 p-8">
          {/* Animated color palette with scrapbook styling */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-white border-4 border-amber-300 shadow-md animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-amber-100 flex items-center justify-center">
              🎨
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-amber-900">
            Reading Your Color Aura
          </h3>
          <p className="text-amber-800 mb-8 text-lg">Decoding your aesthetic DNA...</p>
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
        onClick={handleClick}
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Color Reader Broke</h3>
          <p className="text-amber-800 text-lg mb-4">The palette detector failed: {analysisError}</p>
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

  // Results state with scrapbook styling and real colors
  if (colorAnalysis && showResults) {
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
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v10a4 4 0 004 4h6a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-amber-900">
              Your Color Era
            </h2>
          </div>
          <p className="text-amber-800 text-sm">Based on {products.length} saved products</p>
        </div>

        {/* Style and Mood Tags as vintage stickers */}
        <div className="flex justify-center gap-3 mb-6 relative z-10">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-amber-800 border-2 border-amber-300 shadow-md transform -rotate-1">
            {colorAnalysis.style}
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-amber-800 border-2 border-amber-300 shadow-md transform rotate-1">
            {colorAnalysis.mood}
          </span>
        </div>

        {/* Color Palette as simple squares */}
        <div className="mb-12 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-center text-amber-900">Your Color DNA</h3>
          <div className="grid grid-cols-3 gap-4 mb-12">
            {colorAnalysis.colors.slice(0, 6).map((color, index) => {
              const rotations = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2', 'rotate-3', '-rotate-3']
              const rotation = rotations[index % rotations.length]
              
              return (
                <div key={index} className="text-center">
                  <div 
                    className={`w-full h-20 rounded-lg shadow-md border-2 border-amber-200 relative ${rotation} mb-2`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {/* Tape corners */}
                    <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
                  </div>
                  <p className="text-xs font-medium text-amber-900 px-1">{color.name}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Palette Popsicle */}
        <div className="mb-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-center text-amber-900">Your Vibe Spectrum</h3>
          <div className="flex rounded-lg overflow-hidden shadow-md h-16 border-2 border-amber-200">
            {colorAnalysis.colors.slice(0, 6).map((color, index) => (
              <div
                key={index}
                className="flex-grow flex items-end justify-center pb-2 text-white text-xs font-medium relative overflow-hidden"
                style={{ 
                  backgroundColor: color.hex,
                  width: `${color.percentage}%`
                }}
              >
                {/* Paint texture overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%)`
                  }}
                ></div>
                {color.percentage >= 10 && (
                  <span className="relative z-10 drop-shadow-sm">
                    {color.percentage}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default loading state while waiting for analysis to start
  return (
    <div 
      className="w-full h-full rounded-lg flex items-center justify-center text-amber-900 cursor-pointer relative" 
      onClick={handleClick}
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
        <h3 className="text-2xl font-bold mb-2 text-amber-900">Preparing Your Color Reading</h3>
        <p className="text-amber-800 text-lg">Getting ready to decode your aesthetic...</p>
      </div>
    </div>
  )
}