import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Bencana Dairi - Sistem Informasi Pelaporan',
        short_name: 'Bencana Dairi',
        description: 'Aplikasi pelaporan bencana alam dan jalan rusak untuk Kabupaten Dairi, Sumatera Utara',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { 
            src: 'icons/icon-192.png', 
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any'
          },
          { 
            src: 'icons/icon-512.png', 
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'any'
          },
          { 
            src: 'icons/icon-512.png', 
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^http.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ]
})
