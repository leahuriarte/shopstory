# Data Models and Utilities

This directory contains the core data processing utilities and models for the Shop Story application.

## Overview

The data models handle the transformation of user shopping behavior into structured analytics data, style profiles, and actionable commerce recommendations.

## Key Components

### Storage Utilities (`storage.ts`)
- **Purpose**: Local storage management for behavior tracking and data persistence
- **Key Functions**:
  - `saveStyleProfile()` / `loadStyleProfile()` - Style profile persistence
  - `saveBehaviorEvents()` / `loadBehaviorEvents()` - Behavior event tracking
  - `saveProductSets()` / `loadProductSets()` - Product set management
  - `addBehaviorEvent()` - Add individual behavior events with cleanup
  - `cleanupOldData()` - Automatic data cleanup for storage management
  - `exportUserData()` / `importUserData()` - Data backup and restore

### Data Processing (`dataProcessing.ts`)
- **Purpose**: Transform raw behavior events into structured analytics
- **Key Functions**:
  - `processUserBehaviorData()` - Convert events to color preferences, brand affinities, etc.
  - `createStyleProfile()` - Generate initial style profile from processed data
  - `updateStyleProfile()` - Merge new behavior data with existing profile
- **Analytics Generated**:
  - Color preferences with frequency and confidence scores
  - Brand affinities with purchase history and spending patterns
  - Category weights with trend analysis
  - Price ranges by category
  - Seasonal shopping trends

### Shop Minis Integration (`shopMinisTransform.ts`)
- **Purpose**: Transform Shop Minis API data to internal format
- **Key Functions**:
  - `transformShopMinisProduct()` - Convert Shop Minis products to internal format
  - `createProductSetFromShopMinis()` - Generate curated product sets
  - `createBehaviorMetadataFromProduct()` - Extract analytics metadata from products
  - `batchTransformShopMinisProducts()` - Bulk product transformation
- **Features**:
  - Handles multiple Shop Minis API formats
  - Extracts color, brand, and category information
  - Calculates bundle pricing with urgency-based discounts

### Analytics Utilities (`analytics.ts`)
- **Purpose**: Core analytics functions and event creation
- **Key Functions**:
  - `createBehaviorEvent()` - Generate standardized behavior events
  - `generateId()` - Unique ID generation
  - `getCurrentSessionId()` - Session tracking

### Validation (`validation.ts`)
- **Purpose**: Data validation and sanitization
- **Key Functions**:
  - `validateStyleProfile()`, `validateBehaviorEvent()`, etc. - Type validation
  - `validateEmail()`, `validateUrl()`, `validateHexColor()` - Format validation
  - `sanitizeString()` - XSS protection

### Formatting (`formatting.ts`)
- **Purpose**: Display formatting utilities
- **Key Functions**:
  - `formatPrice()` - Currency formatting with internationalization
  - `formatDate()` - Date formatting with relative time support
  - `formatPercentage()`, `formatNumber()` - Numeric formatting
  - `truncateText()`, `capitalizeFirst()` - Text formatting

## Data Flow

1. **User Interaction** → Shop Minis product interaction
2. **Event Creation** → `createBehaviorEvent()` generates standardized event
3. **Storage** → `addBehaviorEvent()` stores with automatic cleanup
4. **Processing** → `processUserBehaviorData()` analyzes patterns
5. **Profile Creation** → `createStyleProfile()` or `updateStyleProfile()`
6. **Commerce Intelligence** → `createProductSetFromShopMinis()` generates recommendations

## Testing

Comprehensive test suite includes:
- **Unit Tests**: Individual function testing for all utilities
- **Integration Tests**: End-to-end data flow validation
- **Error Handling**: Graceful degradation and error recovery
- **Storage Tests**: Local storage operations and data persistence

Run tests with:
```bash
npm test
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **5.1**: Process purchase history, browsing patterns, and product interactions
- **5.2**: Extract color preferences, brand affinities, price ranges, and category preferences
- **5.5**: Handle insufficient data scenarios with graceful degradation

## Usage Examples

### Basic Behavior Tracking
```typescript
import { createBehaviorEvent, addBehaviorEvent } from './analytics'
import { createBehaviorMetadataFromProduct } from './shopMinisTransform'

// Track product view
const metadata = createBehaviorMetadataFromProduct(product, 'view', 'browse')
const event = createBehaviorEvent('user-123', 'view', product.id, metadata)
addBehaviorEvent(event)
```

### Style Profile Management
```typescript
import { loadBehaviorEvents, processUserBehaviorData, createStyleProfile } from './dataProcessing'
import { saveStyleProfile } from './storage'

// Generate style profile from behavior
const events = loadBehaviorEvents()
const processedData = processUserBehaviorData(events)
const profile = createStyleProfile('user-123', processedData)
saveStyleProfile(profile)
```

### Product Set Creation
```typescript
import { createProductSetFromShopMinis } from './shopMinisTransform'

// Create curated product set
const productSet = createProductSetFromShopMinis(
  shopMinisProducts,
  'Top color preference: Red',
  'Red Collection',
  'high'
)
```