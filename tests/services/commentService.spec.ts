// tests/services/commentService.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { commentService, type Comment } from '~/services/commentService';

// Mock pour localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Remplacer l'objet global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Comment Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getAllComments', () => {
    it('should return an empty array when no comments exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      const comments = commentService.getAllComments();
      expect(comments).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('movieComments');
    });

    it('should return parsed comments from localStorage', () => {
      const mockComments = [
        { id: '1', username: 'User1', message: 'Test', rating: 5, createdAt: '2023-01-01', movieId: 123 }
      ];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockComments));
      
      const comments = commentService.getAllComments();
      expect(comments).toEqual(mockComments);
    });
  });

  describe('getMovieComments', () => {
    it('should filter comments by movie ID and sort by date', () => {
      const now = new Date().toISOString();
      const earlier = new Date(Date.now() - 10000).toISOString();
      
      const mockComments = [
        { id: '1', username: 'User1', message: 'Old', rating: 5, createdAt: earlier, movieId: 123 },
        { id: '2', username: 'User2', message: 'New', rating: 4, createdAt: now, movieId: 123 },
        { id: '3', username: 'User3', message: 'Other', rating: 3, createdAt: now, movieId: 456 }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockComments));
      
      const comments = commentService.getMovieComments(123);
      expect(comments).toHaveLength(2);
      expect(comments[0].message).toBe('New'); // Latest comment first
      expect(comments[1].message).toBe('Old');
    });
  });

  describe('addComment', () => {
    it('should add a new comment with generated ID and date', () => {
      // Mock Date.now() pour avoir un ID prévisible
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(12345);
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));
      
      const newComment = {
        username: 'TestUser',
        message: 'Great movie!',
        rating: 9,
        movieId: 789
      };
      
      const result = commentService.addComment(newComment);
      
      expect(result.id).toBe('12345');
      expect(result.createdAt).toBeTruthy();
      expect(result.username).toBe('TestUser');
      
      // Vérifier que le comment a été sauvegardé dans localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'movieComments',
        expect.stringContaining('TestUser')
      );
      
      dateSpy.mockRestore();
    });
  });
});