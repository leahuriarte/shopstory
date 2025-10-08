# Supabase Edge Functions Setup for Shop Minis

This guide follows the official Shopify Shop Minis Supabase integration pattern:
https://github.com/Shopify/shop-minis/tree/main/supabase

## Prerequisites

1. Install Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd /Users/leahuriarte/shopstory/shopstory
   supabase link --project-ref eruawxwkcljkayxnyshe
   ```

## Step 1: Generate JWT Secret

Generate a secure 256-bit secret key:

```bash
openssl rand -base64 32
```

Save this value - you'll need it for the next step.

## Step 2: Set Supabase Secrets

```bash
# Set JWT secret
supabase secrets set JWT_SECRET=your-generated-secret-from-step-1

# Set Shop Minis API key
```

## Step 3: Deploy Edge Functions

```bash
# Deploy auth function
supabase functions deploy auth --no-verify-jwt

# Deploy get-api-key function
supabase functions deploy get-api-key --no-verify-jwt
```

## Step 4: Update Environment Variables

Your `.env` file should have:

## How It Works

### Authentication Flow

1. Mini app uses `useAuth()` hook to get Shop Minis token
2. Token is sent to `/auth` Edge Function
3. Edge Function verifies token with Shopify Admin API
4. Returns a JWT valid for 7 days
5. JWT is stored securely in localStorage

### API Key Access

1. Mini app calls Gemini service
2. Gemini service requests API key from `/get-api-key` Edge Function
3. Edge Function verifies JWT
4. Returns API key from Supabase database
5. Key is cached in memory

## Current Status

**For now, the app uses the environment variable fallback** (`VITE_GEMINI_API_KEY`) because:
1. It's simpler for development
2. No JWT authentication required
3. Works immediately without Edge Functions

**To enable full Supabase integration:**
1. Complete the setup steps above
2. The app will automatically use Edge Functions when JWT is available
3. Environment variable serves as fallback

## Security Benefits of Edge Functions

- API keys never exposed to client
- JWT-based authentication
- Secure server-side storage
- Token expiration
- Stateless architecture
