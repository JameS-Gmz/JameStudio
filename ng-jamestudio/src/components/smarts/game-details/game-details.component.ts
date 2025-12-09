import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from "../carousel/carousel.component";
import { RatingComponentComponent } from "../../dumbs/rating-component/rating-component.component";
import { FileService } from '../../../services/file-service.service';
import { LibraryService } from '../../../services/library.service';
import { CommentService, Comment } from '../../../services/comment.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent, RatingComponentComponent],
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})
export class GameDetailsComponent implements OnInit {
  project: any = {};
  images: string[] = [];
  projectId!: string;
  isInLibrary: boolean = false;
  loading: boolean = false;
  
  comments: Comment[] = [];
  averageRating: number = 0;
  totalComments: number = 0;
  totalRatings: number = 0;
  currentUserComment: Comment | null = null;
  userEmail: string = '';
  userAuthorName: string = '';

  commentContent: string = '';
  commentRating: number = 0;
  commentEmail: string = '';
  commentAuthorName: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showDeleteConfirm: boolean = false;
  commentToDelete: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fileService: FileService,
    private libraryService: LibraryService,
    private commentService: CommentService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('jamesstudio_comment_email');
    if (savedEmail) {
      this.commentEmail = savedEmail;
      this.userEmail = savedEmail;
      this.themeService.loadUserTheme(savedEmail);
    }

    const savedName = localStorage.getItem('jamesstudio_comment_name');
    if (savedName) {
      this.commentAuthorName = savedName;
      this.userAuthorName = savedName;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = id;
        this.loadProject(id);
        this.checkIfInLibrary();
        this.loadComments();
      }
    });
  }

  async checkIfInLibrary() {
    try {
      this.isInLibrary = await this.libraryService.isProjectInLibrary(Number(this.projectId));
    } catch (error) {
      console.error('Error checking library:', error);
    }
  }

  async toggleLibrary() {
    if (this.loading) return;
    
    this.loading = true;
    try {
      if (this.isInLibrary) {
        await this.libraryService.removeProjectFromLibrary(Number(this.projectId));
      } else {
        await this.libraryService.addProjectToLibrary(Number(this.projectId));
      }
      this.isInLibrary = !this.isInLibrary;
    } catch (error) {
      console.error('Error adding project to library:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadProject(id: string) {
    try {
      this.project = await this.projectService.getProjectById(id);
      const imageData = await this.fileService.getImagesURLS(this.project.id);
      this.images = Array.isArray(imageData) 
        ? imageData.map((img: any) => typeof img === 'string' ? img : img.url || img)
        : [];
      console.log('Images/Videos chargées:', this.images);
      // Log pour vérifier les types de fichiers
      this.images.forEach((url: string, index: number) => {
        const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i);
        console.log(`Media ${index + 1}: ${url} - Type: ${isVideo ? 'VIDEO' : 'IMAGE'}`);
      });
    } catch (error) {
      console.error("Error loading project details:", error);
    }
  }

  async loadComments(): Promise<void> {
    try {
      const response = await this.commentService.getProjectComments(Number(this.projectId));
      this.comments = response.comments;
      this.averageRating = response.averageRating;
      this.totalComments = response.totalComments;
      this.totalRatings = response.totalRatings;

      if (this.userEmail) {
        this.currentUserComment = this.commentService.getUserCommentForProject(
          Number(this.projectId),
          this.userEmail
        );
        if (this.currentUserComment) {
          this.commentContent = this.currentUserComment.content || '';
          this.commentRating = this.currentUserComment.rating || 0;
          this.commentEmail = this.currentUserComment.email;
          this.commentAuthorName = this.currentUserComment.authorName;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  }

  onRatingChange(rating: number): void {
    this.commentRating = rating;
  }

  async submitComment(): Promise<void> {
    if (!this.commentEmail || !this.commentEmail.trim()) {
      this.errorMessage = 'Veuillez renseigner votre email';
      return;
    }

    if (!this.isValidEmail(this.commentEmail)) {
      this.errorMessage = 'Email invalide';
      return;
    }

    if (this.commentRating === 0 && !this.commentContent.trim()) {
      this.errorMessage = 'Veuillez ajouter une note ou un commentaire';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const normalizedEmail = this.commentEmail.trim().toLowerCase();
      localStorage.setItem('jamesstudio_comment_email', normalizedEmail);
      if (this.commentAuthorName.trim()) {
        localStorage.setItem('jamesstudio_comment_name', this.commentAuthorName.trim());
      }
      this.userEmail = normalizedEmail;
      this.userAuthorName = this.commentAuthorName.trim();
      
      this.themeService.loadUserTheme(normalizedEmail);

      if (this.currentUserComment) {
        await this.commentService.updateComment(
          this.currentUserComment.id,
          this.commentContent.trim(),
          this.commentRating || null,
          this.commentEmail.trim()
        );
      } else {
        const newComment = await this.commentService.createComment(
          Number(this.projectId),
          this.commentContent.trim(),
          this.commentRating || null,
          this.commentEmail.trim(),
          this.commentAuthorName.trim() || 'Anonyme'
        );
        this.currentUserComment = newComment;
      }

      await this.loadComments();
      
      if (!this.currentUserComment) {
        this.commentContent = '';
        this.commentRating = 0;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du commentaire:', error);
      this.errorMessage = error.message || 'Erreur lors de l\'envoi du commentaire';
    } finally {
      this.isSubmitting = false;
    }
  }

  private isValidEmail(email: string): boolean {
    if (!email || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  requestDeleteComment(commentId: number): void {
    if (!this.userEmail) {
      this.errorMessage = 'Veuillez renseigner votre email pour supprimer votre commentaire';
      return;
    }
    this.commentToDelete = commentId;
    this.showDeleteConfirm = true;
  }

  cancelDeleteComment(): void {
    this.showDeleteConfirm = false;
    this.commentToDelete = null;
  }

  async confirmDeleteComment(): Promise<void> {
    if (!this.commentToDelete || !this.userEmail) {
      return;
    }

    try {
      await this.commentService.deleteComment(this.commentToDelete, this.userEmail);
      this.currentUserComment = null;
      this.commentContent = '';
      this.commentRating = 0;
      this.showDeleteConfirm = false;
      this.commentToDelete = null;
      await this.loadComments();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      this.errorMessage = error.message || 'Erreur lors de la suppression du commentaire';
      this.showDeleteConfirm = false;
      this.commentToDelete = null;
    }
  }

  canEditComment(comment: Comment): boolean {
    if (!this.userEmail) return false;
    return this.commentService.canEditComment(comment.id, this.userEmail);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  }
}
