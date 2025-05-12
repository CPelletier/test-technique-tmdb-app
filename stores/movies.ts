// stores/movies.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Movie, MovieCategory } from '~/types/tmdb';

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const filteredMovies = ref<Movie[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalResults = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentCategory = ref<MovieCategory>('popular');
  const selectedLanguage = ref(''); // Vide pour pas de filtre de langue
  
  // Computed properties
  const posterBaseUrl = ref('https://image.tmdb.org/t/p/w500');
  
  // Actions
  async function fetchMoviesByCategory(category: MovieCategory = 'popular', page = 1, language = '') {
    const { $tmdb } = useNuxtApp();
    isLoading.value = true;
    error.value = null;
    currentCategory.value = category;
    selectedLanguage.value = language;
    
    try {
      const data = await $tmdb.getMoviesByCategory(category, page, language);
      
      movies.value = data.results;
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error(`Erreur dans fetchMoviesByCategory (${category}):`, error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchAllMovies(totalPagesToFetch = 5) {
    const { $tmdb } = useNuxtApp();
    isLoading.value = true;
    error.value = null;
    
    try {
      const allMovies = await $tmdb.getMultiplePages('popular', totalPagesToFetch, selectedLanguage.value);
      movies.value = allMovies;
      filteredMovies.value = movies.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur dans fetchAllMovies:', error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function searchMovies(query: string) {
    if (!query.trim()) {
      filteredMovies.value = movies.value;
      return;
    }
    
    const { $tmdb } = useNuxtApp();
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await $tmdb.searchMovies(query, 1, selectedLanguage.value);
      filteredMovies.value = data.results;
      
      // Mise à jour des informations de pagination pour l'interface
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur dans searchMovies:', error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function loadMoreMovies() {
    if (currentPage.value >= totalPages.value || isLoading.value) return;
    
    const { $tmdb } = useNuxtApp();
    isLoading.value = true;
    
    try {
      const nextPage = currentPage.value + 1;
      const data = await $tmdb.getMoviesByCategory(currentCategory.value, nextPage, selectedLanguage.value);
      
      // Ajouter les nouveaux films à la liste existante
      movies.value = [...movies.value, ...data.results];
      filteredMovies.value = movies.value;
      currentPage.value = data.page;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur dans loadMoreMovies:', error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  function filterByLanguage(language: string) {
    selectedLanguage.value = language;
    // Rechargez les films avec la langue sélectionnée
    fetchMoviesByCategory(currentCategory.value, 1, language);
  }
  
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
    fetchMoviesByCategory,
    fetchAllMovies,
    searchMovies,
    loadMoreMovies,
    filterByLanguage
  };
});