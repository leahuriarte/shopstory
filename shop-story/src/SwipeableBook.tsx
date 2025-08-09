import React, { useState, useRef, useEffect } from 'react'
import { usePopularProducts, ProductCard } from '@shopify/shop-minis-react'

interface BookPage {
  id: number
  title: string
  content: string
  image?: string
  type?: 'title' | 'stats' | 'products' | 'action'
  specialData?: any
}

interface SwipeableBookProps {
  pages: BookPage[]
  className?: string
}

export function SwipeableBook({ pages, className = '' }: SwipeableBookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const bookRef = useRef<HTMLDivElement>(null)
  const { products } = usePopularProducts()

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 50 // Minimum swipe distance
    
    if (translateX > threshold && currentPage > 0) {
      // Swipe right - previous page
      setCurrentPage(prev => prev - 1)
    } else if (translateX < -threshold && currentPage < pages.length - 1) {
      // Swipe left - next page
      setCurrentPage(prev => prev + 1)
    }
    
    setIsDragging(false)
    setTranslateX(0)
    setStartX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const currentX = e.clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const threshold = 50
    
    if (translateX > threshold && currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    } else if (translateX < -threshold && currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1)
    }
    
    setIsDragging(false)
    setTranslateX(0)
    setStartX(0)
  }

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

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

  return (
    <div className={`swipeable-book ${className}`}>
      {/* Book Container */}
      <div 
        ref={bookRef}
        className="book-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="pages-wrapper"
          style={{
            transform: `translateX(${-currentPage * 100 + (isDragging ? translateX / (bookRef.current?.offsetWidth || 1) * 100 : 0)}%)`
          }}
        >
          {pages.map((page, index) => (
            <div key={page.id} className={`book-page ${page.type || 'default'}-page`}>
              {renderPageContent(page)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="book-controls">
        <button 
          className="nav-button nav-prev"
          onClick={goToPrevious}
          disabled={currentPage === 0}
        >
          ‹
        </button>
        
        <div className="page-indicators">
          {pages.map((_, index) => (
            <button
              key={index}
              className={`page-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(index)}
            />
          ))}
        </div>
        
        <button 
          className="nav-button nav-next"
          onClick={goToNext}
          disabled={currentPage === pages.length - 1}
        >
          ›
        </button>
      </div>

      {/* Page Counter */}
      <div className="page-counter">
        {currentPage + 1} of {pages.length}
      </div>
    </div>
  )
} 