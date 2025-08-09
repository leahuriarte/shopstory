import React from 'react'

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'product-card' | 'story-card'
  width?: string | number
  height?: string | number
  className?: string
  lines?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  if (variant === 'text') {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} h-4 mb-2 last:mb-0`}
            style={{ 
              width: width || (index === lines - 1 ? '75%' : '100%'),
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{ 
          width: width || '3rem', 
          height: height || '3rem' 
        }}
      />
    )
  }

  if (variant === 'product-card') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className={`${baseClasses} aspect-square`} />
        <div className="space-y-2">
          <div className={`${baseClasses} h-4`} />
          <div className={`${baseClasses} h-4 w-3/4`} />
          <div className={`${baseClasses} h-6 w-1/2`} />
        </div>
      </div>
    )
  }

  if (variant === 'story-card') {
    return (
      <div className={`${className}`} style={{ aspectRatio: '9/16' }}>
        <div className={`${baseClasses} w-full h-full`} />
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '1rem' 
      }}
    />
  )
}