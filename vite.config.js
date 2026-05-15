import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Generate SW during build; during dev use devOptions below
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png', 'offline.html'],

      manifest: false, // We manage manifest.json manually in /public

      devOptions: {
        enabled: true,
        type: 'module',
      },

      workbox: {
        // === Cache strategies ===

        // CacheFirst for static assets — JS bundles, CSS, images, fonts
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase REST API — NetworkFirst with offline fallback
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') ||
              url.hostname.includes('supabase.io'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: { statuses: [0, 200] },
              backgroundSync: {
                name: 'supabase-sync-queue',
                options: {
                  maxRetentionTime: 24 * 60, // 24 hours in minutes
                },
              },
            },
          },
          {
            // Static assets (images, icons) — CacheFirst
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Precache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // SPA fallback: serve the app shell for client-side routes like /torneos.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/auth\//,
        ],

        // Skip waiting & claim clients immediately on update
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],

  test: {
    globals: true,
    include: ['src/tests/**/*.test.{js,jsx}'],
    exclude: ['tools/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
})
