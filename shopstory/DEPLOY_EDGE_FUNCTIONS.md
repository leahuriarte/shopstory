# Deploy Supabase Edge Functions

Quick guide to deploy the Edge Functions for Gemini API calls.

## Prerequisites

Install Supabase CLI (if not already installed):
```bash
brew install supabase/tap/supabase
```

## Step 1: Login and Link Project

```bash
cd /Users/leahuriarte/shopstory/shopstory

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref eruawxwkcljkayxnyshe
```

## Step 2: Set Environment Secret

Set your Gemini API key as a secret (this keeps it secure on the server):

```bash
```

## Step 3: Deploy the Edge Function

```bash
supabase functions deploy analyze-gemini
```

## Step 4: Verify Deployment

Test the function with your anon key:

You should get a response like:
```json
{
  "success": true,
  "data": "Hello there, how are you?"
}
```

## Step 5: Update Your .env (Already Done)

Your `.env` should have:

**Note**: The anon key is safe to use in client-side code - it's designed for this purpose.

## That's It!

Your app will now:
1. Call Supabase Edge Function instead of Gemini directly
2. Edge Function handles the Gemini API call with your secure API key
3. No more CSP errors!
4. API key stays secure on the server

## Troubleshooting

If you get errors, check the function logs:
```bash
supabase functions logs analyze-gemini
```

Or view them in Supabase Dashboard → Edge Functions → analyze-gemini → Logs
