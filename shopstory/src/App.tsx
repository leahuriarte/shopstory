import {StoryView} from './components/StoryView'

/**
 * The main App component.
 * Its purpose is to define the sequence of stories and screens.
 * The actual rendering and data fetching is handled by the components.
 */
export function App() {
  const stories = [
    {
      id: 'story-1',
      screens: [
        {
          type: 'title' as const,
          imageUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTEzXzUpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTEzXzUiIHgxPSIwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iNDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N0VFQSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRCQTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
        },
        // {
        //   type: 'color' as const,
        //   value: 'bg-blue-500',
        //   text: 'Welcome!',
        // },
        // {
        //   type: 'color' as const,
        //   value: 'bg-green-500',
        //   text: 'Check out our popular products next!',
        // },
        // // This screen will render the PopularProductsScreen component.
        // // It doesn't need any extra data because the component fetches its own.
        // {
        //   type: 'popularProducts' as const,
        // },
        {
          type: 'aesthetics' as const,
        },
        // Carbon footprint analysis screen - analyzes saved products with AI
        {
          type: 'carbonFootprint' as const,
        },
        {
          type: 'color' as const,
          value: 'bg-purple-500',
          text: 'Discover your top brands!',
        },
        // This screen will render the TopBrandsScreen component.
        {
          type: 'topBrands' as const,
        },
        {
          type: 'color' as const,
          value: 'bg-gradient-to-br from-purple-500 to-pink-500',
          text: 'Now let\'s explore your color palette!',
        },
        // This screen will render the PaletteScreen component - analyzes color trends from saved products
        {
          type: 'palette' as const,
        },
        // {
        //   type: 'color' as const,
        //   value: 'bg-green-500',
        //   text: 'Supporting small businesses matters!',
        // },
        // Small business analysis screen - identifies and shows small businesses from saved products
        {
          type: 'smallBusiness' as const,
        },
        {
          type: 'color' as const,
          value: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          text: 'Time to check your shipping analytics!',
        },
        // Shipping time analysis screen - shows cumulative shipping data and fastest/slowest deliveries
        {
          type: 'shippingTime' as const,
        },
        {
          type: 'recommendations' as const,
        },
        // Share screen - allows users to select and share screens on social media
        {
          type: 'share' as const,
        },
      ],
    },
  ]

  return <StoryView stories={stories} />
}