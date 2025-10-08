// Supabase Edge Function to handle Gemini API calls
// This solves CSP issues and keeps API keys secure

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
    const { prompt, modelName = 'gemini-2.5-flash' } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing prompt parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 1,
        topK: 10,
        topP: 0.5,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    }

    console.log('Calling Gemini API:', { url, promptLength: prompt.length })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gemini API error: ${response.status} ${errorText}`
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]

      // Check for issues
      if (candidate.finishReason === 'SAFETY') {
        return new Response(
          JSON.stringify({ success: false, error: 'Response blocked by safety filters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (candidate.finishReason === 'MAX_TOKENS') {
        return new Response(
          JSON.stringify({ success: false, error: 'Response hit token limit' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Extract text from response
      const generatedText = candidate.content?.parts?.[0]?.text

      if (!generatedText) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `No text generated. Reason: ${candidate.finishReason || 'unknown'}`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data: generatedText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'No response candidates returned' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
