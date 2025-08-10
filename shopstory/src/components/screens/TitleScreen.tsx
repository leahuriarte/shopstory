import {
  useSavedProducts,
  Product,
  ProductImage,
} from '@shopify/shop-minis-react'
import {TitleScreenData} from '../StoryView'

type TitleScreenProps = {
  onNext: () => void
  screen: TitleScreenData
}

/**
 * A clean scrapbook-themed title screen with textured paper background
 * and animated product photos that look like they're taped to the page.
 */
export function TitleScreen({onNext, screen}: TitleScreenProps) {
  // Fetch the user's saved products to display as animations.
  const {products, loading, error} = useSavedProducts({first: 5})

  // Base component structure
  const renderContent = () => (
    <>
      {/* Sliding Product Images as scrapbook photos */}
      {!loading &&
        !error &&
        products &&
        products.map((product, index) => (
          <AnimatedProduct key={product.id} product={product} index={index} />
        ))}

      {/* Title and Subtitle with scrapbook styling */}
      <div style={{ position: 'relative', zIndex: 100, textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#2d3748',
          textShadow: '2px 2px 0px rgba(255,255,255,0.8)',
          margin: 0,
          letterSpacing: '-0.02em',
          fontFamily: 'serif',
          position: 'relative'
        }}>
          ShopStory
          {/* Hand-drawn underline decoration */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '10%',
            right: '10%',
            height: '3px',
            background: 'repeating-linear-gradient(90deg, #d69e2e, #d69e2e 10px, transparent 10px, transparent 15px)',
            transform: 'rotate(-1deg)'
          }}></div>
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#4a5568',
          margin: '16px 0 0 0',
          fontWeight: '400',
          fontFamily: 'serif',
          fontStyle: 'italic'
        }}>
          Your Life Unboxed
        </p>
      </div>
    </>
  )

  // Scrapbook paper background
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    // Paper texture background
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
    // Add some aged paper effect
    boxShadow: 'inset 0 0 120px rgba(139, 69, 19, 0.1), inset 0 0 40px rgba(139, 69, 19, 0.05)',
    // Force minimum dimensions
    minHeight: '400px',
    minWidth: '300px'
  }

  return (
    <>
      {/* CSS animations and scrapbook elements */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Scrapbook tape decoration */
        .tape {
          position: absolute;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8));
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div
        style={containerStyle}
        onClick={onNext}
      >
        {/* Decorative tape pieces in corners */}
        <div 
          className="tape"
          style={{
            top: '20px',
            left: '20px',
            width: '40px',
            height: '15px',
            transform: 'rotate(-15deg)',
            zIndex: 110
          }}
        ></div>
        
        <div 
          className="tape"
          style={{
            top: '20px',
            right: '20px',
            width: '35px',
            height: '15px',
            transform: 'rotate(20deg)',
            zIndex: 110
          }}
        ></div>

        <div 
          className="tape"
          style={{
            bottom: '20px',
            left: '30px',
            width: '45px',
            height: '15px',
            transform: 'rotate(10deg)',
            zIndex: 110
          }}
        ></div>

        {/* Handle loading and error states */}
        {loading ? (
          <div style={{ position: 'relative', zIndex: 100, textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem', 
              animation: 'spin 2s linear infinite' 
            }}>⭐</div>
            <p style={{ fontSize: '1rem', color: '#4a5568', fontFamily: 'serif' }}>
              Loading your memories...
            </p>
          </div>
        ) : error ? (
          <div style={{ position: 'relative', zIndex: 100, textAlign: 'center' }}>
            <p style={{ color: '#e53e3e', marginBottom: '1rem', fontFamily: 'serif' }}>
              Could not load saved items.
            </p>
            {renderContent()}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </>
  )
}

/**
 * A component to render a single product image as a scrapbook photo with tape
 */
function AnimatedProduct({product, index}: {product: Product; index: number}) {
  // Array of vertical positions for a more staggered "up and down" look.
  const topPositions = ['15%', '65%', '40%', '75%', '5%']
  const topPosition = topPositions[index % topPositions.length]

  // Random rotations for authentic scrapbook look
  const rotations = ['-8deg', '5deg', '-12deg', '7deg', '-5deg']
  const rotation = rotations[index % rotations.length]

  // Faster animation start times and slightly varied durations.
  const animationDuration = 8 + index * 1 // e.g., 8s, 9s, 10s...
  const animationDelay = index * 0.3 // e.g., 0s, 0.3s, 0.6s...

  // Use the featuredImage property, which is of type ProductImage.
  if (!product.featuredImage) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes slide-${index} {
          0% {
            transform: translateX(-150px) rotate(${rotation}) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateX(-50px) rotate(${rotation}) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateX(calc(100vw - 50px)) rotate(${rotation}) scale(1);
          }
          100% {
            transform: translateX(calc(100vw + 150px)) rotate(${rotation}) scale(0.8);
            opacity: 0;
          }
        }
        .animate-slide-${index} {
          animation: slide-${index} ${animationDuration}s ease-in-out ${animationDelay}s infinite;
        }
      `}</style>
      <div
        className={`animate-slide-${index}`}
        style={{
          position: 'absolute',
          top: topPosition,
          left: '-150px',
          width: '80px',
          height: '80px',
          zIndex: 50
        }}
      >
        {/* Photo with scrapbook styling */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'white',
          padding: '4px',
          borderRadius: '2px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.1)',
          transform: rotation
        }}>
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '1px'
            }}
            onError={(e) => {
              console.log('Product image failed to load:', product.featuredImage?.url)
              const target = e.target as HTMLElement
              if (target.parentElement?.parentElement) {
                target.parentElement.parentElement.style.display = 'none'
              }
            }}
          />
          
          {/* Simple tape corners */}
          <div style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            width: '16px',
            height: '8px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8))',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transform: 'rotate(25deg)',
            zIndex: 10
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '-3px',
            left: '-3px',
            width: '14px',
            height: '8px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.8))',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transform: 'rotate(-20deg)',
            zIndex: 10
          }}></div>
        </div>
      </div>
    </>
  )
}