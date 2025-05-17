// tests/setup.ts
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Déclarer uniquement __mocks__ sans redéclarer useRouter
declare global {
  var __mocks__: {
    router: {
      push: ReturnType<typeof vi.fn>;
      replace: ReturnType<typeof vi.fn>;
      back: ReturnType<typeof vi.fn>;
      forward: ReturnType<typeof vi.fn>;
      go: ReturnType<typeof vi.fn>;
    }
  };
}

// Configure les stubs globaux pour les composants Vuetify
config.global.stubs = {
  'v-text-field': {
    template: '<input class="v-text-field" v-model="inputValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    computed: {
      inputValue: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        }
      }
    }
  },
  'v-btn': {
    template: '<button class="v-btn" @click="$emit(\'click\')"><slot></slot></button>',
    emits: ['click']
  },
  'v-rating': {
    template: '<div class="v-rating"><slot></slot></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  },
  // Ajouter les stubs pour les composants Nuxt
  'NuxtLink': {
    template: '<a :href="to" @click.prevent><slot></slot></a>',
    props: ['to']
  }
};

// ----------------
// AJOUT DES MOCKS NUXT
// ----------------

// Mock pour useRouter et autres fonctions Nuxt
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterForward = vi.fn();
const mockRouterGo = vi.fn();

const mockRouter = {
  push: mockRouterPush,
  replace: mockRouterReplace,
  back: mockRouterBack,
  forward: mockRouterForward,
  go: mockRouterGo
};

// Définir useRouter globalement sans redéclarer son type
// Cette technique remplace dynamiquement la fonction réelle par notre mock
(globalThis as any).useRouter = vi.fn(() => mockRouter);

// Mock via vi.mock pour intercepter les imports
vi.mock('#app', () => ({
  useRouter: () => mockRouter,
  navigateTo: vi.fn(),
  defineNuxtRouteMiddleware: vi.fn(),
  useRuntimeConfig: () => ({})
}));

// Mock pour #imports qui est utilisé par Nuxt pour les auto-imports
vi.mock('#imports', () => ({
  useRouter: vi.fn(() => mockRouter),
  // Autres composables auto-importés si nécessaire
}));

// Mock pour useIntersectionObserver
vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((el, callback) => {
    // Simuler une intersection immédiate
    callback([{ isIntersecting: true }]);
    return { stop: vi.fn() };
  })
}));

// Mock pour generateSlug - avec types explicites
vi.mock('~/utils/slug', () => ({
  generateSlug: (title: string, id: number): string => `${title.toLowerCase().replace(/\s+/g, '-')}-${id}`
}));

// Exposer les mocks pour y accéder dans les tests
globalThis.__mocks__ = {
  router: mockRouter
};

// IMPORTANT: Vérifier que useRouter est bien défini
console.log('useRouter in setup.ts:', typeof (globalThis as any).useRouter);