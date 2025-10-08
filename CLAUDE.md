# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Story** is a Shopify Shop Mini that creates an interactive, story-style experience for users to explore their shopping habits and preferences. It analyzes saved and recommended products using Google's Gemini AI to generate personalized insights about aesthetics, environmental impact, color preferences, and shopping patterns.

The app is built as a React web application embedded in a React Native webview, optimized exclusively for mobile devices.

## Development Commands

```bash
# Start development server
npm start
# This runs: shop-minis dev
```

The project uses:
- **Shopify Shop Minis CLI** (`@shopify/shop-minis-cli`) for development tooling
- **Vite** as the build tool with React plugin
- **Tailwind CSS v4** for styling

## Architecture Overview

### Story-Based UI Flow

The app uses an Instagram Stories-like interface with a sequential screen flow:

1. **DataProvider Context** (`src/contexts/DataContext.tsx`): Preloads both saved and recommended products on app initialization to avoid loading states between screens
2. **StoryView** (`src/components/StoryView.tsx`): Manages navigation state and progress bars for the story sequence
3. **StoryScreen** (`src/components/StoryScreen.tsx`): Routes to specific screen components based on screen type
4. **Screen Components** (`src/components/screens/`): Individual screens that display different insights

### Screen Flow Sequence

Defined in `src/App.tsx`, the story sequence is:
1. Title screen with app branding
2. Aesthetics analysis (Gen-Z style categories)
3. Top brands from saved products
4. Color palette analysis
5. Transition screen (earth tones)
6. Carbon footprint analysis
7. Small business support analysis
8. Transition screen (shipping stats)
9. Shipping time analysis
10. Personalized recommendations
11. Share screen

### AI Integration

**Gemini Service** (`src/services/gemini.ts`):
- Analyzes products to generate insights for each screen
- Uses `gemini-2.5-flash` model with specific prompts for each analysis type
- Implements smart fallbacks when API calls fail or hit token limits
- Analysis types:
  - `analyzeAesthetics()`: Gen-Z style categories with Spotify Daylist-style headlines
  - `analyzeColorPalette()`: Dominant colors and mood from products
  - `analyzeCarbonFootprint()`: Environmental impact estimates
  - `analyzeSmallBusinesses()`: Identifies small businesses vs corporations
  - `analyzeRecommendations()`: Future style evolution predictions

**API Key Management**:
- **Current**: Uses `VITE_GEMINI_API_KEY` environment variable (simple fallback)
- **Optional**: Supabase Edge Functions with JWT authentication (see `SUPABASE_EDGE_FUNCTIONS_SETUP.md`)
- Follows official Shop Minis pattern: https://github.com/Shopify/shop-minis/tree/main/supabase

**Supabase Integration** (Optional):
- `supabase/functions/auth/` - JWT authentication endpoint
- `supabase/functions/get-api-key/` - Secure API key retrieval
- `src/hooks/useAuth.ts` - Authentication hook following Shop Minis pattern
- `src/services/supabase.ts` - Edge Function client
- Automatically falls back to environment variables if not configured

### Data Flow Pattern

1. **Initial Load**: `DataProvider` preloads 25 saved products and 15 recommended products
2. **Screen Rendering**: Individual screens access preloaded data via `usePreloadedData()` hooks
3. **AI Analysis**: Screens trigger Gemini API calls on mount, showing loading states while processing
4. **Fallback Logic**: Each screen has intelligent fallbacks if Gemini API fails

### Key Architectural Decisions

- **Preloading Strategy**: All product data loads upfront to ensure smooth transitions between screens without loading delays
- **Screen-based Navigation**: Left/right tap navigation mimics Instagram Stories UX
- **Type-safe Screen Definitions**: Each screen type is strictly typed in `StoryView.tsx` (union types for all screen configurations)
- **Mobile-First**: No desktop responsive design - built exclusively for mobile webview

## Shopify Shop Minis SDK

This project heavily relies on `@shopify/shop-minis-react`:

**Key Hooks**:
- `useSavedProducts()`: Fetches user's saved/favorited products
- `useRecommendedProducts()`: Fetches Shopify's recommended products for the user
- `Product` type: Standard product interface from Shopify

**Key Components**:
- `MinisContainer`: Required wrapper component (used in `main.tsx`)
- Pre-built UI components for common e-commerce patterns

**Rule**: Always check if functionality exists in `@shopify/shop-minis-react` before creating custom implementations.

## Styling Guidelines

- Uses **Tailwind CSS v4** (configured in `vite.config.mjs`)
- Mobile-only design (no desktop breakpoints needed)
- Optimized for touch interactions
- Common patterns:
  - Full-screen layouts: `w-full h-full` or `w-full h-screen`
  - Center content: `flex items-center justify-center`
  - Gradients for visual interest: `bg-gradient-to-br from-{color} to-{color}`

## TypeScript Configuration

Strict mode enabled (`tsconfig.json`) with:
- `noUnusedParameters` and `noUnusedLocals`: enforced
- `strict: true`: all strict checks enabled
- `jsx: react-jsx`: modern JSX transform
- `isolatedModules: false`: allows complex module patterns

## Manifest Configuration

Located at `src/manifest.json`:
- **Handle**: `shop-story`
- **Name**: Shop Story
- **Description**: Your Style, Unboxed
- **Trusted Domains**: Includes Gemini API endpoint for external API calls

When adding new external API calls, update `trusted_domains` in the manifest.

## Important Notes from .cursorrules

1. Always use React as the core framework
2. Leverage `@shopify/shop-minis-react` SDK components and hooks before building custom solutions
3. Use Tailwind CSS v4 for all styling
4. Focus exclusively on mobile UI - no desktop considerations
5. Prioritize performance and clean, well-commented code
6. Optimize for mobile device limitations

## Common Development Patterns

### Adding a New Screen

1. Create screen component in `src/components/screens/YourScreen.tsx`
2. Add screen type definition to `StoryView.tsx` (e.g., `export type YourScreenData = { type: 'yourScreen' }`)
3. Add to `Screen` union type in `StoryView.tsx`
4. Import and add route case in `StoryScreen.tsx`
5. Add screen to story sequence in `App.tsx`

### Adding a New Gemini Analysis

1. Define TypeScript interface for analysis response in `gemini.ts`
2. Create `analyze[YourFeature]()` method with structured prompt
3. Implement fallback method `create[YourFeature]Fallback()`
4. Use in screen component with loading and error states

### Accessing Product Data

```typescript
import { usePreloadedData } from '../contexts/DataContext'

// In component:
const { savedProducts, recommendedProducts, isDataReady } = usePreloadedData()
```

Or use helper hooks:
```typescript
import { usePreloadedSavedProducts } from '../contexts/DataContext'
const { products, loading } = usePreloadedSavedProducts({ first: 10 })
```
