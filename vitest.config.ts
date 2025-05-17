// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      optimizer: {
        web: {
          include: ['@nuxt/test-utils', '@vueuse/core']
        }
      }
    },
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.nuxt', '.output'],
    coverage: {
      reporter: ['text', 'json', 'html']
    },
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '#app': resolve(dirname(fileURLToPath(import.meta.url)), 'node_modules/nuxt/dist/app'),
      '@vueuse/core': resolve(dirname(fileURLToPath(import.meta.url)), 'node_modules/@vueuse/core')
    }
  }
});