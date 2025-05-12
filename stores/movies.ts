// stores/movies.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
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
  const hasMore = ref(true);
  
  // Computed properties
  const posterBaseUrl = ref('https://image.tmdb.org/t/p/w500');

  const moviesCache = ref<Record<string, Record<number, Movie[]>>>({});
  
  // Actions
  async function fetchMoviesByCategory(category: MovieCategory = 'popular', page = 1, language = '', reset = true) {
    const { $tmdb } = useNuxtApp();
    
    // Créer une clé de cache basée sur la catégorie et la langue
    const cacheKey = `${category}-${language || 'all'}`;
    
    if (reset) {
      isLoading.value = true;
    }
    
    error.value = null;
    currentCategory.value = category;
    selectedLanguage.value = language;
    
    try {
      // Vérifier si les données sont dans le cache
      if (moviesCache.value[cacheKey] && moviesCache.value[cacheKey][page]) {
        console.log(`Récupération depuis le cache: ${cacheKey} page ${page}`);
        
        if (reset) {
          movies.value = moviesCache.value[cacheKey][page];
        } else {
          // Ajouter les films du cache à la liste existante
          const cachedMovies = moviesCache.value[cacheKey][page];
          const existingMovieIds = new Set(movies.value.map(m => m.id));
          const uniqueCachedMovies = cachedMovies.filter(movie => !existingMovieIds.has(movie.id));
          movies.value = [...movies.value, ...uniqueCachedMovies];
        }
        
        // Mise à jour des valeurs de pagination depuis le cache
        currentPage.value = page;
        // Note: totalPages et totalResults pourraient ne pas être mis à jour ici si nous n'avons pas ces informations dans le cache
        
        filteredMovies.value = movies.value;
        hasMore.value = true; // Supposons qu'il y a plus de pages pour l'instant
        
        isLoading.value = false;
        return;
      }
      
      // Si les données ne sont pas dans le cache, les récupérer de l'API
      const data = await $tmdb.getMoviesByCategory(category, page, language);
      
      // Mettre à jour le cache
      if (!moviesCache.value[cacheKey]) {
        moviesCache.value[cacheKey] = {};
      }
      moviesCache.value[cacheKey][page] = data.results;
      
      if (reset) {
        movies.value = data.results;
      } else {
        // Ajouter les nouveaux films tout en évitant les doublons
        const newMovieIds = new Set(data.results.map(m => m.id));
        const existingMovieIds = new Set(movies.value.map(m => m.id));
        
        const uniqueNewMovies = data.results.filter(movie => !existingMovieIds.has(movie.id));
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

  async function loadNextPage() {
    // Vérifier s'il y a plus de pages à charger et si un chargement n'est pas déjà en cours
    if (currentPage.value < totalPages.value && !isLoading.value) {
      const nextPage = currentPage.value + 1;
      await fetchMoviesByCategory(currentCategory.value, nextPage, selectedLanguage.value, false);
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
    filterByLanguage,
    loadNextPage,
    hasMore
  };
});