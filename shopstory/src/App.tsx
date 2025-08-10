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
            'https://media.istockphoto.com/id/1293996796/photo/white-paper-texture-background.jpg?s=612x612&w=0&k=20&c=rm1tkR4vvYScql1xyWWywF4h5vKQgHFurlJyieJAESw=',
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
      ],
    },
  ]

  return <StoryView stories={stories} />
}