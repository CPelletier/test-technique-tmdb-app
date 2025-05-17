// plugins/tmdb.d.ts
import type { 
  Movie, 
  MoviesResponse, 
  MovieDetails, 
  MovieCategory, 
  SortOption, 
  FullMovieDetails, 
  MovieCredits 
} from '../types/tmdb';

interface TMDBApi {
  fetch<T>(endpoint: string, options?: RequestInit & { headers?: Record<string, string> }): Promise<T>;
  getAllMovies(page?: number, language?: string, sortBy?: SortOption): Promise<MoviesResponse>;
  getMoviesByCategory(category: MovieCategory, page?: number, language?: string): Promise<MoviesResponse>;
  searchMovies(query: string, page?: number, language?: string): Promise<MoviesResponse>;
  discoverMovies(params: Record<string, string | number>, page?: number, language?: string): Promise<MoviesResponse>;
  getMovieDetails(id: number, language?: string): Promise<MovieDetails>;
  getMovieCredits(id: number, language?: string): Promise<MovieCredits>;
  getFullMovieDetails(id: number, language?: string): Promise<FullMovieDetails>;
  getMultiplePages(category: MovieCategory, totalPages?: number, language?: string): Promise<Movie[]>;
  getMovieGenres(language?: string): Promise<{ genres: { id: number; name: string }[] }>;
}

// Déclarer le type $tmdb pour Nuxt
declare module '#app' {
  interface NuxtApp {
    $tmdb: TMDBApi;
  }
}

// Déclarer le type $tmdb pour Vue
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tmdb: TMDBApi;
  }
}

export {};