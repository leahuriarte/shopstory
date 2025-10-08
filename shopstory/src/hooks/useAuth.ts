/**
 * Authentication hook for Shop Minis with Supabase
 * Based on: https://github.com/Shopify/shop-minis/tree/main/supabase
 */

import { useState, useEffect } from 'react'
import { useMinisToken } from '@shopify/shop-minis-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const AUTH_ENDPOINT = `${SUPABASE_URL}/functions/v1/auth`
const JWT_STORAGE_KEY = 'shop_minis_jwt'

interface AuthState {
  jwt: string | null
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const { token: minisToken } = useMinisToken()
  const [authState, setAuthState] = useState<AuthState>({
    jwt: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    initAuth()
  }, [minisToken])

  const initAuth = async () => {
    // Check if we have a cached JWT
    const cachedJwt = localStorage.getItem(JWT_STORAGE_KEY)
    if (cachedJwt && !isJwtExpired(cachedJwt)) {
      setAuthState({ jwt: cachedJwt, isLoading: false, error: null })
      return
    }

    // Get new JWT using Shop Minis token
    if (minisToken) {
      await getNewJwt(minisToken)
    } else {
      setAuthState({ jwt: null, isLoading: false, error: 'No Shop Minis token available' })
    }
  }

  const getNewJwt = async (token: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate')
      }

      const { jwt } = await response.json()
      localStorage.setItem(JWT_STORAGE_KEY, jwt)
      setAuthState({ jwt, isLoading: false, error: null })
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthState({
        jwt: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      })
    }
  }

  const clearAuth = () => {
    localStorage.removeItem(JWT_STORAGE_KEY)
    setAuthState({ jwt: null, isLoading: false, error: null })
  }

  return {
    jwt: authState.jwt,
    isAuthenticated: !!authState.jwt,
    isLoading: authState.isLoading,
    error: authState.error,
    clearAuth,
  }
}

/**
 * Check if JWT is expired
 */
function isJwtExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
