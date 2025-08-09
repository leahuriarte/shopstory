// UI component and interaction type definitions

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press'
  startPosition: Position
  endPosition?: Position
  velocity?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration: number
}

export interface SwipeConfig {
  threshold: number // minimum distance for swipe
  velocityThreshold: number // minimum velocity
  maxTime: number // maximum time for swipe
  preventScroll: boolean
}

export interface LoadingState {
  isLoading: boolean
  progress?: number // 0-100
  message?: string
  type: 'spinner' | 'skeleton' | 'progress-bar' | 'dots'
}

export interface ErrorState {
  hasError: boolean
  error?: Error
  errorMessage?: string
  errorCode?: string
  retryable: boolean
  onRetry?: () => void
}

export interface ModalConfig {
  isOpen: boolean
  title?: string
  size: 'small' | 'medium' | 'large' | 'fullscreen'
  closable: boolean
  backdrop: boolean
  animation: 'fade' | 'slide' | 'zoom'
  position: 'center' | 'bottom' | 'top'
}

export interface NavigationState {
  currentRoute: string
  previousRoute?: string
  canGoBack: boolean
  params?: Record<string, any>
  transition?: TransitionConfig
}

export interface TransitionConfig {
  type: 'slide' | 'fade' | 'push' | 'modal'
  duration: number
  easing: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

export interface ResponsiveBreakpoint {
  name: string
  minWidth: number
  maxWidth?: number
  columns: number
  spacing: number
}

export interface GridConfig {
  columns: number
  gap: number
  aspectRatio?: string
  responsive: ResponsiveBreakpoint[]
}

export interface ThemeConfig {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  borderRadius: BorderRadiusConfig
  shadows: ShadowConfig
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
  info: string
}

export interface TypographyConfig {
  fontFamily: string
  fontSize: FontSizeConfig
  fontWeight: FontWeightConfig
  lineHeight: LineHeightConfig
}

export interface FontSizeConfig {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface FontWeightConfig {
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
}

export interface LineHeightConfig {
  tight: number
  normal: number
  relaxed: number
  loose: number
}

export interface SpacingConfig {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface BorderRadiusConfig {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface ShadowConfig {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface AccessibilityConfig {
  ariaLabel?: string
  ariaDescribedBy?: string
  role?: string
  tabIndex?: number
  focusable: boolean
  screenReaderText?: string
}

export interface InteractionFeedback {
  haptic?: 'light' | 'medium' | 'heavy'
  sound?: string
  visual?: 'highlight' | 'ripple' | 'bounce'
  duration?: number
}

export interface ComponentState {
  isActive: boolean
  isDisabled: boolean
  isLoading: boolean
  hasError: boolean
  isFocused: boolean
  isHovered: boolean
  isPressed: boolean
}

// Import shared types
import type { Position } from './story'