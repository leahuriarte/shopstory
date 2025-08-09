export interface BookPage {
  id: number
  title: string
  content: string
  image?: string
  type?: 'title' | 'stats' | 'products' | 'action'
  specialData?: any
}

export const shopWrappedPages: BookPage[] = [
  {
    id: 1,
    type: 'title',
    title: "Maya's 2024 Shop Wrapped",
    content: "Your year of amazing discoveries\nand style adventures awaits...",
    specialData: {
      personName: "Maya",
      year: "2024",
      totalOrders: 47,
      totalSpent: "$2,847"
    }
  },
  {
    id: 2,
    type: 'stats',
    title: "Your Shopping Journey",
    content: "This year you made 47 orders\nand discovered 23 new brands!\n\nYou spent the most in:\n🛍️ Fashion & Apparel\n🏠 Home & Living\n💄 Beauty & Wellness",
    specialData: {
      orders: 47,
      newBrands: 23,
      topCategories: ["Fashion & Apparel", "Home & Living", "Beauty & Wellness"]
    }
  },
  {
    id: 3,
    type: 'stats',
    title: "Top 5 Stores You Love",
    content: "Your favorite shopping destinations:\n\n🥇 Aesthetic Apparel Co.\n🥈 Minimalist Home Studio\n🥉 Sustainable Beauty Bar\n4️⃣ Vintage Finds Boutique\n5️⃣ Cozy Corner Crafts",
    specialData: {
      topStores: [
        { name: "Aesthetic Apparel Co.", orders: 12 },
        { name: "Minimalist Home Studio", orders: 8 },
        { name: "Sustainable Beauty Bar", orders: 7 },
        { name: "Vintage Finds Boutique", orders: 6 },
        { name: "Cozy Corner Crafts", orders: 5 }
      ]
    }
  },
  {
    id: 4,
    type: 'stats',
    title: "Maya's Style DNA",
    content: "Your most-loved clothing items:\n\n✨ Oversized Blazers (4 purchased)\n👕 Vintage Band Tees (6 purchased)\n👖 High-Waisted Jeans (3 pairs)\n🧥 Sustainable Sweaters (5 purchased)\n👟 Minimalist Sneakers (2 pairs)",
    specialData: {
      styleProfile: "Modern Vintage Minimalist",
      topItems: [
        { item: "Oversized Blazers", count: 4 },
        { item: "Vintage Band Tees", count: 6 },
        { item: "High-Waisted Jeans", count: 3 },
        { item: "Sustainable Sweaters", count: 5 },
        { item: "Minimalist Sneakers", count: 2 }
      ]
    }
  },
  {
    id: 5,
    type: 'stats',
    title: "Shopping Superpowers",
    content: "🌱 Eco-Conscious Shopper\n95% of purchases from sustainable brands\n\n🎯 Deal Hunter Extraordinaire\nSaved $485 with smart shopping\n\n🌟 Trendsetter Status\nBought 12 items before they went viral",
    specialData: {
      sustainablePercent: 95,
      totalSaved: 485,
      trendingItems: 12
    }
  },
  {
    id: 6,
    type: 'action',
    title: "Discover More Like Maya",
    content: "Ready to continue your style journey?\n\nExplore curated picks that match your taste:",
    specialData: {
      actionType: 'product_recommendations',
      buttonText: 'Shop Your Style'
    }
  }
] 