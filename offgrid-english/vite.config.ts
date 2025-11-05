import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // PostCSS config is in postcss.config.cjs
  build: {
    cssMinify: false, // Disabled to preserve dark mode classes (esbuild was tree-shaking them)
  },
  plugins: [
    react(),
    // PWA plugin temporarily disabled for debugging
    // VitePWA({...})
  ]
});