// tests/integration/search.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';  // Importez ref pour créer de vrais refs
import MovieSearch from '~/components/MovieSearch.vue';
import { useMoviesStore } from '~/stores/movies';

// Mock direct du router et des hooks de Vue Router
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();

// Objet currentRoute réactif pour simuler le comportement de Vue Router
const mockCurrentRoute = {
  path: '/',
  query: {}
};

// Créer les refs en dehors de beforeEach pour qu'ils soient disponibles dans le mock
const currentSearchQuery = ref('');
const searchMode = ref(false);

// Mock pour useRouter et useRoute
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace
  }),
  useRoute: () => mockCurrentRoute
}));

// Mock pour storeToRefs qui utilise de vrais refs
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    storeToRefs: () => ({
      currentSearchQuery,
      searchMode
    })
  };
});

describe('Search Integration', () => {
  let store: ReturnType<typeof useMoviesStore>;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Réinitialiser la route actuelle
    mockCurrentRoute.path = '/';
    mockCurrentRoute.query = {};
    
    // Réinitialiser les refs
    currentSearchQuery.value = '';
    searchMode.value = false;
    
    // Setup Pinia
    setActivePinia(createPinia());
    store = useMoviesStore();
    
    // Mock les méthodes du store
    store.searchMovies = vi.fn();
  });
  
  it('should search and navigate to home page when on movie detail page', async () => {
    // Simuler qu'on est sur une page de détail
    mockCurrentRoute.path = '/movie/123';
    
    const wrapper = mount(MovieSearch, {
      global: {
        stubs: {
          // Créer des stubs qui émettent les bons événements
          'v-text-field': {
            template: '<div><input class="v-text-field-input" v-model="inputValue" /></div>',
            props: ['modelValue'],
            computed: {
              inputValue: {
                get() { return this.modelValue; },
                set(value) { this.$emit('update:modelValue', value); }
              }
            }
          },
          'v-btn': {
            props: ['color'],
            template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>'
          }
        }
      },
      attachTo: document.body  // Attacher au DOM pour les événements
    });
    
    // Trouver les éléments
    const input = wrapper.find('.v-text-field-input');
    const searchBtn = wrapper.find('.v-btn');
    
    // Vérifier qu'on a trouvé les éléments
    if (!input.exists() || !searchBtn.exists()) {
      console.error('DOM:', wrapper.html());
      throw new Error('Éléments nécessaires non trouvés');
    }
    
    // Définir la valeur de recherche
    await input.setValue('action movies');
    
    // Simuler le clic sur le bouton de recherche
    await searchBtn.trigger('click');
    
    // Attendre que toutes les promesses soient résolues
    await flushPromises();
    
    // Vérifier que router.push a été appelé
    expect(mockRouterPush).toHaveBeenCalledWith({
      path: '/',
      query: { search: 'action movies' }
    });
  });
  
  it('should update URL without navigating when already on home page', async () => {
    // Simuler qu'on est sur la page d'accueil
    mockCurrentRoute.path = '/';
    
    const wrapper = mount(MovieSearch, {
      global: {
        stubs: {
          'v-text-field': {
            template: '<div><input class="v-text-field-input" v-model="inputValue" /></div>',
            props: ['modelValue'],
            computed: {
              inputValue: {
                get() { return this.modelValue; },
                set(value) { this.$emit('update:modelValue', value); }
              }
            }
          },
          'v-btn': {
            template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>'
          }
        }
      },
      attachTo: document.body
    });
    
    const input = wrapper.find('.v-text-field-input');
    const searchBtn = wrapper.find('.v-btn');
    
    // Définir la valeur de recherche
    await input.setValue('comedy movies');
    
    // Simuler le clic sur le bouton de recherche
    await searchBtn.trigger('click');
    
    // Attendre que toutes les promesses soient résolues
    await flushPromises();
    
    // Vérifier que router.replace a été appelé
    expect(mockRouterReplace).toHaveBeenCalledWith({
      query: { search: 'comedy movies' }
    });
    
    // Vérifier que searchMovies a été appelé
    expect(store.searchMovies).toHaveBeenCalledWith('comedy movies');
  });
  
  it('should trigger search on keyup.enter in the input field', async () => {
    // Simuler qu'on est sur la page d'accueil
    mockCurrentRoute.path = '/';
    
    const wrapper = mount(MovieSearch, {
      global: {
        stubs: {
          'v-text-field': {
            template: '<div><input class="v-text-field-input" v-model="inputValue" @keyup.enter="$emit(\'keyup:enter\')" /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue', 'keyup:enter'],
            computed: {
              inputValue: {
                get() { return this.modelValue; },
                set(value) { this.$emit('update:modelValue', value); }
              }
            }
          },
          'v-btn': {
            template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>'
          }
        }
      },
      attachTo: document.body
    });
    
    const input = wrapper.find('.v-text-field-input');
    
    // Définir la valeur de recherche
    await input.setValue('sci-fi movies');
    
    // Simuler l'appui sur Entrée
    await input.trigger('keyup.enter');
    
    // Attendre que toutes les promesses soient résolues
    await flushPromises();
    
    // Vérifier que router.replace a été appelé
    expect(mockRouterReplace).toHaveBeenCalledWith({
      query: { search: 'sci-fi movies' }
    });
    
    // Vérifier que searchMovies a été appelé
    expect(store.searchMovies).toHaveBeenCalledWith('sci-fi movies');
  });
  
  // Nettoyage après chaque test
  afterEach(() => {
    // Détacher les wrappers du DOM
    document.body.innerHTML = '';
  });
});