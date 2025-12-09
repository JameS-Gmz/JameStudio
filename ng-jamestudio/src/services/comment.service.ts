import { Injectable } from '@angular/core';

export interface Comment {
  id: number;
  projectId: number;
  content: string | null;
  rating: number | null;
  email: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse {
  comments: Comment[];
  averageRating: number;
  totalComments: number;
  totalRatings: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly COMMENTS_KEY = 'jamesstudio_comments';
  private nextCommentId: number = 1;

  constructor() {
    this.initializeComments();
  }

  private initializeComments(): void {
    const comments = this.getAllComments();
    if (comments.length > 0) {
      this.nextCommentId = Math.max(...comments.map(c => c.id)) + 1;
    }
  }

  private getAllComments(): Comment[] {
    const data = localStorage.getItem(this.COMMENTS_KEY);
    if (!data) return [];
    
    try {
      const comments = JSON.parse(data);
      return comments.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    } catch (e) {
      console.error('Error parsing comments:', e);
      return [];
    }
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  }

  // Get all comments for a project
  async getProjectComments(projectId: number): Promise<CommentResponse> {
    const allComments = this.getAllComments();
    const projectComments = allComments.filter(c => c.projectId === projectId);
    
    // Calculer les statistiques
    const ratings = projectComments
      .filter(c => c.rating !== null && c.rating !== undefined)
      .map(c => c.rating!);
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;
    
    const totalComments = projectComments.length;
    const totalRatings = ratings.length;

    return {
      comments: projectComments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      averageRating: Math.round(averageRating * 10) / 10,
      totalComments,
      totalRatings
    };
  }

  // Create a new comment
  async createComment(
    projectId: number, 
    content: string, 
    rating: number | null,
    email: string,
    authorName: string
  ): Promise<Comment> {
    // Validation de l'email
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    if (!content?.trim() && !rating) {
      throw new Error('Veuillez ajouter un commentaire ou une note');
    }

    const allComments = this.getAllComments();
    const newComment: Comment = {
      id: this.nextCommentId++,
      projectId,
      content: content?.trim() || null,
      rating: rating || null,
      email: email.toLowerCase().trim(),
      authorName: authorName?.trim() || 'Anonyme',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    allComments.push(newComment);
    this.saveComments(allComments);

    return newComment;
  }

  // Update a comment (seulement si l'email correspond)
  async updateComment(
    commentId: number, 
    content: string, 
    rating: number | null,
    email: string
  ): Promise<Comment> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    const allComments = this.getAllComments();
    const commentIndex = allComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      throw new Error('Commentaire non trouvé');
    }

    const comment = allComments[commentIndex];
    
    // Vérifier que l'email correspond
    if (comment.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Vous ne pouvez modifier que vos propres commentaires');
    }

    // Mettre à jour le commentaire
    allComments[commentIndex] = {
      ...comment,
      content: content?.trim() || null,
      rating: rating || null,
      updatedAt: new Date()
    };

    this.saveComments(allComments);
    return allComments[commentIndex];
  }

  // Delete a comment (seulement si l'email correspond)
  async deleteComment(commentId: number, email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    const allComments = this.getAllComments();
    const commentIndex = allComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      throw new Error('Commentaire non trouvé');
    }

    const comment = allComments[commentIndex];
    
    // Vérifier que l'email correspond
    if (comment.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Vous ne pouvez supprimer que vos propres commentaires');
    }

    allComments.splice(commentIndex, 1);
    this.saveComments(allComments);
  }

  // Vérifier si un email peut modifier un commentaire
  canEditComment(commentId: number, email: string): boolean {
    if (!this.isValidEmail(email)) return false;
    
    const allComments = this.getAllComments();
    const comment = allComments.find(c => c.id === commentId);
    
    if (!comment) return false;
    
    return comment.email.toLowerCase() === email.toLowerCase();
  }

  // Obtenir le commentaire d'un utilisateur pour un projet (basé sur l'email)
  getUserCommentForProject(projectId: number, email: string): Comment | null {
    if (!this.isValidEmail(email)) return null;
    
    const allComments = this.getAllComments();
    return allComments.find(
      c => c.projectId === projectId && c.email.toLowerCase() === email.toLowerCase()
    ) || null;
  }

  private isValidEmail(email: string): boolean {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Legacy method for backward compatibility
  async getGameComments(gameId: number): Promise<CommentResponse> {
    return this.getProjectComments(gameId);
  }
}
