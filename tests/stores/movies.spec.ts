// tests/stores/movies.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMoviesStoreMock } from '../mocks/moviesStore.mock';

describe('Movies Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });
  
  describe('fetchMoviesByCategory', () => {
    it('should fetch movies for the specified category', async () => {
      const store = useMoviesStoreMock();
      
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Movie 1' }, { id: 2, title: 'Movie 2' }],
        total_pages: 10,
        total_results: 200
      };
      
      store._tmdbApiMock.getMoviesByCategory.mockResolvedValueOnce(mockResponse);
      
      await store.fetchMoviesByCategory('popular', 1, 'en-US');
      
      expect(store._tmdbApiMock.getMoviesByCategory).toHaveBeenCalledWith('popular', 1, 'en-US');
      expect(store.movies).toEqual(mockResponse.results);
      expect(store.currentPage).toBe(1);
      expect(store.totalPages).toBe(10);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
    
    it('should handle errors properly', async () => {
      const store = useMoviesStoreMock();
      
      store._tmdbApiMock.getMoviesByCategory.mockRejectedValueOnce(new Error('API Error'));
      
      await store.fetchMoviesByCategory('popular');
      
      expect(store.error).toBe('API Error');
      expect(store.isLoading).toBe(false);
    });
  });
  
  describe('searchMovies', () => {
    it('should search movies and update state', async () => {
      const store = useMoviesStoreMock();
      
      const mockResponse = {
        page: 1,
        results: [{ id: 3, title: 'Search Result' }],
        total_pages: 1,
        total_results: 1
      };
      
      store._tmdbApiMock.searchMovies.mockResolvedValueOnce(mockResponse);
      
      await store.searchMovies('test query');
      
      expect(store._tmdbApiMock.searchMovies).toHaveBeenCalledWith('test query', 1, expect.any(String));
      expect(store.movies).toEqual(mockResponse.results);
      expect(store.searchMode).toBe(true);
      expect(store.currentSearchQuery).toBe('test query');
    });
    
    it('should reset search mode when query is empty', async () => {
      const store = useMoviesStoreMock();
      store.searchMode = true;
      store.currentSearchQuery = 'previous search';
      
      await store.searchMovies('');
      
      expect(store.searchMode).toBe(false);
      expect(store.currentSearchQuery).toBe('');
    });
  });
  
  describe('fetchMovieDetails', () => {
    it('should fetch details for a specific movie', async () => {
      const store = useMoviesStoreMock();
      
      const mockMovie = {
        id: 123,
        title: 'Movie Details',
        credits: {
          cast: [],
          crew: []
        }
      };
      
      store._tmdbApiMock.getFullMovieDetails.mockResolvedValueOnce(mockMovie);
      
      await store.fetchMovieDetails(123);
      
      expect(store._tmdbApiMock.getFullMovieDetails).toHaveBeenCalledWith(123, expect.any(String));
      expect(store.currentMovie).toEqual(mockMovie);
      expect(store.isLoadingMovie).toBe(false);
    });
  });
});