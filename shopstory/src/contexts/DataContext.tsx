import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSavedProducts, useRecommendedProducts, Product } from '@shopify/shop-minis-react'

interface DataContextType {
  savedProducts: Product[] | null
  recommendedProducts: Product[] | null
  savedProductsLoading: boolean
  recommendedProductsLoading: boolean
  savedProductsError: any
  recommendedProductsError: any
  isDataReady: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isDataReady, setIsDataReady] = useState(false)
  
  // Preload saved products with a higher limit to cover all screens
  const { 
    products: savedProducts, 
    loading: savedProductsLoading, 
    error: savedProductsError 
  } = useSavedProducts({ first: 25 })
  
  // Preload recommended products
  const { 
    products: recommendedProducts, 
    loading: recommendedProductsLoading, 
    error: recommendedProductsError 
  } = useRecommendedProducts({ first: 15 })

  // Mark data as ready when both hooks have finished loading
  useEffect(() => {
    if (!savedProductsLoading && !recommendedProductsLoading) {
      setIsDataReady(true)
    }
  }, [savedProductsLoading, recommendedProductsLoading])

  const value: DataContextType = {
    savedProducts,
    recommendedProducts,
    savedProductsLoading,
    recommendedProductsLoading,
    savedProductsError,
    recommendedProductsError,
    isDataReady
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function usePreloadedData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('usePreloadedData must be used within a DataProvider')
  }
  return context
}

// Helper hooks that mimic the original hook APIs but use preloaded data
export function usePreloadedSavedProducts(options?: { first?: number }) {
  const { savedProducts, savedProductsLoading, savedProductsError } = usePreloadedData()
  
  // If a specific limit is requested, slice the preloaded data
  const products = options?.first && savedProducts 
    ? savedProducts.slice(0, options.first)
    : savedProducts

  return {
    products,
    loading: savedProductsLoading,
    error: savedProductsError
  }
}

export function usePreloadedRecommendedProducts(options?: { first?: number }) {
  const { recommendedProducts, recommendedProductsLoading, recommendedProductsError } = usePreloadedData()
  
  // If a specific limit is requested, slice the preloaded data
  const products = options?.first && recommendedProducts 
    ? recommendedProducts.slice(0, options.first)
    : recommendedProducts

  return {
    products,
    loading: recommendedProductsLoading,
    error: recommendedProductsError
  }
}