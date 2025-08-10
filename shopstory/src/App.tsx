import { StoryView } from './components/StoryView'
import { DataProvider } from './contexts/DataContext'

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
        {
          type: 'aesthetics' as const,
        },
        {
          type: 'topBrands' as const,
        },
        {
          type: 'palette' as const,
        },
        {
          type: 'color' as const,
          value: 'bg-gradient-to-br from-purple-500 to-pink-500',
          text: 'Earth is having a moment rn',
        },
        {
          type: 'carbonFootprint' as const,
        },
        {
          type: 'smallBusiness' as const,
        },
        {
          type: 'color' as const,
          value: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          text: 'Your shipping stats are kinda fire',
        },
        {
          type: 'shippingTime' as const,
        },
        {
          type: 'recommendations' as const,
        },
        {
          type: 'share' as const,
        },
      ],
    },
  ]

  return (
    <DataProvider>
      <StoryView stories={stories} />
    </DataProvider>
  )
}