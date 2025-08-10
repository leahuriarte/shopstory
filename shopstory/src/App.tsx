import {StoryView} from './components/StoryView'

export function App() {
  // The list of stories to be displayed.
  // Each object in the array represents a story, and its 'screens' property is an array of screen components.
  // For now, we are just passing empty screen objects to render the placeholders.
  const stories = [
    {
      id: 'story-1',
      screens: [{}, {}, {}], // This story will have 3 screens.
    },
    {
      id: 'story-2',
      screens: [{}, {}], // This story will have 2 screens.
    },
    {
      id: 'story-3',
      screens: [{}, {}, {}, {}], // This story will have 4 screens.
    },
  ]

  return <StoryView stories={stories} />
}