import {useState, useEffect} from 'react'

type ShippingTimeScreenProps = {
  onNext: () => void
}

interface ShippingData {
  totalCumulativeWaitTime: number
  monthlyAverage: number
  longestShippingProduct: {
    name: string
    days: number
    imageUrl: string
    price: string
  }
  shortestShippingProduct: {
    name: string
    days: number
    imageUrl: string
    price: string
  }
  monthlyStats: {
    totalOrders: number
    averageDays: number
    onTimeDeliveries: number
  }
}

// Mock shipping data
const mockShippingData: ShippingData = {
  totalCumulativeWaitTime: 847, // Total days waited this month
  monthlyAverage: 7.2,
  longestShippingProduct: {
    name: "Organic Cotton Throw Blanket",
    days: 21,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
    price: "$89.99"
  },
  shortestShippingProduct: {
    name: "Bamboo Phone Case",
    days: 2,
    imageUrl: "https://images.unsplash.com/photo-1574739782594-db4ead022697?w=300&h=300&fit=crop",
    price: "$24.99"
  },
  monthlyStats: {
    totalOrders: 118,
    averageDays: 7.2,
    onTimeDeliveries: 89
  }
}

/**
 * A screen component that displays comprehensive shipping time analytics
 * including cumulative wait times, fastest/slowest deliveries with product cards,
 * and monthly shipping statistics. Now styled with scrapbook theme.
 */
export function ShippingTimeScreen({onNext}: ShippingTimeScreenProps) {
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data immediately
    setShippingData(mockShippingData)
    setLoading(false)
  }, [])

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

  if (loading) {
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Analyzing Shipping Times</h3>
          <p className="text-amber-800 text-lg">Gathering your delivery data...</p>
        </div>
      </div>
    )
  }

  if (!shippingData) {
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
          <h3 className="text-2xl font-bold mb-2 text-amber-900">Error Loading Shipping Data</h3>
          <p className="text-amber-800 text-lg">Click to continue</p>
        </div>
      </div>
    )
  }

  const onTimePercentage = Math.round((shippingData.monthlyStats.onTimeDeliveries / shippingData.monthlyStats.totalOrders) * 100)

  return (
    <div
      className="w-full h-full rounded-lg p-4 overflow-y-auto cursor-pointer relative"
      onClick={onNext}
      style={scrapbookStyle}
    >
      {/* Decorative tape pieces */}
      <div className="absolute top-2 left-3 w-8 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
      <div className="absolute top-2 right-3 w-7 h-3 bg-white bg-opacity-90 border border-amber-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />

      <div className="space-y-6">
        {/* Header with scrapbook styling */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-900">
              Shipping Time Analytics
            </h2>
          </div>
          <p className="text-amber-800 text-sm">Your monthly delivery insights</p>
        </div>

        {/* Section 1: Cumulative Wait Time as scrapbook note */}
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200 relative shadow-md transform -rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 border-2 border-blue-200">
              <span className="text-2xl">⏱️</span>
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Total Wait Time This Month</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {shippingData.totalCumulativeWaitTime} days
            </div>
            <p className="text-sm text-amber-700 mb-4">
              Average of {shippingData.monthlyAverage} days per order
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="text-lg font-semibold text-amber-900">{shippingData.monthlyStats.totalOrders}</div>
                <div className="text-xs text-amber-700">Total Orders</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="text-lg font-semibold text-amber-900">{shippingData.monthlyStats.averageDays}</div>
                <div className="text-xs text-amber-700">Avg Days</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="text-lg font-semibold text-amber-900">{onTimePercentage}%</div>
                <div className="text-xs text-amber-700">On Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Longest Shipping Product as polaroid */}
        <div className="bg-white rounded-lg p-6 border-2 border-red-200 relative shadow-md transform rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 border-2 border-red-200">
              <span className="text-2xl">🐌</span>
            </div>
            <h3 className="text-xl font-semibold text-amber-900">Longest Shipping Time</h3>
            <p className="text-red-600 font-medium text-lg">{shippingData.longestShippingProduct.days} days</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 relative">
            {/* Polaroid-style product card */}
            <div className="flex items-center space-x-4">
              <div className="bg-white p-1 rounded-lg border-2 border-amber-200 shadow-sm">
                <img 
                  src={shippingData.longestShippingProduct.imageUrl} 
                  alt={shippingData.longestShippingProduct.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                {/* Small tape corners on product image */}
                <div className="absolute top-0 right-0 w-3 h-1.5 bg-white bg-opacity-90 border border-amber-300 transform rotate-45" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 text-sm mb-1">
                  {shippingData.longestShippingProduct.name}
                </h4>
                <p className="text-red-600 font-medium">{shippingData.longestShippingProduct.price}</p>
                <div className="flex items-center mt-2">
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs border border-red-200">
                    {shippingData.longestShippingProduct.days} days late
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Shortest Shipping Product as polaroid */}
        <div className="bg-white rounded-lg p-6 border-2 border-green-200 relative shadow-md transform -rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 border-2 border-green-200">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-amber-900">Fastest Shipping Time</h3>
            <p className="text-green-600 font-medium text-lg">{shippingData.shortestShippingProduct.days} days</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 relative">
            {/* Polaroid-style product card */}
            <div className="flex items-center space-x-4">
              <div className="bg-white p-1 rounded-lg border-2 border-amber-200 shadow-sm">
                <img 
                  src={shippingData.shortestShippingProduct.imageUrl} 
                  alt={shippingData.shortestShippingProduct.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                {/* Small tape corners on product image */}
                <div className="absolute top-0 right-0 w-3 h-1.5 bg-white bg-opacity-90 border border-amber-300 transform rotate-45" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 text-sm mb-1">
                  {shippingData.shortestShippingProduct.name}
                </h4>
                <p className="text-green-600 font-medium">{shippingData.shortestShippingProduct.price}</p>
                <div className="flex items-center mt-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs border border-green-200">
                    Lightning fast! ⚡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentile Comparison as handwritten note */}
        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 relative shadow-md transform rotate-1">
          {/* Tape corners */}
          <div className="absolute -top-1 -right-1 w-4 h-2 bg-white bg-opacity-90 border border-amber-300 transform rotate-12 z-10" />
          <div className="absolute -bottom-1 -left-1 w-3 h-2 bg-white bg-opacity-90 border border-amber-300 transform -rotate-12 z-10" />
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 border-2 border-purple-200">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">How You Compare</h3>
            <p className="text-amber-700 text-sm mb-4">Your shipping wait time vs other Shop customers</p>
            
            <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">73rd</div>
              <div className="text-sm text-amber-700">percentile</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}