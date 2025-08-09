import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { usePopularProducts, ProductCard } from '@shopify/shop-minis-react'

interface BookPage {
  id: number
  title: string
  content: string
  image?: string
  type?: 'title' | 'stats' | 'products' | 'action'
  specialData?: any
}

interface RealisticBookProps {
  pages: BookPage[]
  className?: string
}

// Page component that will be used for each page
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; pageType?: string }>((props, ref) => {
  return (
    <div className={`page ${props.pageType || 'default'}-page`} ref={ref}>
      <div className="page-content">
        {props.children}
      </div>
    </div>
  )
})

Page.displayName = 'Page'

export function RealisticBook({ pages, className = '' }: RealisticBookProps) {
  const bookRef = useRef<any>(null)
  const { products } = usePopularProducts()

  const renderPageContent = (page: BookPage) => {
    switch (page.type) {
      case 'title':
        return (
          <div className="title-page-content">
            <div className="title-decoration">✨</div>
            <h1 className="title-name">{page.specialData?.personName}'s</h1>
            <h2 className="title-year">{page.specialData?.year}</h2>
            <h2 className="title-main">Shop Wrapped</h2>
            <div className="title-stats">
              <div className="stat-item">
                <span className="stat-number">{page.specialData?.totalOrders}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{page.specialData?.totalSpent}</span>
                <span className="stat-label">Spent</span>
              </div>
            </div>
            <p className="title-subtitle">{page.content}</p>
          </div>
        )
      
      case 'action':
        return (
          <div className="action-page-content">
            <h2 className="page-title">{page.title}</h2>
            <div className="page-text">
              {page.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
            
            {products && products.length > 0 && (
              <div className="product-recommendations">
                <h3 className="recommendations-title">Curated for You</h3>
                <div className="products-grid">
                  {products.slice(0, 4).map(product => (
                    <div key={product.id} className="product-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button className="shop-button">
              {page.specialData?.buttonText || 'Shop Now'} →
            </button>
          </div>
        )
      
      default:
        return (
          <div className="stats-page-content">
            {page.image && (
              <div className="page-image">
                <img src={page.image} alt={page.title} />
              </div>
            )}
            <h2 className="page-title">{page.title}</h2>
            <div className="page-text">
              {page.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>
        )
    }
  }

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext()
    }
  }

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev()
    }
  }

  return (
    <div className={`realistic-book-container ${className}`}>
      <div className="book-wrapper">
        <HTMLFlipBook
          ref={bookRef}
          width={350}
          height={500}
          size="stretch"
          minWidth={300}
          maxWidth={400}
          minHeight={450}
          maxHeight={550}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={false}
          clickEventForward={true}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          drawShadow={true}
          flippingTime={800}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          className="realistic-flipbook"
        >
          {pages.map((page, index) => (
            <Page key={page.id} pageType={page.type}>
              {renderPageContent(page)}
            </Page>
          ))}
        </HTMLFlipBook>
      </div>
      
      {/* Navigation Controls */}
      <div className="book-navigation">
        <button 
          className="nav-btn prev-btn"
          onClick={prevPage}
        >
          ‹ Previous
        </button>
        
        <button 
          className="nav-btn next-btn"
          onClick={nextPage}
        >
          Next ›
        </button>
      </div>
      
      <div className="book-instructions">
        📖 Click on page corners or use buttons to flip pages
      </div>
    </div>
  )
} 