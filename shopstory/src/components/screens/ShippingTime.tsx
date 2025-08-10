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
 * and monthly shipping statistics.
 */
export function ShippingTimeScreen({onNext}: ShippingTimeScreenProps) {
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setShippingData(mockShippingData)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-lg">Analyzing shipping times...</p>
        </div>
      </div>
    )
  }

  if (!shippingData) {
    return (
      <div
        className="w-full h-full bg-red-900 rounded-lg flex items-center justify-center text-white cursor-pointer"
        onClick={onNext}
      >
        <p>Error loading shipping data. Click to continue.</p>
      </div>
    )
  }

  const onTimePercentage = Math.round((shippingData.monthlyStats.onTimeDeliveries / shippingData.monthlyStats.totalOrders) * 100)

  return (
    <div
      className="w-full h-full bg-white rounded-lg overflow-y-auto cursor-pointer"
      onClick={onNext}
    >
      <div className="p-6 space-y-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📦 Shipping Time</h1>
          <p className="text-gray-600">Your monthly shipping insights</p>
        </div>

        {/* Section 1: Cumulative Wait Time */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl">⏱️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Total Wait Time This Month</h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {shippingData.totalCumulativeWaitTime} days
            </div>
            <p className="text-sm text-gray-600">
              Average of {shippingData.monthlyAverage} days per order
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{shippingData.monthlyStats.totalOrders}</div>
                <div className="text-xs text-gray-600">Total Orders</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{shippingData.monthlyStats.averageDays}</div>
                <div className="text-xs text-gray-600">Avg Days</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{onTimePercentage}%</div>
                <div className="text-xs text-gray-600">On Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Longest Shipping Product */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-2xl">🐌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Longest Shipping Time</h2>
            <p className="text-red-600 font-medium text-lg">{shippingData.longestShippingProduct.days} days</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <img 
                src={shippingData.longestShippingProduct.imageUrl} 
                alt={shippingData.longestShippingProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {shippingData.longestShippingProduct.name}
                </h3>
                <p className="text-red-600 font-medium">{shippingData.longestShippingProduct.price}</p>
                <div className="flex items-center mt-2">
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    {shippingData.longestShippingProduct.days} days late
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Shortest Shipping Product */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Fastest Shipping Time</h2>
            <p className="text-green-600 font-medium text-lg">{shippingData.shortestShippingProduct.days} days</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <img 
                src={shippingData.shortestShippingProduct.imageUrl} 
                alt={shippingData.shortestShippingProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {shippingData.shortestShippingProduct.name}
                </h3>
                <p className="text-green-600 font-medium">{shippingData.shortestShippingProduct.price}</p>
                <div className="flex items-center mt-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Lightning fast! ⚡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentile Comparison */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">How You Compare</h3>
            <p className="text-gray-600 text-sm mb-4">Your shipping wait time vs other Shop customers</p>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">73rd</div>
              <div className="text-sm text-gray-600">percentile</div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg"
        >
          Continue Story
        </button>
      </div>
    </div>
  )
}