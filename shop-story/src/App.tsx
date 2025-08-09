import React, { useState, Suspense } from 'react'
import { StoryCardContainer } from './components/story'
import { 
  BottomNavigation, 
  Header, 
  AppShellLoader, 
  ProfileView, 
  ShopView,
  ErrorBoundary,
  type NavigationTab 
} from './components/ui'
import { useRealStoryData } from './hooks/useRealStoryData'
import type { StoryData } from './types/story'

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('stories')
  const [isLoading, setIsLoading] = useState(false)
  
  // Get real story data from Shop Minis hooks
  const { stories: realStories, loading: storiesLoading, error: storiesError } = useRealStoryData()

  const handleStoryChange = (index: number, story: StoryData) => {
    console.log('Story changed to:', story.title)
  }

  const handleShare = (story: StoryData) => {
    console.log('Sharing story:', story.title)
    // In a real app, this would open the share modal
  }

  const handleProductClick = (productId: string, story: StoryData) => {
    console.log('Product clicked:', productId, 'from story:', story.title)
    // In a real app, this would navigate to the product
  }

  const handleProfileClick = () => {
    setActiveTab('profile')
  }

  const handleSettingsClick = () => {
    console.log('Settings clicked')
    // In a real app, this would open settings modal or navigate to settings
  }

  const handleTabChange = (tab: NavigationTab) => {
    setIsLoading(true)
    setActiveTab(tab)
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300)
  }

  const renderContent = () => {
    if (isLoading || storiesLoading) {
      return <AppShellLoader variant={activeTab} />
    }

    // Show error state if stories failed to load
    if (storiesError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center">
          <div className="text-center text-white p-6">
            <h2 className="text-xl font-bold mb-2">Unable to Load Stories</h2>
            <p className="text-gray-300 mb-4">{storiesError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'stories':
        return (
          <div className="h-screen bg-black flex items-center justify-center">
            <Header 
              title="Your Stories" 
              variant="transparent"
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              className="fixed top-0 left-0 right-0 z-10"
            />
            <div className="w-full max-w-sm mx-auto">
              {realStories.length > 0 ? (
                <div style={{ aspectRatio: '9/16', height: '80vh' }}>
                  <StoryCardContainer
                    stories={realStories}
                    onStoryChange={handleStoryChange}
                    onShare={handleShare}
                    onProductClick={handleProductClick}
                  />
                </div>
              ) : (
                <div className="text-center text-white p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Building Your Stories</h3>
                  <p className="text-gray-300 text-sm">
                    Start shopping to unlock personalized stories based on your activity!
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'shop':
        return (
          <>
            <Header 
              title="Shop Story"
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              className="fixed top-0 left-0 right-0 z-10 bg-white"
            />
            <ShopView />
          </>
        )
      
      case 'profile':
        return (
          <>
            <Header 
              title="Profile"
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              className="fixed top-0 left-0 right-0 z-10 bg-white"
            />
            <ProfileView onSettingsClick={handleSettingsClick} />
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<AppShellLoader variant={activeTab} />}>
          {renderContent()}
        </Suspense>
        
        {/* Bottom Navigation - only show for shop and profile tabs */}
        {activeTab !== 'stories' && (
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="fixed bottom-0 left-0 right-0 z-10"
          />
        )}
        
        {/* Stories tab has its own navigation */}
        {activeTab === 'stories' && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-4">
              <button
                onClick={() => handleTabChange('shop')}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Shop
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
