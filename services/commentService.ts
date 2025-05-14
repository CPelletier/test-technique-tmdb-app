// services/commentService.ts
export interface Comment {
  id: string;
  username: string;
  message: string;
  rating: number;
  createdAt: string;
  movieId: number;
}

const STORAGE_KEY = 'movieComments';

export const commentService = {
  // Récupérer tous les commentaires
  getAllComments(): Comment[] {
    try {
      const storedComments = localStorage.getItem(STORAGE_KEY);
      return storedComments ? JSON.parse(storedComments) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return [];
    }
  },
  
  // Récupérer les commentaires d'un film spécifique
  getMovieComments(movieId: number): Comment[] {
    const allComments = this.getAllComments();
    const filteredComments = allComments
      .filter(comment => comment.movieId === movieId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return filteredComments;
  },
  
  // Ajouter un commentaire
  addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
    
    const allComments = this.getAllComments();
    
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    allComments.push(newComment);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
    
    return newComment;
  }
};