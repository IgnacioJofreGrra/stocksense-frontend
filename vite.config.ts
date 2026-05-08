// vitest/config exporta defineConfig que acepta tanto opciones de Vite
// como el campo `test` (vitest), todo tipado en una sola firma.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

/**
 * Configuracion de Vite + Vitest + PWA.
 *
 * PWA:
 * - registerType autoUpdate: el SW se actualiza solo cuando hay version
 *   nueva (sin pop-up "recargar para nueva version").
 * - manifest: icono SVG (Chrome/Edge/Safari modernos lo soportan; si
 *   manana hace falta PNG, generamos via pwa-asset-generator).
 * - workbox.runtimeCaching: cache de /graphql con NetworkFirst (timeout
 *   5s) — si la red tarda, sirve cache. Limitacion conocida: GraphQL
 *   usa POST y workbox NO cachea POST por default; solo las queries que
 *   eventualmente caigan a GET (no aplica con Apollo) se cachean.
 *   Para nuestro alcance basico (cargar la app sin red, mostrar lo que
 *   esta en Apollo cache), es suficiente. Offline-first real requeriria
 *   IndexedDB + sync queue — fuera de alcance.
 *
 * test (vitest): jsdom para tests de componentes React; setupFiles
 * carga jest-dom matchers (toBeInTheDocument, etc.).
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'StockSense',
        short_name: 'StockSense',
        description: 'Gestion de inventario inteligente para comercios',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Solo intervienen sobre la URL del backend GraphQL. Si cambia el
        // host, el regex sigue matcheando porque depende del path.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/graphql',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      devOptions: {
        // Habilitar el SW en dev tambien — asi podes testear el modo
        // avion en localhost antes de buildear para prod.
        enabled: false, // dejo false por defecto; activar si lo necesitas.
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
