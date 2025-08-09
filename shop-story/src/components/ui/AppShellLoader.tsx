import React from 'react'
import { SkeletonLoader } from './SkeletonLoader'

interface AppShellLoaderProps {
  variant?: 'stories' | 'shop' | 'profile'
}

export const AppShellLoader: React.FC<AppShellLoaderProps> = ({ 
  variant = 'stories' 
}) => {
  if (variant === 'stories') {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto px-4">
          <SkeletonLoader variant="story-card" className="bg-gray-800" />
        </div>
      </div>
    )
  }

  if (variant === 'shop') {
    return (
      <div className="pt-16 px-4 pb-20">
        {/* Header skeleton */}
        <div className="mb-6">
          <SkeletonLoader height="2rem" className="mb-2" />
          <SkeletonLoader height="1rem" width="60%" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLoader key={index} variant="product-card" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="pt-16 px-4 pb-20">
        {/* Profile header skeleton */}
        <div className="text-center mb-8">
          <SkeletonLoader variant="circular" width="5rem" height="5rem" className="mx-auto mb-4" />
          <SkeletonLoader height="1.5rem" width="8rem" className="mx-auto mb-2" />
          <SkeletonLoader height="1rem" width="12rem" className="mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center">
              <SkeletonLoader height="2rem" className="mb-2" />
              <SkeletonLoader height="1rem" />
            </div>
          ))}
        </div>

        {/* Menu items skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
              <div className="flex-1">
                <SkeletonLoader height="1rem" className="mb-1" />
                <SkeletonLoader height="0.75rem" width="70%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}