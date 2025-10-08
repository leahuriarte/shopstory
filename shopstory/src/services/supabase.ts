/**
 * Supabase service for Shop Minis
 * Uses Edge Functions with JWT authentication
 * Based on: https://github.com/Shopify/shop-minis/tree/main/supabase
 *
 * Setup Instructions:
 * 1. Follow the guide at: https://github.com/Shopify/shop-minis/tree/main/supabase
 * 2. Deploy Edge Functions: supabase functions deploy auth
 * 3. Deploy Edge Functions: supabase functions deploy get-api-key
 * 4. Create a table named 'api_keys' in your Supabase database
 * 5. Add your Supabase URL to .env: VITE_SUPABASE_URL=https://your-project.supabase.co
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

if (!SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL not configured. Supabase features will be disabled.')
}

interface ApiKey {
  id: string
  key_name: string
  key_value: string
  created_at: string
}

/**
 * Fetch an API key from Supabase Edge Function
 */
export async function getApiKey(keyName: string, jwt: string): Promise<string | null> {
  if (!SUPABASE_URL) {
    console.log('[Supabase] URL not configured, skipping fetch')
    return null
  }

  if (!jwt) {
    console.log('[Supabase] No JWT provided, cannot fetch API key')
    return null
  }

  try {
    console.log(`[Supabase] Fetching API key: ${keyName}`)

    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({ keyName }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Supabase] Error fetching API key:', error)
      return null
    }

    const { keyValue } = await response.json()
    console.log(`[Supabase] Successfully fetched API key: ${keyName}`)
    return keyValue
  } catch (error) {
    console.error('[Supabase] Failed to fetch API key:', error)
    return null
  }
}

/**
 * Cache for API keys to avoid repeated Supabase calls
 */
const apiKeyCache = new Map<string, string>()

/**
 * Get API key with caching
 */
export async function getCachedApiKey(keyName: string, jwt: string): Promise<string | null> {
  // Check cache first
  if (apiKeyCache.has(keyName)) {
    console.log(`[Supabase] Using cached API key: ${keyName}`)
    return apiKeyCache.get(keyName) || null
  }

  // Fetch from Supabase Edge Function
  const key = await getApiKey(keyName, jwt)

  if (key) {
    apiKeyCache.set(keyName, key)
    console.log(`[Supabase] Cached API key: ${keyName}`)
  }

  return key
}
