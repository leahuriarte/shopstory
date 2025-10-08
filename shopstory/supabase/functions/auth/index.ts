// Follow this guide to set up:
// https://github.com/Shopify/shop-minis/tree/main/supabase

import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing Shop Mini token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token with Shopify Admin API
    const shopMinisApiKey = Deno.env.get('SHOP_MINIS_API_KEY')!
    const verifyResponse = await fetch(
      'https://shopify.dev/shop-minis-admin-api/unstable/verify_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopMinisApiKey,
        },
        body: JSON.stringify({ token }),
      }
    )

    if (!verifyResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid Shop Mini token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verification = await verifyResponse.json()

    // Create JWT
    const jwtSecret = Deno.env.get('JWT_SECRET')!
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    const jwt = await create(
      { alg: 'HS256', typ: 'JWT' },
      {
        userId: verification.userId,
        exp: getNumericDate(60 * 60 * 24 * 7), // 7 days
      },
      key
    )

    return new Response(
      JSON.stringify({ jwt }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
