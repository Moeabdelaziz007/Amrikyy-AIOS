import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
 plugins: [
   react(),
   VitePWA({
     registerType: 'autoUpdate',
     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
     manifest: {
       name: 'Amrikyy AIOS',
       short_name: 'AIOS',
       description: 'Advanced AI Operating System',
       theme_color: '#1a1a2e',
       background_color: '#0f0f1e',
       display: 'standalone',
       scope: '/',
       start_url: '/',
       icons: [
         {
           src: '/pwa-192x192.png',
           sizes: '192x192',
           type: 'image/png'
         },
         {
           src: '/pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png'
         },
         {
           src: '/pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'any maskable'
         }
       ]
     },
     workbox: {
       globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
       runtimeCaching: [
         {
           urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
           handler: 'CacheFirst',
           options: {
             cacheName: 'google-fonts-cache',
             expiration: {
               maxEntries: 10,
               maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
             },
             cacheableResponse: {
               statuses: [0, 200]
             }
           }
         },
         {
           urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
           handler: 'NetworkFirst',
           options: {
             cacheName: 'supabase-cache',
             expiration: {
               maxEntries: 50,
               maxAgeSeconds: 60 * 5 // 5 minutes
             }
           }
         }
       ]
     }
   })
 ],
  resolve: {
    // This project is configured to use explicit relative paths for module imports (e.g., './', '../').
    // Alias configurations (like '@/') are intentionally removed or not configured
    // to prevent resolution issues in environments that do not support them natively.
    // If you encounter "Failed to resolve module specifier" errors, ensure all imports
    // use relative paths and check for any lingering alias configurations in your setup.
    // Removed "alias" configuration as it conflicted with native browser module loading
    // The application now relies on relative paths for imports.
  },
});