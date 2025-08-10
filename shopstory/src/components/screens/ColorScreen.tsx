import {ColorScreenData} from '../StoryView'

type ColorScreenProps = {
  onNext: () => void
  onPrevious: () => void
  screen: ColorScreenData
}

/**
 * Renders a scrapbook-themed screen with decorative elements based on the content.
 */
export function ColorScreen({onNext, onPrevious, screen}: ColorScreenProps) {
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

  const isEnvironmentalScreen = screen.text.toLowerCase().includes('earth')
  const isShippingScreen = screen.text.toLowerCase().includes('shipping')

  if (isEnvironmentalScreen) {
    return (
      <>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(5deg); }
            50% { transform: translateY(-5px) rotate(-3deg); }
            75% { transform: translateY(-15px) rotate(2deg); }
          }
          @keyframes gentle-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(10deg); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-gentle-spin { animation: gentle-spin 15s linear infinite; }
          .animate-sway { animation: sway 3s ease-in-out infinite; }
        `}</style>
        <div
        className="w-full h-full rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{
          // Scrapbook paper background with green tint for environmental theme
          background: `
            radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.03) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(34, 139, 34, 0.02) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(34, 139, 34, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 139, 34, 0.01) 50%, transparent 50%),
            linear-gradient(180deg, rgba(34, 139, 34, 0.01) 50%, transparent 50%),
            linear-gradient(135deg, 
              #f0f8f0 0%, 
              #eaf5ea 25%,
              #e4f2e4 50%,
              #deefde 75%,
              #d8ecd8 100%
            )
          `,
          backgroundSize: '40px 40px, 60px 60px, 30px 30px, 8px 8px, 12px 12px, 100% 100%',
          boxShadow: 'inset 0 0 120px rgba(34, 139, 34, 0.1), inset 0 0 40px rgba(34, 139, 34, 0.05)',
        }}
        onClick={handleClick}
      >
        
        {/* Decorative tape pieces in corners */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-green-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-green-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-green-300 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        {/* 12 naturally distributed floating nature elements - grid-based with minimal randomness */}
        {/* Top area - around 15% baseline */}
        <div className="absolute left-1/5 text-green-600 text-4xl transform -rotate-12 animate-float" style={{ top: '14%', animationDelay: '0s' }}>🍃</div>
        <div className="absolute left-1/2 text-green-500 text-4xl transform rotate-15 animate-sway" style={{ top: '16%', animationDelay: '1s' }}>🌿</div>
        <div className="absolute right-1/5 text-green-700 text-4xl transform -rotate-20 animate-float" style={{ top: '15%', animationDelay: '2s' }}>🍀</div>
        
        {/* Upper-middle area - around 35% baseline */}
        <div className="absolute left-12 text-green-600 text-4xl transform rotate-25 animate-sway" style={{ top: '34%', animationDelay: '0.5s' }}>🌱</div>
        <div className="absolute left-1/3 text-green-500 text-4xl transform -rotate-10 animate-float" style={{ top: '36%', animationDelay: '1.5s' }}>🍃</div>
        <div className="absolute right-1/3 text-green-700 text-4xl transform rotate-30 animate-sway" style={{ top: '35%', animationDelay: '2.5s' }}>🌿</div>
        
        {/* Middle area - around 55% baseline */}
        <div className="absolute left-1/4 text-green-500 text-4xl transform rotate-20 animate-sway" style={{ top: '54%', animationDelay: '1.2s' }}>🌱</div>
        <div className="absolute right-1/4 text-green-700 text-4xl transform -rotate-25 animate-float" style={{ top: '56%', animationDelay: '2.8s' }}>🍃</div>
        
        {/* Lower-middle area - around 75% baseline */}
        <div className="absolute left-16 text-green-600 text-4xl transform rotate-10 animate-sway" style={{ top: '74%', animationDelay: '3.5s' }}>🌿</div>
        <div className="absolute left-2/5 text-green-500 text-4xl transform -rotate-30 animate-float" style={{ top: '76%', animationDelay: '4.2s' }}>🍀</div>
        <div className="absolute right-2/5 text-green-700 text-4xl transform rotate-35 animate-sway" style={{ top: '75%', animationDelay: '0.8s' }}>🌱</div>
        
        {/* Bottom area - around 90% baseline */}
        <div className="absolute right-1/5 text-green-700 text-4xl transform -rotate-35 animate-float" style={{ top: '90%', animationDelay: '5.2s' }}>🍀</div>
        
        {/* Washi tape effect */}
        <div className="absolute top-0 left-1/4 w-16 h-2 bg-green-400 opacity-60 transform -rotate-3"></div>
        <div className="absolute bottom-0 right-1/4 w-20 h-2 bg-emerald-400 opacity-60 transform rotate-2"></div>
        
        {/* Main text with scrapbook styling */}
        <div className="relative z-10 text-center p-6">
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-lg transform -rotate-1 border-2 border-dashed border-green-400">
            <p className="text-green-800 text-2xl font-bold font-sans-serif">{screen.text}</p>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="text-green-600">♻️</span>
              <span className="text-green-600">🌱</span>
              <span className="text-green-600">💚</span>
            </div>
          </div>
        </div>
        

        </div>
      </>
    )
  }

  if (isShippingScreen) {
    return (
      <>
        <style>{`
          @keyframes zoom {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(5deg); }
          }
          @keyframes slide {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(10px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          .animate-zoom { animation: zoom 3s ease-in-out infinite; }
          .animate-slide { animation: slide 4s ease-in-out infinite; }
          .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        `}</style>
        <div
        className="w-full h-full rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{
          // Scrapbook paper background with blue tint for shipping theme
          background: `
            radial-gradient(circle at 20% 30%, rgba(30, 144, 255, 0.03) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(30, 144, 255, 0.02) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(30, 144, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 144, 255, 0.01) 50%, transparent 50%),
            linear-gradient(180deg, rgba(30, 144, 255, 0.01) 50%, transparent 50%),
            linear-gradient(135deg, 
              #f0f8ff 0%, 
              #eaf5ff 25%,
              #e4f2ff 50%,
              #deefff 75%,
              #d8ecff 100%
            )
          `,
          backgroundSize: '40px 40px, 60px 60px, 30px 30px, 8px 8px, 12px 12px, 100% 100%',
          boxShadow: 'inset 0 0 120px rgba(30, 144, 255, 0.1), inset 0 0 40px rgba(30, 144, 255, 0.05)',
        }}
        onClick={handleClick}
      >
        
        {/* Decorative tape pieces in corners */}
        <div className="absolute top-5 left-5 w-10 h-4 bg-white bg-opacity-80 border border-blue-300 shadow-sm transform -rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute top-5 right-5 w-9 h-4 bg-white bg-opacity-80 border border-blue-300 shadow-sm transform rotate-12 z-20" style={{ borderRadius: '1px' }} />
        <div className="absolute bottom-5 left-8 w-11 h-4 bg-white bg-opacity-80 border border-blue-300 shadow-sm transform rotate-6 z-20" style={{ borderRadius: '1px' }} />
        
        {/* 12 naturally distributed shipping-themed decorative elements - grid-based with minimal randomness */}
        {/* Top area - around 15% baseline */}
        <div className="absolute left-1/5 text-blue-600 text-4xl transform -rotate-12 animate-zoom" style={{ top: '15%', animationDelay: '0s' }}>📦</div>
        <div className="absolute left-1/2 text-blue-500 text-4xl transform rotate-15 animate-slide" style={{ top: '16%', animationDelay: '1s' }}>🚚</div>
        <div className="absolute right-1/5 text-blue-700 text-4xl transform -rotate-20 animate-wiggle" style={{ top: '14%', animationDelay: '2s' }}>✈️</div>
        
        {/* Upper-middle area - around 35% baseline */}
        <div className="absolute left-14 text-blue-600 text-4xl transform rotate-25 animate-zoom" style={{ top: '35%', animationDelay: '0.5s' }}>🚢</div>
        <div className="absolute left-2/5 text-blue-500 text-4xl transform -rotate-10 animate-slide" style={{ top: '36%', animationDelay: '1.5s' }}>📊</div>
        <div className="absolute right-2/5 text-blue-700 text-4xl transform rotate-30 animate-wiggle" style={{ top: '34%', animationDelay: '2.5s' }}>📈</div>
        
        {/* Middle area - around 55% baseline */}
        <div className="absolute left-1/4 text-blue-500 text-4xl transform rotate-20 animate-slide" style={{ top: '55%', animationDelay: '1.2s' }}>🎯</div>
        <div className="absolute right-1/4 text-blue-700 text-4xl transform -rotate-25 animate-wiggle" style={{ top: '56%', animationDelay: '2.8s' }}>📦</div>
        
        {/* Lower-middle area - around 75% baseline */}
        <div className="absolute left-12 text-blue-600 text-4xl transform rotate-10 animate-zoom" style={{ top: '75%', animationDelay: '3.5s' }}>🚚</div>
        <div className="absolute left-1/3 text-blue-500 text-4xl transform -rotate-30 animate-slide" style={{ top: '76%', animationDelay: '4.2s' }}>✈️</div>
        <div className="absolute right-1/3 text-blue-700 text-4xl transform rotate-35 animate-wiggle" style={{ top: '74%', animationDelay: '0.8s' }}>🚢</div>
        
        {/* Bottom area - around 90% baseline */}
        <div className="absolute right-1/5 text-blue-700 text-4xl transform -rotate-35 animate-wiggle" style={{ top: '90%', animationDelay: '5.2s' }}>⏰</div>
        
        {/* Colorful washi tape strips */}
        <div className="absolute top-0 left-1/3 w-12 h-3 bg-yellow-400 opacity-70 transform -rotate-6"></div>
        <div className="absolute bottom-0 right-1/3 w-16 h-3 bg-pink-400 opacity-70 transform rotate-3"></div>
        <div className="absolute left-0 top-1/2 w-3 h-12 bg-orange-400 opacity-70 transform -rotate-12"></div>
        
        {/* Main text with fun scrapbook styling */}
        <div className="relative z-10 text-center p-6">
          <div className="bg-white bg-opacity-95 rounded-xl p-5 shadow-xl transform rotate-1 border-4 border-dotted border-blue-400">
            <p className="text-blue-800 text-2xl font-bold font-sans">{screen.text}</p>
            <div className="mt-3 flex justify-center space-x-3">
              <span className="text-blue-600 text-lg">📊</span>
              <span className="text-blue-600 text-lg">⚡</span>
              <span className="text-blue-600 text-lg">🎯</span>
            </div>
          </div>
        </div>
        
        {/* Simplified decorative elements */}
        <div className="absolute bottom-12 left-12 bg-yellow-300 rounded-full w-8 h-8 flex items-center justify-center text-sm transform rotate-12 animate-wiggle">⭐</div>
        </div>
      </>
    )
  }

  // Fallback for other color screens (keep original design)
  return (
    <div
      className={`w-full h-full rounded-lg flex items-center justify-center text-white text-2xl font-bold text-center p-4 cursor-pointer ${screen.value}`}
      onClick={handleClick}
    >
      <p>{screen.text}</p>
    </div>
  )
}