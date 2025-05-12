// plugins/tmdb.ts
import type { Movie, MoviesResponse, MovieDetails, MovieCategory } from '~/types/tmdb';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  const tmdbApi = {
    async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
      const url = `${config.public.apiBaseUrl}${endpoint}`;
      
      const defaultHeaders: Record<string, string> = {
        'Authorization': `Bearer ${config.public.apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const headers = {
        ...defaultHeaders,
        ...(options.headers || {})
      };
      
      try {
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error ${response.status}: ${errorData.status_message || 'Unknown error'}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('TMDB API Error:', error);
        throw error;
      }
    },

    getAllMovies(page = 1, language = ''): Promise<MoviesResponse> {
      const languageParam = language ? `&language=${language}` : '';
      // Pas de filtres spécifiques pour obtenir la liste la plus large possible
      return this.fetch<MoviesResponse>(`/discover/movie?page=${page}${languageParam}&sort_by=popularity.desc&include_adult=false`);
    },
    
    // Méthodes pour récupérer des films par catégorie
    getMoviesByCategory(category: MovieCategory, page = 1, language = ''): Promise<MoviesResponse> {
      const languageParam = language ? `&language=${language}` : '';
      return this.fetch<MoviesResponse>(`/movie/${category}?page=${page}${languageParam}`);
    },
    
    // Méthode pour la découverte de films avec des filtres
    discoverMovies(params: Record<string, string | number>, page = 1, language = ''): Promise<MoviesResponse> {
      const queryParams = Object.entries(params)
        .map(([key, value]) => `&${key}=${encodeURIComponent(String(value))}`)
        .join('');
      
      const languageParam = language ? `&language=${language}` : '';
      return this.fetch<MoviesResponse>(`/discover/movie?page=${page}${languageParam}${queryParams}`);
    },
    
    // Récupérer les détails d'un film
    getMovieDetails(id: number, language = ''): Promise<MovieDetails> {
      const languageParam = language ? `?language=${language}` : '';
      return this.fetch<MovieDetails>(`/movie/${id}${languageParam}`);
    },
    
    // Rechercher des films
    searchMovies(query: string, page = 1, language = ''): Promise<MoviesResponse> {
      const languageParam = language ? `&language=${language}` : '';
      return this.fetch<MoviesResponse>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}${languageParam}`);
    },
    
    // Récupérer plusieurs pages de films (fonction avancée)
    async getMultiplePages(category: MovieCategory, totalPages = 5, language = ''): Promise<Movie[]> {
      let allMovies: Movie[] = [];
      const promises: Promise<MoviesResponse>[] = [];
      
      // Limitation du nombre de pages pour éviter de surcharger l'API
      const pagesToFetch = Math.min(totalPages, 20);
      
      for (let page = 1; page <= pagesToFetch; page++) {
        promises.push(this.getMoviesByCategory(category, page, language));
      }
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        allMovies = [...allMovies, ...response.results];
      });
      
      return allMovies;
    },
    
    // Récupérer les genres de films
    getMovieGenres(language = ''): Promise<{ genres: { id: number; name: string }[] }> {
      const languageParam = language ? `?language=${language}` : '';
      return this.fetch<{ genres: { id: number; name: string }[] }>(`/genre/movie/list${languageParam}`);
    }
  };
  
  return {
    provide: {
      tmdb: tmdbApi
    }
  };
});