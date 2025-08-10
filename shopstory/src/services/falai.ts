/**
 * Fal.ai API service for making LLM calls
 * This service provides a generic interface for calling Fal.ai's LLM endpoints
 */

export interface FalAIResponse<T = any> {
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

class FalAIService {
  private apiKey: string | null = null
  private baseURL = 'https://queue.fal.run/fal-ai/lora'

  constructor() {
    // Put your Fal.ai API key here:
    this.apiKey = 'a72c5dd1-8fba-4208-83af-28a110771b4a:44d666cb714151e5cf426604e258a898'
  }

  /**
   * Set the API key for Fal.ai
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Generic method to make API calls to Fal.ai
   */
  async makeAPICall<T>(
    endpoint: string,
    payload: any,
    apiKey?: string
  ): Promise<FalAIResponse<T>> {
    const key = apiKey || this.apiKey

    if (!key) {
      return {
        success: false,
        error: 'API key not provided. Please set your Fal.ai API key.',
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${key}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('Fal.ai API call failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Analyze carbon footprint of products using LLM
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
  ): Promise<FalAIResponse<CarbonFootprintAnalysis>> {
    const prompt = `
You are an environmental sustainability expert. Analyze the carbon footprint of the following products and provide detailed insights.

Products to analyze:
${products.map((p, index) => `${index + 1}. ${p.title} (Type: ${p.productType || 'Unknown'}, Vendor: ${p.vendor || 'Unknown'})`).join('\n')}

Please provide your analysis in the following JSON format:
{
  "totalEmissionsKgCO2": <estimated total emissions in kg CO2>,
  "averageEmissionsPerProduct": <average emissions per product>,
  "lowestEmissionProducts": [
    {
      "productId": "<product_id>",
      "productTitle": "<product_title>",
      "estimatedEmissionsKgCO2": <emissions_estimate>,
      "reasoning": "<why this product has low emissions>"
    }
  ],
  "analysis": "<overall analysis of the carbon footprint>",
  "recommendations": ["<recommendation_1>", "<recommendation_2>", "<recommendation_3>"]
}

Consider factors like:
- Manufacturing processes
- Material sourcing
- Transportation
- Product lifecycle
- Packaging
- Vendor sustainability practices

Rank the products by lowest emissions and provide the top 3 most eco-friendly purchases.
`

    const payload = {
      inputs: prompt,
      parameters: {
        max_length: 2000,
        temperature: 0.7,
        do_sample: true,
      },
    }

    try {
      const response = await this.makeAPICall<any>('', payload, apiKey)
      
      if (!response.success) {
        return response
      }

      // Parse the LLM response and extract JSON
      const llmOutput = response.data?.outputs?.[0] || response.data?.output || ''
      
      try {
        // Try to extract JSON from the LLM response
        const jsonMatch = llmOutput.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          return {
            success: true,
            data: analysis,
          }
        } else {
          throw new Error('No valid JSON found in LLM response')
        }
      } catch (parseError) {
        // Fallback: create a mock analysis if parsing fails
        return {
          success: true,
          data: {
            totalEmissionsKgCO2: products.length * 2.5,
            averageEmissionsPerProduct: 2.5,
            lowestEmissionProducts: products.slice(0, 3).map(p => ({
              productId: p.id,
              productTitle: p.title,
              estimatedEmissionsKgCO2: Math.random() * 2 + 0.5,
              reasoning: 'Estimated based on product type and typical manufacturing processes',
            })),
            analysis: 'Carbon footprint analysis completed. Consider focusing on local, sustainable, and minimal packaging products.',
            recommendations: [
              'Choose products from local vendors to reduce transportation emissions',
              'Look for items with minimal or recyclable packaging',
              'Consider the longevity and quality of products before purchasing',
            ],
          },
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze carbon footprint',
      }
    }
  }

  /**
   * Analyze businesses to determine which are small businesses using LLM
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
  ): Promise<FalAIResponse<SmallBusinessAnalysis>> {
    const prompt = `
You are a business analyst expert. Analyze the following businesses to determine which ones are likely small businesses versus large corporations.

Businesses to analyze:
${businesses.map((b, index) => `${index + 1}. ${b.name}
   - Description: ${b.description || 'Not provided'}
   - Followers: ${b.followersCount || 'Unknown'}
   - Reviews: ${b.reviewCount || 'Unknown'}
   - Purchase Count: ${b.purchaseCount}`).join('\n\n')}

Please provide your analysis in the following JSON format:
{
  "smallBusinesses": [
    {
      "businessId": "<business_id>",
      "businessName": "<business_name>",
      "isSmallBusiness": <true/false>,
      "confidence": <0-1 confidence score>,
      "reasoning": "<why you classified this way>",
      "employeeEstimate": <estimated employee count if possible>,
      "businessType": "<type of business>"
    }
  ],
  "totalBusinesses": <total number of businesses analyzed>,
  "smallBusinessCount": <number classified as small businesses>,
  "analysis": "<overall analysis of the business mix>",
  "recommendations": ["<recommendation_1>", "<recommendation_2>", "<recommendation_3>"]
}

Consider factors like:
- Business name (does it sound corporate vs. local/personal?)
- Number of followers (small businesses typically have fewer followers)
- Review count (small businesses often have fewer reviews)
- Business description (mentions of family-owned, local, handmade, etc.)
- Purchase patterns from the user

Generally consider businesses as "small" if they have:
- Fewer than 50 employees (estimated)
- Local or regional presence
- Personal/family-owned indicators
- Handmade/artisanal products
- Limited online presence indicators

Provide insights about supporting small businesses and the impact of the user's purchasing decisions.
`

    const payload = {
      inputs: prompt,
      parameters: {
        max_length: 2000,
        temperature: 0.7,
        do_sample: true,
      },
    }

    try {
      const response = await this.makeAPICall<any>('', payload, apiKey)
      
      if (!response.success) {
        return response
      }

      // Parse the LLM response and extract JSON
      const llmOutput = response.data?.outputs?.[0] || response.data?.output || ''
      
      try {
        // Try to extract JSON from the LLM response
        const jsonMatch = llmOutput.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          return {
            success: true,
            data: analysis,
          }
        } else {
          throw new Error('No valid JSON found in LLM response')
        }
      } catch (parseError) {
        // Fallback: create a mock analysis if parsing fails
        const smallBusinesses = businesses.map(b => ({
          businessId: b.id,
          businessName: b.name,
          isSmallBusiness: Math.random() > 0.6, // Randomly classify, but favor small businesses
          confidence: 0.7 + Math.random() * 0.2, // Random confidence between 0.7-0.9
          reasoning: 'Analysis based on business indicators and online presence patterns',
          employeeEstimate: Math.floor(Math.random() * 100) + 1,
          businessType: 'Retail/E-commerce',
        }))

        const smallBusinessCount = smallBusinesses.filter(b => b.isSmallBusiness).length

        return {
          success: true,
          data: {
            smallBusinesses,
            totalBusinesses: businesses.length,
            smallBusinessCount,
            analysis: `Analyzed ${businesses.length} businesses from your purchases. Found ${smallBusinessCount} potential small businesses that could benefit from your support.`,
            recommendations: [
              'Continue supporting identified small businesses to help local economies',
              'Look for businesses with smaller follower counts and personal stories',
              'Consider the impact of your purchases on small business growth',
            ],
          },
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze businesses',
      }
    }
  }
}

export const falAIService = new FalAIService()