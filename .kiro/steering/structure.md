# Project Structure

## Root Directory
```
shop-story/
├── src/                    # Source code
├── node_modules/           # Dependencies (auto-generated)
├── .minis-cache/          # Shop Minis cache (auto-generated)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.mjs        # Vite build configuration
└── index.html             # Entry HTML file
```

## Source Directory (`src/`)
```
src/
├── App.tsx                # Main application component
├── main.tsx               # Application entry point with React root
├── index.css              # Global styles (Tailwind imports)
├── manifest.json          # Shop Mini configuration
└── icon.png               # Application icon
```

## Key Files

### Entry Points
- **`index.html`** - HTML template with mobile viewport configuration
- **`src/main.tsx`** - React application bootstrap with MinisContainer wrapper
- **`src/App.tsx`** - Main application component

### Configuration
- **`src/manifest.json`** - Shop Mini metadata (name, permissions, policies)
- **`package.json`** - Dependencies and npm scripts
- **`tsconfig.json`** - TypeScript compiler options
- **`vite.config.mjs`** - Build tool configuration

## Component Organization
- Keep components in `src/` directory
- Use `.tsx` extension for React components
- Import Shop Minis components from `@shopify/shop-minis-react`
- Follow React functional component patterns

## Styling Structure
- Global styles in `src/index.css`
- Tailwind utilities for component styling
- Mobile-first responsive approach
- Consistent grid layouts for product displays