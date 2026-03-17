/// <reference types="vitest/config" />
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon

// vite-plugin-pwa@1.2.0 types use an older Rollup resolveId signature that doesn't
// match Vite 7's updated PluginContext. Cast through any[] to unblock the build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pwaPlugins: any[] = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    // Pre-cache all static assets; cache Three.js and GSAP chunks
    globPatterns: ['**/*.{js,css,html,woff2}'],
    // Three.js chunk is ~1MB — raise the size limit so Workbox doesn't skip it
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    runtimeCaching: [
      {
        // Google Fonts
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
  manifest: {
    name: 'IVLA STEM Club — Creative Lab',
    short_name: 'STEM Lab',
    description: 'Interactive math learning modules',
    theme_color: '#1e1d1c',
    background_color: '#1e1d1c',
    display: 'standalone',
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({
    filename: 'dist/stats.html',
    open: false,
    gzipSize: true
  }), ...pwaPlugins],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap', '@gsap/react'],
          'radix': ['@radix-ui/react-accordion', '@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-progress', '@radix-ui/react-slider', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-tooltip']
        }
      }
    }
  },
  test: {
    projects: [
      // Unit tests (jsdom environment)
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
          environment: 'jsdom',
          globals: true,
        }
      },
      // Storybook tests (browser environment)
      {
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  }
});