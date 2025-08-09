import React from 'react'

export type NavigationTab = 'stories' | 'shop' | 'profile'

interface BottomNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
  className?: string
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabs = [
    {
      id: 'stories' as const,
      label: 'Stories',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
        </svg>
      )
    },
    {
      id: 'shop' as const,
      label: 'Shop',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <nav className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 min-w-0 flex-1 transition-colors ${
              activeTab === tab.id ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon(activeTab === tab.id)}
            <span className={`text-xs mt-1 font-medium ${
              activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}