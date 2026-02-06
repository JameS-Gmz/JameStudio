import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, firstValueFrom } from 'rxjs';

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
  private readonly API_URL = 'https://api.jamestudio.fr/api/comments';

  constructor(private http: HttpClient) {  }

  async getProjectComments(projectId: number): Promise<CommentResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<CommentResponse>(`${this.API_URL}/project/${projectId}`)
      );
      
      if (!response) {
        return { comments: [], averageRating: 0, totalComments: 0, totalRatings: 0 };
      }
      
      const comments = response.comments.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      
      return {
        ...response,
        comments
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], averageRating: 0, totalComments: 0, totalRatings: 0 };
    }
  }

  getProjectComments$(projectId: number): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.API_URL}/project/${projectId}`).pipe(
      map(response => ({
        ...response,
        comments: response.comments.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }))
      }))
    );
  }

  async createComment(
    projectId: number, 
    content: string, 
    rating: number | null,
    email: string,
    authorName: string
  ): Promise<Comment> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }
    
    if (!content?.trim() && !rating) {
      throw new Error('Veuillez ajouter un commentaire ou une note');
    }

    try {
      const response = await firstValueFrom(
        this.http.post<Comment>(this.API_URL, {
          projectId,
          author: authorName || 'Anonyme',
          authorName: authorName || 'Anonyme',
          content: content?.trim() || null,
          rating: rating || null,
          email: email.toLowerCase().trim()
        })
      );
      
      if (!response) {
        throw new Error('Erreur lors de la création du commentaire');
      }
      
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw new Error(error.error?.error || 'Erreur lors de la création du commentaire');
    }
  }

  createComment$(
    projectId: number, 
    content: string, 
    rating: number | null,
    email: string,
    authorName: string
  ): Observable<Comment> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }
    
    if (!content?.trim() && !rating) {
      throw new Error('Veuillez ajouter un commentaire ou une note');
    }

    return this.http.post<Comment>(this.API_URL, {
      projectId,
      author: authorName || 'Anonyme',
      authorName: authorName || 'Anonyme',
      content: content?.trim() || null,
      rating: rating || null,
      email: email.toLowerCase().trim()
    }).pipe(
      map(response => ({
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      }))
    );
  }

  async updateComment(
    commentId: number, 
    content: string, 
    rating: number | null,
    email: string
  ): Promise<Comment> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    try {
      const response = await firstValueFrom(
        this.http.put<Comment>(`${this.API_URL}/${commentId}`, {
          content: content?.trim() || null,
          rating: rating || null,
          email: email.toLowerCase().trim()
        })
      );
      
      if (!response) {
        throw new Error('Erreur lors de la mise à jour du commentaire');
      }
      
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw new Error(error.error?.error || 'Erreur lors de la mise à jour du commentaire');
    }
  }

  updateComment$(
    commentId: number, 
    content: string, 
    rating: number | null,
    email: string
  ): Observable<Comment> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    return this.http.put<Comment>(`${this.API_URL}/${commentId}`, {
      content: content?.trim() || null,
      rating: rating || null,
      email: email.toLowerCase().trim()
    }).pipe(
      map(response => ({
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      }))
    );
  }

  async deleteComment(commentId: number, email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/${commentId}`, {
          body: { email: email.toLowerCase().trim() }
        })
      );
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw new Error(error.error?.error || 'Erreur lors de la suppression du commentaire');
    }
  }

  deleteComment$(commentId: number, email: string): Observable<void> {
    if (!this.isValidEmail(email)) {
      throw new Error('Email invalide');
    }

    return this.http.delete<void>(`${this.API_URL}/${commentId}`, {
      body: { email: email.toLowerCase().trim() }
    });
  }

  async canEditComment(commentId: number, email: string): Promise<boolean> {
    if (!this.isValidEmail(email)) return false;

    try {
      const comment = await firstValueFrom(
        this.http.get<Comment>(`${this.API_URL}/${commentId}`)
      );
      if (!comment) return false;
      
      return comment.email.toLowerCase() === email.toLowerCase();
    } catch (error) {
      console.error('Error checking comment edit permission:', error);
      return false;
    }
  }

  async getUserCommentForProject(projectId: number, email: string): Promise<Comment | null> {
    if (!this.isValidEmail(email)) return null;

    try {
      const response = await this.getProjectComments(projectId);
      return response.comments.find(
        c => c.email.toLowerCase() === email.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error fetching user comment:', error);
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  async getGameComments(gameId: number): Promise<CommentResponse> {
    return this.getProjectComments(gameId);
  }
}

