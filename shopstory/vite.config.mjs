import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'

export default defineConfig({
  root: '.',
  plugins: [tailwindcss()],
  optimizeDeps: {
    include: ['@shopify/shop-minis-react'],
  },
  esbuild: {
    jsx: 'automatic',
  },
})
