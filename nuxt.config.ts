// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'vuetify-nuxt-module'
  ],
  tailwindcss: {
    cssPath: '~/assets/css/main.scss',
    configPath: 'tailwind.config.js'
  },
  css: [
    '~/assets/css/main.scss'
  ],
  build: {
    transpile: ['pinia-colada']
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/variables.scss" as *;'
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.themoviedb.org/3',
      apiKey: process.env.TMDB_API_KEY || ''
    }
  },
  app: {
    pageTransition: {
      name: 'page-fade',
      mode: 'out-in'
    }
  }
})