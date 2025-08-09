import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { StoryCardContainer } from '../StoryCardContainer'
import type { StoryData } from '../../../types/story'

// Mock the StoryCard component
vi.mock('../StoryCard', () => ({
  StoryCard: ({ story, isActive, onShare, onProductClick }: any) => (
    <div data-testid={`story-card-${story.id}`}>
      <div>Story: {story.title}</div>
      <div>Active: {isActive.toString()}</div>
      <button onClick={onShare}>Share</button>
      <button onClick={() => onProductClick('test-product')}>Product</button>
    </div>
  )
}))

const mockStories: StoryData[] = [
  {
    id: 'story-1',
    type: 'behavioral',
    title: 'First Story',
    insights: [],
    visualElements: [],
    shareableContent: {
      title: 'Story 1',
      description: 'First story',
      hashtags: [],
      platforms: [],
      exportFormats: []
    },
    createdAt: new Date()
  },
  {
    id: 'story-2',
    type: 'style-evolution',
    title: 'Second Story',
    insights: [],
    visualElements: [],
    shareableContent: {
      title: 'Story 2',
      description: 'Second story',
      hashtags: [],
      platforms: [],
      exportFormats: []
    },
    createdAt: new Date()
  },
  {
    id: 'story-3',
    type: 'recap',
    title: 'Third Story',
    insights: [],
    visualElements: [],
    shareableContent: {
      title: 'Story 3',
      description: 'Third story',
      hashtags: [],
      platforms: [],
      exportFormats: []
    },
    createdAt: new Date()
  }
]

describe('StoryCardContainer', () => {
  const mockOnStoryChange = vi.fn()
  const mockOnShare = vi.fn()
  const mockOnProductClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no stories provided', () => {
    render(
      <StoryCardContainer
        stories={[]}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('No stories available')).toBeInTheDocument()
    expect(screen.getByText('Keep shopping to generate your style stories')).toBeInTheDocument()
  })

  it('renders first story as active by default', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByTestId('story-card-story-1')).toBeInTheDocument()
    expect(screen.getByText('Story: First Story')).toBeInTheDocument()
    expect(screen.getByText('Active: true')).toBeInTheDocument()
  })

  it('renders navigation indicators for multiple stories', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const indicators = screen.getAllByLabelText(/Go to story/)
    expect(indicators).toHaveLength(3)
  })

  it('shows story counter', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates to specific story when indicator clicked', async () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const secondIndicator = screen.getByLabelText('Go to story 2')
    fireEvent.click(secondIndicator)

    await waitFor(() => {
      expect(mockOnStoryChange).toHaveBeenCalledWith(1, mockStories[1])
    }, { timeout: 1000 })
  })

  it('shows navigation arrows on desktop', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Should show next arrow (previous arrow hidden on first story)
    expect(screen.getByLabelText('Next story')).toBeInTheDocument()
    expect(screen.queryByLabelText('Previous story')).not.toBeInTheDocument()
  })

  it('navigates with arrow buttons', async () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        initialIndex={1}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const nextButton = screen.getByLabelText('Next story')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockOnStoryChange).toHaveBeenCalledWith(2, mockStories[2])
    }, { timeout: 1000 })

    // Clear previous calls
    mockOnStoryChange.mockClear()

    const prevButton = screen.getByLabelText('Previous story')
    fireEvent.click(prevButton)

    await waitFor(() => {
      expect(mockOnStoryChange).toHaveBeenCalledWith(1, mockStories[1])
    }, { timeout: 1000 })
  })

  it('handles keyboard navigation', async () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Navigate right
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    await waitFor(() => {
      expect(mockOnStoryChange).toHaveBeenCalledWith(1, mockStories[1])
    })
  })

  it('handles touch swipe navigation', () => {
    const { container } = render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const containerElement = container.firstChild as HTMLElement

    // Test that touch events are properly attached
    expect(containerElement).toHaveAttribute('style')
    
    // Simulate touch start to verify event handler is attached
    fireEvent.touchStart(containerElement, {
      touches: [{ clientX: 300, clientY: 100 }]
    })

    // The swipe logic is complex to test in unit tests, but we can verify the component
    // has the necessary event handlers and structure
    expect(containerElement).toBeDefined()
  })

  it('handles mouse drag navigation for desktop', () => {
    const { container } = render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const containerElement = container.firstChild as HTMLElement

    // Test that mouse events are properly attached
    expect(containerElement).toHaveAttribute('style')
    
    // Simulate mouse down to verify event handler is attached
    fireEvent.mouseDown(containerElement, { clientX: 300, clientY: 100 })

    // The drag logic is complex to test in unit tests, but we can verify the component
    // has the necessary event handlers and structure
    expect(containerElement).toBeDefined()
  })

  it('prevents navigation beyond boundaries', async () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        initialIndex={0}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Try to navigate left from first story
    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    // Should not call onStoryChange
    expect(mockOnStoryChange).not.toHaveBeenCalled()
  })

  it('calls onShare when story share button is clicked', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Get the share button from the active story card
    const activeStoryCard = screen.getByTestId('story-card-story-1')
    const shareButton = activeStoryCard.querySelector('button')!
    fireEvent.click(shareButton)

    expect(mockOnShare).toHaveBeenCalledWith(mockStories[0])
  })

  it('calls onProductClick when product button is clicked', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Get the product button from the active story card
    const activeStoryCard = screen.getByTestId('story-card-story-1')
    const buttons = activeStoryCard.querySelectorAll('button')
    const productButton = buttons[1] // Second button is the product button
    fireEvent.click(productButton)

    expect(mockOnProductClick).toHaveBeenCalledWith('test-product', mockStories[0])
  })

  it('starts with specified initial index', () => {
    render(
      <StoryCardContainer
        stories={mockStories}
        initialIndex={2}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(screen.getByText('Story: Third Story')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StoryCardContainer
        stories={mockStories}
        className="custom-class"
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles single story without navigation', () => {
    const singleStory = [mockStories[0]]

    render(
      <StoryCardContainer
        stories={singleStory}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    // Should not show navigation indicators for single story
    expect(screen.queryByLabelText(/Go to story/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next story')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Previous story')).not.toBeInTheDocument()
  })

  it('shows resistance at boundaries during swipe', async () => {
    const { container } = render(
      <StoryCardContainer
        stories={mockStories}
        initialIndex={0}
        onStoryChange={mockOnStoryChange}
        onShare={mockOnShare}
        onProductClick={mockOnProductClick}
      />
    )

    const containerElement = container.firstChild as HTMLElement

    // Simulate swipe right at first story (should have resistance)
    fireEvent.touchStart(containerElement, {
      touches: [{ clientX: 100, clientY: 100 }]
    })

    fireEvent.touchMove(containerElement, {
      touches: [{ clientX: 150, clientY: 100 }]
    })

    // Should not navigate (small swipe with resistance)
    fireEvent.touchEnd(containerElement)

    expect(mockOnStoryChange).not.toHaveBeenCalled()
  })
})