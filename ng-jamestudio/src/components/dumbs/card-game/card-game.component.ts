import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file-service.service';
import { ApiConfigService } from '../../../services/api-config.service';
import { LoggerService } from '../../../services/logger.service';
import { Project } from '../../../models/project.model';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-card-game',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-game.component.html',
  styleUrls: ['./card-game.component.css']
})
export class CardGameComponent implements OnInit {
  @Input() game: Project = {} as Project;
  imageUrl: string = APP_CONSTANTS.DEFAULTS.IMAGE;
  mediaUrl: string = APP_CONSTANTS.DEFAULTS.IMAGE;
  isVideo: boolean = false;

  constructor(
    private fileService: FileService,
    private apiConfig: ApiConfigService,
    private logger: LoggerService
  ) {}

  private getFullImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    
    if (url.startsWith('/uploads/')) {
      return `${this.apiConfig.getApiUrl()}${url}`;
    }
    
    if (url.includes('default-project.jpg') || url.includes('assets/images/default-project.jpg')) {
      return APP_CONSTANTS.DEFAULTS.IMAGE;
    }
    
    return url;
  }

  private checkIfVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = APP_CONSTANTS.FILE_UPLOAD.ALLOWED_EXTENSIONS.VIDEOS;
    const lowerUrl = url.toLowerCase();
    const hasVideoExtension = videoExtensions.some(ext => {
      return lowerUrl.includes(ext) && (
        lowerUrl.endsWith(ext) || 
        lowerUrl.includes(ext + '?') || 
        lowerUrl.includes(ext + '#')
      );
    });
    const hasVideoMimeType = lowerUrl.includes('video/') || lowerUrl.startsWith('data:video/');
    return hasVideoExtension || hasVideoMimeType;
  }

  async ngOnInit() {
    try {
      let urlToUse = '';
      
      if (this.game.images && Array.isArray(this.game.images) && this.game.images.length > 0) {
        const firstMedia = this.game.images[0];
        if (firstMedia && firstMedia.trim() !== '' && !firstMedia.includes('null') && !firstMedia.includes('undefined')) {
          urlToUse = this.getFullImageUrl(firstMedia);
        }
      }
      
      if (!urlToUse && this.game.imageUrl) {
        const fullUrl = this.getFullImageUrl(this.game.imageUrl);
        if (fullUrl && fullUrl.trim() !== '' && !fullUrl.includes('null') && !fullUrl.includes('undefined')) {
          urlToUse = fullUrl;
        }
      }
      
      if (!urlToUse && this.game.id) {
        const url = await this.fileService.getImageUrl(this.game.id);
        if (url && url.trim() !== '' && !url.includes('null') && !url.includes('undefined')) {
          urlToUse = url;
        }
      }
      
      if (!urlToUse) {
        urlToUse = APP_CONSTANTS.DEFAULTS.IMAGE;
      }

      this.isVideo = this.checkIfVideo(urlToUse);
      this.mediaUrl = urlToUse;
      this.imageUrl = urlToUse;
      
      this.logger.debug('Media URL chargée', { mediaUrl: this.mediaUrl, isVideo: this.isVideo });
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du média', error);
      this.mediaUrl = APP_CONSTANTS.DEFAULTS.IMAGE;
      this.imageUrl = APP_CONSTANTS.DEFAULTS.IMAGE;
      this.isVideo = false;
    }
  }

  onImageError(event: Event): void {
    this.logger.warn('Erreur de chargement de l\'image, utilisation de l\'image par défaut');
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = APP_CONSTANTS.DEFAULTS.IMAGE;
    }
    this.isVideo = false;
  }

  onVideoError(event: Event): void {
    this.logger.warn('Erreur de chargement de la vidéo, utilisation de l\'image par défaut');
    this.isVideo = false;
    this.mediaUrl = APP_CONSTANTS.DEFAULTS.IMAGE;
    this.imageUrl = APP_CONSTANTS.DEFAULTS.IMAGE;
  }
}
