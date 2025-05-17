export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  original_title?: string;
  original_language?: string;
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
  budget: number;
  revenue: number;
  vote_count: number;
  backdrop_path: string | null;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface MovieCredits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface FullMovieDetails extends MovieDetails {
  credits: MovieCredits;
}

export interface Window {
  $imageTransition?: {
    startTransition: (id: number, element: HTMLElement, imagePath: string | null) => void;
  };
}

export type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing' | 'latest' | 'discover';
export type UICategoryType = MovieCategory | 'all';
export type SortOption = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'revenue.desc';

export interface TMDBApi {
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