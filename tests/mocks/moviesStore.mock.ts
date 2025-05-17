// tests/mocks/moviesStore.mock.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Movie, MovieCategory, MovieDetails, FullMovieDetails } from '~/types/tmdb';

// Mock de l'API TMDB
const tmdbApiMock = {
  getMoviesByCategory: vi.fn(),
  getAllMovies: vi.fn(),
  searchMovies: vi.fn(),
  getFullMovieDetails: vi.fn()
};

// Store avec des dépendances mockées
export const useMoviesStoreMock = defineStore('movies-mock', () => {
  const movies = ref<Movie[]>([]);
  const filteredMovies = ref<Movie[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalResults = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentCategory = ref<any>('popular');
  const selectedLanguage = ref('');
  const posterBaseUrl = ref('https://image.tmdb.org/t/p/w500');
  const hasMore = ref(true);
  const searchMode = ref(false);
  const currentSearchQuery = ref('');
  const currentMovie = ref<FullMovieDetails | null>(null);
  const isLoadingMovie = ref(false);
  const movieError = ref<string | null>(null);

  // Fonctions mockées qui n'utilisent pas useNuxtApp
  async function fetchMoviesByCategory(category: MovieCategory, page = 1, language = '', reset = true) {
    isLoading.value = true;
    error.value = null;
    currentCategory.value = category;
    selectedLanguage.value = language;
    
    try {
      const data = await tmdbApiMock.getMoviesByCategory(category, page, language);
      
      if (reset) {
        movies.value = data.results;
      } else {
        movies.value = [...movies.value, ...data.results];
      }
      
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
      hasMore.value = currentPage.value < totalPages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
    } finally {
      isLoading.value = false;
    }
  }

  async function searchMovies(query: string, page = 1, reset = true) {
    if (!query.trim()) {
      searchMode.value = false;
      currentSearchQuery.value = '';
      return;
    }
    
    searchMode.value = true;
    currentSearchQuery.value = query;
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await tmdbApiMock.searchMovies(query, page, selectedLanguage.value);
      
      if (reset) {
        movies.value = data.results;
      } else {
        movies.value = [...movies.value, ...data.results];
      }
      
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
      hasMore.value = currentPage.value < totalPages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMovieDetails(id: number) {
    isLoadingMovie.value = true;
    movieError.value = null;
    
    try {
      const data = await tmdbApiMock.getFullMovieDetails(id, selectedLanguage.value);
      currentMovie.value = data;
    } catch (err) {
      movieError.value = err instanceof Error ? err.message : 'Une erreur est survenue';
    } finally {
      isLoadingMovie.value = false;
    }
  }
  
  // Exposer l'API mockée pour les tests
  const _tmdbApiMock = tmdbApiMock;

  return {
    movies,
    filteredMovies,
    currentPage,
    totalPages,
    totalResults,
    isLoading,
    error,
    currentCategory,
    selectedLanguage,
    posterBaseUrl,
    hasMore,
    searchMode,
    currentSearchQuery,
    currentMovie,
    isLoadingMovie,
    movieError,
    fetchMoviesByCategory,
    searchMovies,
    fetchMovieDetails,
    _tmdbApiMock // Pour les tests
  };
});