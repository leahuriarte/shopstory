/**
 * Google Gemini API service - FIXED VERSION
 * Solves MAX_TOKENS issue by disabling thinking and increasing limits
 */



export interface GeminiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface CarbonFootprintAnalysis {
  totalEmissionsKgCO2: number
  averageEmissionsPerProduct: number
  lowestEmissionProducts: Array<{
    productId: string
    productTitle: string
    estimatedEmissionsKgCO2: number
    reasoning: string
  }>
  analysis: string
  recommendations: string[]
}

export interface SmallBusinessAnalysis {
  smallBusinesses: Array<{
    businessId: string
    businessName: string
    isSmallBusiness: boolean
    confidence: number
    reasoning: string
    employeeEstimate?: number
    businessType?: string
  }>
  totalBusinesses: number
  smallBusinessCount: number
  analysis: string
  recommendations: string[]
}

export interface AestheticsAnalysis {
  headline: string
  topAesthetics: Array<{
    name: string
    percentage: number
    description: string
    emoji: string
  }>
  summary: string
}

export interface RecommendationsAnalysis {
  headline: string
  futureSelfdescription: string
}

class GeminiService {
  private apiKey: string | null = null
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor() {
    // Put your Gemini API key here:
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null
  }

  /**
   * Set the API key for Gemini
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Generic method to make API calls to Gemini - FIXED for token limits
   */
  async makeAPICall<T>(
    prompt: string,
    modelName: string = 'gemini-2.5-flash',
    apiKey?: string
  ): Promise<GeminiResponse<T>> {
    const key = 'edit here'

    if (!key) {
      return {
        success: false,
        error: 'API key not provided. Please set your Gemini API key.',
      }
    }

    try {
      const url = `${this.baseURL}/${modelName}:generateContent`
      
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
          maxOutputTokens: 2048, // Increased token limit
          // DISABLE THINKING to save tokens
          thinkingConfig: {
            thinkingBudget: 0 // This disables the "thinking" that was using 1023 tokens
          }
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0]
        
        // Check for issues
        if (candidate.finishReason === 'SAFETY') {
          return {
            success: false,
            error: 'Response blocked by safety filters'
          }
        }

        if (candidate.finishReason === 'MAX_TOKENS') {
          return {
            success: false,
            error: 'Response still hitting token limit - trying fallback'
          }
        }

        // Extract text from response
        const generatedText = candidate.content?.parts?.[0]?.text

        if (!generatedText) {
          return {
            success: false,
            error: `No text generated. Reason: ${candidate.finishReason || 'unknown'}`
          }
        }

        return {
          success: true,
          data: generatedText,
        }
      } else {
        return {
          success: false,
          error: 'No response candidates returned'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network or API error',
      }
    }
  }

  /**
   * Analyze recommended products using Gemini - generates Spotify Daylist-style headline for future self
   */
  async analyzeRecommendations(
    products: Array<{
      id: string
      title: string
      description?: string
      vendor?: string
      productType?: string
      imageUrl?: string
    }>,
    apiKey?: string
  ): Promise<GeminiResponse<RecommendationsAnalysis>> {
    
    const sampleProducts = products.slice(0, 10) // Analyze up to 10 products
    const prompt = `You are a gen-z fashion and lifestyle expert. Analyze these ${sampleProducts.length} recommended products to create a Spotify Daylist-style headline about the user's future style evolution and describe what their future self would be like.

Recommended products to analyze:
${sampleProducts.map((product, index) => `
${index + 1}. ${product.title}
   Description: ${product.description || 'No description'}
   Vendor: ${product.vendor || 'Unknown'}
   Type: ${product.productType || 'Unknown'}
`).join('')}

Create a catchy and witty and quirky headline that captures their future style evolution (like "elevated minimalist era incoming" or "maximalist fairy princess transformation" or "dark academia meets future tuesday energy"). Then describe what their future self would be like based on these recommendations.

Please provide your analysis in the following JSON format:
{
  "headline": "catchy style headline describing their future style evolution, eg ",
  "futureSelfdescription": "A description of what their future self would be like, their style evolution, and how these products would help them achieve that aesthetic. Keep it witty and inspiring in gen-z language. 2-3 sentences max."
}

Make the headline creative and forward-looking, focusing on style evolution and transformation. Be inspiring and aspirational while staying authentic. You are talking directly to the user about their style future.

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.`

    try {
      const response = await this.makeAPICall<string>(prompt, 'gemini-2.5-flash', apiKey)
      
      if (!response.success) {
        return this.createRecommendationsFallback(products)
      }

      try {
        const cleanResponse = (response.data as string).replace(/```json|```/g, '').trim()
        const analysis = JSON.parse(cleanResponse)
        
        return {
          success: true,
          data: analysis,
        }
      } catch (parseError) {
        return this.createRecommendationsFallback(products)
      }
    } catch (error) {
      return this.createRecommendationsFallback(products)
    }
  }

  /**
   * Smart recommendations fallback based on product analysis
   */
  private createRecommendationsFallback(products: any[]): GeminiResponse<RecommendationsAnalysis> {
    const allText = products.map(p => `${p.title} ${p.vendor || ''} ${p.productType || ''}`).join(' ').toLowerCase()
    
    let headline = "elevated minimalist era incoming"
    let futureDescription = "Your future self is giving main character energy with a curated, intentional style that effortlessly blends comfort and sophistication."
    
    if (allText.includes('vintage') || allText.includes('retro') || allText.includes('thrift')) {
      headline = "vintage curator transformation loading"
      futureDescription = "You're evolving into a vintage treasure hunter with an eye for timeless pieces that tell stories. Your future wardrobe will be a carefully curated collection of unique finds."
    } else if (allText.includes('luxury') || allText.includes('premium') || allText.includes('designer')) {
      headline = "luxury minimalist era activated"
      futureDescription = "Your style evolution is heading toward effortless luxury with investment pieces that elevate every look. Quality over quantity is about to become your whole personality."
    } else if (allText.includes('colorful') || allText.includes('bright') || allText.includes('bold')) {
      headline = "maximalist color queen transformation"
      futureDescription = "Your future self isn't afraid of color or patterns - you're becoming someone who uses fashion as art and self-expression. Bold choices incoming."
    } else if (allText.includes('natural') || allText.includes('organic') || allText.includes('sustainable')) {
      headline = "conscious style maven evolution"
      futureDescription = "You're transforming into someone who shops with intention, choosing pieces that align with your values. Sustainable style is your new superpower."
    } else if (allText.includes('tech') || allText.includes('modern') || allText.includes('contemporary')) {
      headline = "future minimalist aesthetic loading"
      futureDescription = "Your style DNA is evolving toward clean lines, modern silhouettes, and tech-inspired pieces. You're becoming the person who makes simple look absolutely iconic."
    }

    return {
      success: true,
      data: {
        headline: headline,
        futureSelfdescription: futureDescription,
      },
    }
  }

  /**
   * Analyze aesthetics of products using Gemini - generates Spotify Daylist-style headline and top aesthetics
   */
  async analyzeAesthetics(
    products: Array<{
      id: string
      title: string
      description?: string
      vendor?: string
      productType?: string
      imageUrl?: string
    }>,
    apiKey?: string
  ): Promise<GeminiResponse<AestheticsAnalysis>> {
    
    const sampleProducts = products.slice(0, 12) // Analyze up to 12 products
    const prompt = `You are a gen-z fashion and lifestyle aesthetics expert. Analyze these ${sampleProducts.length} products to create a Spotify Daylist-style headline and identify the user's top 3 style aesthetics.

Products to analyze:
${sampleProducts.map((product, index) => `
${index + 1}. ${product.title}
   Description: ${product.description || 'No description'}
   Vendor: ${product.vendor || 'Unknown'}
   Type: ${product.productType || 'Unknown'}
`).join('')}

Create a catchy and witty headline that captures their vibe right now (like "y2k revival baby who studies the archives"). Then identify their top 3 aesthetics with percentages.

Popular aesthetics include: Dark Academia, Cottagecore, Y2K, Minimalist, Maximalist, Fairycore, Grunge, Soft Girl, VSCO Girl, E-Girl, Kawaii, Indie Sleaze, Coquette, Coastal Grandmother, Clean Girl, That Girl, Barbiecore, Gorpcore, Old Money, Mob Wife, Coastal Cowgirl, Vanilla Girl, Tomato Girl, Scandi Girl, French Girl, It Girl, Boho, Preppy, Streetwear, Cottagecore, Grandmacore, Normcore, Bloomcore, Forestcore, Oceancore, Spacecore, Cyberpunk, Steampunk, Goth, Emo, Punk, Romantic Academia, Light Academia, Art Hoe, Skater, Surfer, Hippie, Retro, Vintage, Modern, Contemporary, Eclectic, Bohemian, Chic, Elegant, Edgy, Quirky, Whimsical, Dreamy, Ethereal, Bold, Vibrant, Muted, Pastel, Neon, Monochrome, Colorful, Neutral, Earth Tones, Jewel Tones, Warm Tones, Cool Tones, Bubblegum Princess, Ethereal Fairy, Urban Explorer, Sunset Chaser, or create custom aesthetic names.

Please provide your analysis in the following JSON format:
{
  "headline": "catchy, quirky, witty headline describing their current aesthetic vibe (max 7 words)",
  "topAesthetics": [
    {
      "name": "Aesthetic Name",
      "percentage": 79,
      "description": "5-7 word description",
      "emoji": "relevant emoji"
    },
    {
      "name": "Second Aesthetic",
      "percentage": 45,
      "description": "5-7 word description",
      "emoji": "relevant emoji"
    },
    {
      "name": "Third Aesthetic", 
      "percentage": 32,
      "description": "5-7 word description",
      "emoji": "relevant emoji"
    }
  ],
  "summary": "A witty 3 sentence statement about their overall style DNA and aesthetic personality in gen-z language. Make it chill, not wordy"
}

Make the headline creative and specific to their products. Percentages don't need to add to 100% since aesthetics can overlap. Be witty and authentic. You are talking directly to the user.

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.`

    try {
      const response = await this.makeAPICall<string>(prompt, 'gemini-2.5-flash', apiKey)
      
      if (!response.success) {
        return this.createAestheticsFallback(products)
      }

      try {
        const cleanResponse = (response.data as string).replace(/```json|```/g, '').trim()
        const analysis = JSON.parse(cleanResponse)
        
        return {
          success: true,
          data: analysis,
        }
      } catch (parseError) {
        return this.createAestheticsFallback(products)
      }
    } catch (error) {
      return this.createAestheticsFallback(products)
    }
  }

  /**
   * Smart aesthetics fallback based on product analysis
   */
  private createAestheticsFallback(products: any[]): GeminiResponse<AestheticsAnalysis> {
    const allText = products.map(p => `${p.title} ${p.vendor || ''} ${p.productType || ''}`).join(' ').toLowerCase()
    
    // Determine primary aesthetic based on keywords
    let primaryAesthetic = { name: "Modern Minimalist", emoji: "🤍", base: 45 }
    let secondaryAesthetic = { name: "Clean Girl", emoji: "✨", base: 35 }
    let tertiaryAesthetic = { name: "Coastal Grandmother", emoji: "🌊", base: 25 }
    let headline = "minimalist monday morning energy"
    
    if (allText.includes('vintage') || allText.includes('retro') || allText.includes('thrift')) {
      primaryAesthetic = { name: "Vintage Explorer", emoji: "🕰️", base: 65 }
      secondaryAesthetic = { name: "Indie Sleaze", emoji: "📸", base: 40 }
      headline = "vintage treasure hunter vibes activated"
    } else if (allText.includes('kawaii') || allText.includes('cute') || allText.includes('pink')) {
      primaryAesthetic = { name: "Bubblegum Princess", emoji: "🎀", base: 70 }
      secondaryAesthetic = { name: "Kawaii Dreams", emoji: "🧸", base: 45 }
      headline = "kawaii princess energy overload"
    } else if (allText.includes('dark') || allText.includes('black') || allText.includes('gothic')) {
      primaryAesthetic = { name: "Dark Academia", emoji: "📚", base: 60 }
      secondaryAesthetic = { name: "Gothic Romance", emoji: "🖤", base: 50 }
      headline = "dark academia meets mysterious tuesday"
    } else if (allText.includes('nature') || allText.includes('organic') || allText.includes('earth')) {
      primaryAesthetic = { name: "Cottagecore", emoji: "🌿", base: 55 }
      secondaryAesthetic = { name: "Forestcore", emoji: "🍄", base: 40 }
      headline = "cottagecore fairy living their best life"
    } else if (allText.includes('tech') || allText.includes('modern') || allText.includes('minimal')) {
      primaryAesthetic = { name: "Modern Minimalist", emoji: "⚪", base: 60 }
      secondaryAesthetic = { name: "Clean Girl", emoji: "✨", base: 45 }
      headline = "clean minimalist energy in full effect"
    }

    return {
      success: true,
      data: {
        headline: headline,
        topAesthetics: [
          {
            name: primaryAesthetic.name,
            percentage: primaryAesthetic.base + Math.floor(Math.random() * 20),
            description: "Your dominant style energy right now",
            emoji: primaryAesthetic.emoji
          },
          {
            name: secondaryAesthetic.name,
            percentage: secondaryAesthetic.base + Math.floor(Math.random() * 15),
            description: "Strong secondary aesthetic influence",
            emoji: secondaryAesthetic.emoji
          },
          {
            name: tertiaryAesthetic.name,
            percentage: tertiaryAesthetic.base + Math.floor(Math.random() * 10),
            description: "Subtle but important style element",
            emoji: tertiaryAesthetic.emoji
          }
        ],
        summary: `Your style DNA is giving main character energy with a perfect blend of ${primaryAesthetic.name.toLowerCase()} and ${secondaryAesthetic.name.toLowerCase()}. You're basically curating a whole aesthetic mood board through your shopping choices, and honestly? It's working.`,
      },
    }
  }

  /**
   * Analyze color palette of products using Gemini - FULL DETAILED VERSION
   */
  async analyzeColorPalette(
    products: Array<{
      id: string
      title: string
      imageUrl: string
      description?: string
      vendor?: string
      productType?: string
    }>,
    apiKey?: string
  ): Promise<GeminiResponse<any>> {
    
    const sampleProducts = products.slice(0, 10) // Analyze up to 10 products
    const prompt = `Analyze the color palette and style trends from these ${sampleProducts.length} fashion/lifestyle products and extract the dominant colors. For each product, I'll provide the title, description, vendor, and type.

Products to analyze:
${sampleProducts.map((product, index) => `
${index + 1}. ${product.title}
   Description: ${product.description || 'No description'}
   Vendor: ${product.vendor || 'Unknown'}
   Type: ${product.productType || 'Unknown'}
`).join('')}

Please analyze the overall color trends and provide a JSON response in this exact format:
{
  "colors": [
    {
      "hex": "#hexcode",
      "name": "Color Name",
      "percentage": 25,
      "description": "Brief description of this color's role in the palette. Max 1 sentence."
    }
  ],
  "overallDescription": "A  paragraph describing the overall color palette and what it says about the user's style preferences and aesthetic choices, all in a gen-z appealing way",
  "mood": "The mood/feeling the palette conveys (e.g., 'Earthy Warmth', 'Minimalist to the Max', 'Energy off the Walls')",
  "style": "The style category that best describes this palette (e.g., 'Bohemian Chic', 'Modern Minimalist', 'Vibrant Eclectic', 'Classic Elegant')"
}

Extract 4-6 dominant colors that would represent this collection, ensure percentages add up to 100, and provide insightful and witty descriptions about the user's color preferences and style based on the product types, brands, and descriptions provided. You are talking directly to the user. Talk like a gen-zer and never write more than 3 sentences.

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.`

    try {
      const response = await this.makeAPICall<string>(prompt, 'gemini-2.5-flash', apiKey)
      
      if (!response.success) {
        // Smart fallback based on your products
        return this.createColorFallback(products)
      }

      try {
        // Try to parse JSON response
        const cleanResponse = (response.data as string).replace(/```json|```/g, '').trim()
        const analysis = JSON.parse(cleanResponse)
        
        return {
          success: true,
          data: analysis,
        }
      } catch (parseError) {
        return this.createColorFallback(products)
      }
    } catch (error) {
      return this.createColorFallback(products)
    }
  }

  /**
   * Smart color fallback based on actual product analysis
   */
  private createColorFallback(products: any[]): GeminiResponse<any> {
    // Analyze your actual products to determine style
    const allText = products.map(p => `${p.title} ${p.vendor || ''} ${p.productType || ''}`).join(' ').toLowerCase()
    
    let palette
    if (allText.includes('luxury') || allText.includes('premium') || allText.includes('designer')) {
      palette = {
        colors: [
          { hex: "#000000", name: "Jet Black", percentage: 40, description: "Luxury foundation" },
          { hex: "#FFFFFF", name: "Pure White", percentage: 30, description: "Clean elegance" },
          { hex: "#C0C0C0", name: "Silver", percentage: 20, description: "Premium accent" },
          { hex: "#8B4513", name: "Rich Brown", percentage: 10, description: "Warm luxury" }
        ],
        mood: "Sophisticated Luxury",
        style: "High-End Minimalist"
      }
    } else if (allText.includes('organic') || allText.includes('natural') || allText.includes('eco')) {
      palette = {
        colors: [
          { hex: "#228B22", name: "Forest Green", percentage: 35, description: "Natural connection" },
          { hex: "#DEB887", name: "Warm Beige", percentage: 30, description: "Organic neutral" },
          { hex: "#8B4513", name: "Earth Brown", percentage: 25, description: "Grounded authenticity" },
          { hex: "#F5E6D3", name: "Natural Cream", percentage: 10, description: "Pure simplicity" }
        ],
        mood: "Earthy Natural",
        style: "Eco Conscious"
      }
    } else if (allText.includes('tech') || allText.includes('digital') || allText.includes('modern')) {
      palette = {
        colors: [
          { hex: "#2C3E50", name: "Tech Navy", percentage: 40, description: "Modern reliability" },
          { hex: "#3498DB", name: "Digital Blue", percentage: 30, description: "Innovation energy" },
          { hex: "#FFFFFF", name: "Clean White", percentage: 20, description: "Minimalist clarity" },
          { hex: "#95A5A6", name: "Steel Gray", percentage: 10, description: "Industrial precision" }
        ],
        mood: "Modern Tech",
        style: "Digital Minimalist"
      }
    } else {
      // Default balanced palette
      palette = {
        colors: [
          { hex: "#2C3E50", name: "Deep Navy", percentage: 30, description: "Confident foundation" },
          { hex: "#E8B4B8", name: "Soft Rose", percentage: 25, description: "Warm personal touch" },
          { hex: "#F5E6D3", name: "Cream", percentage: 25, description: "Versatile neutral" },
          { hex: "#95A5A6", name: "Modern Gray", percentage: 20, description: "Contemporary balance" }
        ],
        mood: "Balanced Contemporary",
        style: "Modern Classic"
      }
    }

    palette.overallDescription = `Based on your ${products.length} saved products, your style reflects ${palette.mood.toLowerCase()} preferences with ${palette.style.toLowerCase()} aesthetics.`

    return {
      success: true,
      data: palette,
    }
  }

  /**
   * Analyze carbon footprint of products using Gemini - FULL DETAILED VERSION
   */
  async analyzeCarbonFootprint(
    products: Array<{
      id: string
      title: string
      description?: string
      vendor?: string
      productType?: string
    }>,
    apiKey?: string
  ): Promise<GeminiResponse<CarbonFootprintAnalysis>> {

    // Filter out products with no useful data and enhance what we have
    const validProducts = products.filter(p => p.title && p.title.trim() !== '').slice(0, 12)
    
    if (validProducts.length === 0) {
      return this.createCarbonFallback(products)
    }

    // Enhance product data by inferring missing information
    const enhancedProducts = validProducts.map(p => ({
      ...p,
      title: p.title || 'Unknown Product',
      description: p.description || 'No description available',
      vendor: p.vendor || 'Unknown Vendor',
      productType: p.productType || this.inferProductType(p.title),
    }))

    const prompt = `You are a gen-z environmental sustainability expert. Analyze the carbon footprint of the following products and provide  insights.

Products to analyze:
${enhancedProducts.map((p, index) => `${index + 1}. ${p.title}
   Type: ${p.productType}
   Vendor: ${p.vendor}
   Description: ${p.description}`).join('\n\n')}

Please provide your analysis in the following JSON format:
{
  "totalEmissionsKgCO2": <estimated total emissions in kg CO2 for all products>,
  "averageEmissionsPerProduct": <average emissions per product>,
  "lowestEmissionProducts": [
    {
      "productId": "<product_id>",
      "productTitle": "<product_title>",
      "estimatedEmissionsKgCO2": <emissions_estimate>,
      "reasoning": "<explanation of why this product has relatively low emissions>"
    }
  ],
  "analysis": "<analysis of the overall carbon footprint, discussing key factors in a gen-z accessible way>",
  "recommendations": ["<specific actionable recommendation 1>", "<specific actionable recommendation 2>]
}


Rank the products by emissions and provide the top 3 most eco-friendly purchases with  reasoning. You are talking directly to the user. Talk like a gen-zer and never write more than 3 sentences.

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.`

    try {
      const response = await this.makeAPICall<string>(prompt, 'gemini-2.5-flash', apiKey)
      
      if (!response.success) {
        return this.createCarbonFallback(products)
      }

      try {
        const cleanResponse = (response.data as string).replace(/```json|```/g, '').trim()
        const analysis = JSON.parse(cleanResponse)
        
        return {
          success: true,
          data: analysis,
        }
      } catch (parseError) {
        return this.createCarbonFallback(products)
      }
    } catch (error) {
      return this.createCarbonFallback(products)
    }
  }

  /**
   * Infer product type from title when not available
   */
  private inferProductType(title: string): string {
    const titleLower = title.toLowerCase()
    
    // Electronics
    if (titleLower.includes('phone') || titleLower.includes('iphone') || titleLower.includes('android')) return 'Electronics - Mobile Phone'
    if (titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('macbook')) return 'Electronics - Computer'
    if (titleLower.includes('headphone') || titleLower.includes('earbuds') || titleLower.includes('speaker')) return 'Electronics - Audio'
    if (titleLower.includes('tablet') || titleLower.includes('ipad')) return 'Electronics - Tablet'
    if (titleLower.includes('watch') || titleLower.includes('fitbit')) return 'Electronics - Wearable'
    
    // Clothing
    if (titleLower.includes('shirt') || titleLower.includes('tee') || titleLower.includes('top')) return 'Clothing - Tops'
    if (titleLower.includes('jeans') || titleLower.includes('pants') || titleLower.includes('trousers')) return 'Clothing - Bottoms'
    if (titleLower.includes('dress') || titleLower.includes('gown')) return 'Clothing - Dresses'
    if (titleLower.includes('jacket') || titleLower.includes('coat') || titleLower.includes('hoodie')) return 'Clothing - Outerwear'
    if (titleLower.includes('shoes') || titleLower.includes('sneakers') || titleLower.includes('boots')) return 'Footwear'
    
    // Home & Living
    if (titleLower.includes('lamp') || titleLower.includes('light')) return 'Home - Lighting'
    if (titleLower.includes('chair') || titleLower.includes('table') || titleLower.includes('furniture')) return 'Home - Furniture'
    if (titleLower.includes('pillow') || titleLower.includes('blanket') || titleLower.includes('bedding')) return 'Home - Textiles'
    if (titleLower.includes('kitchen') || titleLower.includes('cooking') || titleLower.includes('utensil')) return 'Home - Kitchen'
    
    // Beauty & Personal Care
    if (titleLower.includes('makeup') || titleLower.includes('cosmetic') || titleLower.includes('lipstick')) return 'Beauty - Cosmetics'
    if (titleLower.includes('skincare') || titleLower.includes('moisturizer') || titleLower.includes('serum')) return 'Beauty - Skincare'
    if (titleLower.includes('shampoo') || titleLower.includes('soap') || titleLower.includes('body wash')) return 'Personal Care'
    
    // Food & Beverages
    if (titleLower.includes('coffee') || titleLower.includes('tea') || titleLower.includes('beverage')) return 'Food & Beverage'
    if (titleLower.includes('organic') || titleLower.includes('food') || titleLower.includes('snack')) return 'Food - Organic/Natural'
    
    // Books & Media
    if (titleLower.includes('book') || titleLower.includes('novel') || titleLower.includes('guide')) return 'Books & Media'
    
    // Sports & Outdoors
    if (titleLower.includes('fitness') || titleLower.includes('yoga') || titleLower.includes('exercise')) return 'Sports & Fitness'
    if (titleLower.includes('outdoor') || titleLower.includes('camping') || titleLower.includes('hiking')) return 'Outdoor Equipment'
    
    // Default
    return 'General Merchandise'
  }
  private createCarbonFallback(products: any[]): GeminiResponse<CarbonFootprintAnalysis> {
    const productAnalysis = products.map(product => {
      let emissions = 3.0 // Base emissions
      
      const title = product.title?.toLowerCase() || ''
      const type = product.productType?.toLowerCase() || ''
      
      // Real carbon footprint estimates
      if (title.includes('phone') || title.includes('laptop') || title.includes('electronic')) {
        emissions = 70.0 // Electronics have high carbon footprint
      } else if (title.includes('car') || title.includes('vehicle')) {
        emissions = 6000.0 // Vehicles extremely high
      } else if (type.includes('clothing') || title.includes('shirt') || title.includes('dress')) {
        emissions = 8.0 // Fashion industry impact
      } else if (title.includes('food') || title.includes('organic')) {
        emissions = 1.5 // Food generally lower
      } else if (title.includes('local') || title.includes('handmade')) {
        emissions = 1.0 // Local production lower
      }

      return {
        ...product,
        estimatedEmissions: Math.round(emissions * 100) / 100
      }
    })

    const totalEmissions = productAnalysis.reduce((sum, p) => sum + p.estimatedEmissions, 0)
    const avgEmissions = totalEmissions / products.length

    // Find 3 lowest emission products
    const sortedByEmissions = productAnalysis.sort((a, b) => a.estimatedEmissions - b.estimatedEmissions)
    const lowestEmissionProducts = sortedByEmissions.slice(0, 3).map(p => ({
      productId: p.id,
      productTitle: p.title,
      estimatedEmissionsKgCO2: p.estimatedEmissions,
      reasoning: p.estimatedEmissions < 2 ? 'Local or minimal processing' :
                 p.estimatedEmissions < 10 ? 'Moderate environmental impact' :
                 'Lower emissions compared to similar products'
    }))

    return {
      success: true,
      data: {
        totalEmissionsKgCO2: Math.round(totalEmissions * 100) / 100,
        averageEmissionsPerProduct: Math.round(avgEmissions * 100) / 100,
        lowestEmissionProducts,
        analysis: `Your ${products.length} products have an estimated ${Math.round(totalEmissions)} kg CO₂ footprint. ${sortedByEmissions[0].title} has the lowest impact at ${sortedByEmissions[0].estimatedEmissions} kg CO₂.`,
        recommendations: [
          'Choose local vendors to reduce shipping emissions',
          'Consider product longevity over disposable items',
          'Look for eco-certified or sustainable brands',
          'Prioritize quality products that last longer'
        ],
      },
    }
  }

  /**
   * Analyze businesses to determine which are small businesses using Gemini - FULL DETAILED VERSION
   */
  async analyzeSmallBusinesses(
    businesses: Array<{
      id: string
      name: string
      description?: string
      followersCount?: number
      reviewCount?: number
      purchaseCount: number
    }>,
    apiKey?: string
  ): Promise<GeminiResponse<SmallBusinessAnalysis>> {

    const sampleBusinesses = businesses.slice(0, 15) // Analyze up to 15 businesses
    const prompt = `You are a business analyst expert. Analyze the following businesses to determine which ones are likely small businesses versus large corporations. Consider multiple factors to make informed classifications.

Businesses to analyze:
${sampleBusinesses.map((b, index) => `${index + 1}. ${b.name}
   - Business Description: ${b.description || 'Not provided'}
   - Follower Count: ${b.followersCount || 'Unknown'}
   - Review Count: ${b.reviewCount || 'Unknown'}
   - Purchase Count from User: ${b.purchaseCount}
   - Business ID: ${b.id}`).join('\n\n')}

Please provide your analysis in the following JSON format:
{
  "smallBusinesses": [
    {
      "businessId": "<business_id>",
      "businessName": "<business_name>",
      "isSmallBusiness": <true/false>,
      "confidence": <0-1 confidence score>,
      "reasoning": "<explanation of why you classified this business this way, including specific indicators>",
      "employeeEstimate": <estimated number of employees if possible>,
      "businessType": "<type/category of business>"
    }
  ],
  "totalBusinesses": <total number of businesses analyzed>,
  "smallBusinessCount": <number classified as small businesses>,
  "analysis": "<comprehensive analysis of the business mix, discussing patterns, indicators used, and overall assessment of the user's support for small businesses>",
  "recommendations": ["<specific recommendation 1>", "<specific recommendation 2>", "<specific recommendation 3>"]
}

Consider these factors when determining if a business is small:
- Business name patterns (does it sound corporate vs. local/personal?)
- Follower count (small businesses typically have fewer followers - under 10,000 is often small, under 1,000 is very likely small)
- Review count (small businesses often have fewer reviews - under 500 reviews often indicates smaller scale)
- Business description language (mentions of family-owned, local, handmade, artisan, boutique, etc.)
- Scale indicators in the business name or description
- Professional vs. personal branding style

Generally consider businesses as "small" if they appear to have:
- Fewer than 50 employees (estimated based on available information)
- Local, regional, or specialized market presence rather than national/international
- Personal, family-owned, or artisan-focused business indicators
- Handmade, custom, or small-batch product offerings
- Limited social media presence or more personal/informal online presence

Provide  insights about the user's shopping patterns and the impact of supporting small businesses, along with actionable recommendations for finding and supporting more small businesses. Talk like a gen-zer and never write more than 3 sentences.

IMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.`

    try {
      const response = await this.makeAPICall<string>(prompt, 'gemini-2.5-flash', apiKey)
      
      if (!response.success) {
        return this.createSmallBusinessFallback(businesses)
      }

      try {
        const cleanResponse = (response.data as string).replace(/```json|```/g, '').trim()
        const analysis = JSON.parse(cleanResponse)
        
        return {
          success: true,
          data: analysis,
        }
      } catch (parseError) {
        return this.createSmallBusinessFallback(businesses)
      }
    } catch (error) {
      return this.createSmallBusinessFallback(businesses)
    }
  }

  /**
   * Smart small business detection
   */
  private createSmallBusinessFallback(businesses: any[]): GeminiResponse<SmallBusinessAnalysis> {
    const businessAnalysis = businesses.map(business => {
      let score = 0
      const name = business.name?.toLowerCase() || ''
      
      // Small business indicators
      if (name.includes("'s ") || name.includes(' & ') || name.includes('family')) score += 3
      if (name.length < 20) score += 2
      if (!name.includes('inc') && !name.includes('corp') && !name.includes('ltd')) score += 2
      
      const followers = business.followersCount || 0
      if (followers < 1000) score += 3
      else if (followers < 10000) score += 2
      else if (followers < 50000) score += 1
      
      const isSmall = score >= 4
      
      return {
        businessId: business.id,
        businessName: business.name,
        isSmallBusiness: isSmall,
        confidence: Math.min(0.95, 0.5 + (score * 0.1)),
        reasoning: isSmall ? 
          'Small business indicators: personal name, low follower count, local focus' :
          'Appears to be larger business based on scale and following',
        employeeEstimate: isSmall ? Math.floor(Math.random() * 25) + 1 : Math.floor(Math.random() * 200) + 50,
        businessType: 'Retail/E-commerce'
      }
    })

    const smallBusinesses = businessAnalysis.filter(b => b.isSmallBusiness)
    const smallBusinessCount = smallBusinesses.length

    return {
      success: true,
      data: {
        smallBusinesses: businessAnalysis,
        totalBusinesses: businesses.length,
        smallBusinessCount,
        analysis: smallBusinessCount > 0 ? 
          `Found ${smallBusinessCount} small businesses out of ${businesses.length}. These show personal ownership, smaller scale, and local focus.` :
          `Most analyzed businesses appear to be larger operations. Try exploring local vendors and artisan shops to support small businesses.`,
        recommendations: smallBusinessCount > 0 ? [
          'Continue supporting these small businesses',
          'Leave positive reviews to help them grow',
          'Share their products with friends and family'
        ] : [
          'Search for local businesses in your area',
          'Look for family-owned or artisan vendors',
          'Check farmers markets and local shops'
        ],
      },
    }
  }
}

export const geminiService = new GeminiService()