import React from 'react'

interface HeaderProps {
  title?: string
  showProfile?: boolean
  showSettings?: boolean
  onProfileClick?: () => void
  onSettingsClick?: () => void
  className?: string
  variant?: 'default' | 'transparent'
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Shop Story',
  showProfile = true,
  showSettings = true,
  onProfileClick,
  onSettingsClick,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = variant === 'transparent' 
    ? 'bg-transparent' 
    : 'bg-white border-b border-gray-200'

  return (
    <header className={`${baseClasses} ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo/Title */}
        <div className="flex items-center">
          <h1 className={`text-xl font-bold ${
            variant === 'transparent' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {showSettings && (
            <button
              onClick={onSettingsClick}
              className={`p-2 rounded-full transition-colors ${
                variant === 'transparent' 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {showProfile && (
            <button
              onClick={onProfileClick}
              className={`p-1 rounded-full transition-colors ${
                variant === 'transparent' 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Profile"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}