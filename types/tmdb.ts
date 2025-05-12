// types/tmdb.ts
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
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
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing' | 'latest' | 'discover';

export type UICategoryType = MovieCategory | 'all';