// stores/movies.ts (Corrigé)
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Movie, MovieCategory, UICategoryType, SortOption, FullMovieDetails } from '~/types/tmdb';
import { useTmdb } from '~/composables/useTmdb';

export const useMoviesStore = defineStore('movies', () => {
  // États existants
  const movies = ref<Movie[]>([]);
  const filteredMovies = ref<Movie[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalResults = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentCategory = ref<UICategoryType>('all');
  const selectedLanguage = ref('');
  const posterBaseUrl = ref('https://image.tmdb.org/t/p/w500');
  const hasMore = ref(true);
  const currentMovie = ref<FullMovieDetails | null>(null);
  const isLoadingMovie = ref(false);
  const movieError = ref<string | null>(null);

  
  // Nouvel état pour suivre le contexte de recherche
  const searchMode = ref(false);
  const currentSearchQuery = ref('');
  const currentSortOption = ref<SortOption>('popularity.desc');
  
  // Actions
  async function fetchMoviesByCategory(category: MovieCategory, page = 1, language = '', reset = true) {
    const $tmdb = useTmdb();
    // Réinitialiser le mode de recherche
    searchMode.value = false;
    currentSearchQuery.value = '';
    
    if (page === 1 || reset) {
      isLoading.value = true;
    }
    
    error.value = null;
    currentCategory.value = category;
    selectedLanguage.value = language;
    
    try {
      const data = await $tmdb.getMoviesByCategory(category, page, language);
      
      if (reset) {
        movies.value = data.results;
      } else {
        // Ajouter les nouveaux films tout en évitant les doublons
        const newMovieIds = new Set(data.results.map((m: Movie) => m.id));
        const existingMovieIds = new Set(movies.value.map((m: Movie) => m.id));
        
        const uniqueNewMovies = data.results.filter((movie: Movie) => !existingMovieIds.has(movie.id));
        movies.value = [...movies.value, ...uniqueNewMovies];
      }
      
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
      
      hasMore.value = currentPage.value < totalPages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error(`Erreur dans fetchMoviesByCategory (${category}):`, error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchAllMovies(page = 1, language = '', sortBy: SortOption = 'popularity.desc', reset = true) {
    // Réinitialiser le mode de recherche
    searchMode.value = false;
    currentSearchQuery.value = '';
    currentSortOption.value = sortBy;
    
    const $tmdb = useTmdb();
    
    if (page === 1 || reset) {
      isLoading.value = true;
    }
    
    error.value = null;
    currentCategory.value = 'all';
    selectedLanguage.value = language;
    
    try {
      const data = await $tmdb.getAllMovies(page, language, sortBy);
      
      if (reset) {
        movies.value = data.results;
      } else {
        // Ajouter les nouveaux films
        const newMovieIds = new Set(data.results.map((m: Movie) => m.id));
        const existingMovieIds = new Set(movies.value.map((m: Movie) => m.id));
        
        const uniqueNewMovies = data.results.filter((movie: Movie) => !existingMovieIds.has(movie.id));
        movies.value = [...movies.value, ...uniqueNewMovies];
      }
      
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
      
      hasMore.value = currentPage.value < totalPages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur dans fetchAllMovies:', error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  async function searchMovies(query: string, page = 1, reset = true) {
    if (!query.trim()) {
      // Si la recherche est vide, revenir à la catégorie actuelle
      if (currentCategory.value === 'all') {
        fetchAllMovies(1, selectedLanguage.value, currentSortOption.value);
      } else {
        fetchMoviesByCategory(currentCategory.value as MovieCategory, 1, selectedLanguage.value);
      }
      return;
    }
    
    // Activer le mode recherche
    searchMode.value = true;
    currentSearchQuery.value = query;
    
    const $tmdb = useTmdb();
    
    if (page === 1 || reset) {
      isLoading.value = true;
    }
    
    error.value = null;
    
    try {
      const data = await $tmdb.searchMovies(query, page, selectedLanguage.value);
      
      if (reset) {
        movies.value = data.results;
      } else {
        // Ajouter les nouveaux films
        const newMovieIds = new Set(data.results.map((m: Movie) => m.id));
        const existingMovieIds = new Set(movies.value.map((m: Movie) => m.id));
        
        const uniqueNewMovies = data.results.filter((movie: Movie) => !existingMovieIds.has(movie.id));
        movies.value = [...movies.value, ...uniqueNewMovies];
      }
      
      currentPage.value = data.page;
      totalPages.value = data.total_pages;
      totalResults.value = data.total_results;
      filteredMovies.value = movies.value;
      
      hasMore.value = currentPage.value < totalPages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur dans searchMovies:', error.value);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Méthode loadNextPage qui prend en compte tous les contextes
  async function loadNextPage() {
    if (currentPage.value < totalPages.value && !isLoading.value) {
      const nextPage = currentPage.value + 1;
      
      if (searchMode.value) {
        // Si on est en mode recherche, charger la page suivante de la recherche
        await searchMovies(currentSearchQuery.value, nextPage, false);
      } else if (currentCategory.value === 'all') {
        // Si on affiche tous les films, utiliser la fonction appropriée
        await fetchAllMovies(nextPage, selectedLanguage.value, currentSortOption.value, false);
      } else {
        // Sinon, charger la page suivante de la catégorie actuelle
        await fetchMoviesByCategory(currentCategory.value as MovieCategory, nextPage, selectedLanguage.value, false);
      }
    }
  }

  async function fetchMovieDetails(id: number) {
    const $tmdb = useTmdb();
    isLoadingMovie.value = true;
    movieError.value = null;
    
    try {
      const data = await $tmdb.getFullMovieDetails(id, selectedLanguage.value);
      currentMovie.value = data;
    } catch (err) {
      movieError.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error(`Erreur dans fetchMovieDetails (${id}):`, movieError.value);
    } finally {
      isLoadingMovie.value = false;
    }
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
    hasMore,
    searchMode,
    currentSearchQuery,
    currentSortOption,
    fetchMoviesByCategory,
    fetchAllMovies,
    searchMovies,
    loadNextPage,
    currentMovie,
    isLoadingMovie,
    movieError,
    fetchMovieDetails
  };
});