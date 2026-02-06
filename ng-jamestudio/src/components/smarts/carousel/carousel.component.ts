import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LoggerService } from '../../../services/logger.service';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  standalone: true
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [
    '/Ago-Que-es-un-gamer_2.jpg',
    '/chiffres-jeu-video.jpg',
    '/230213-jeux-video.jpg'
  ];
  currentIndex: number = 0;
  defaultImage: string = APP_CONSTANTS.DEFAULTS.PLACEHOLDER_IMAGE;
  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private logger: LoggerService) {  }

  isVideo(url: string): boolean {
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

  nextSlide(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.images.length - 1;
    }
  }

  handleImageError(event: Event): void {
    this.logger.warn('Erreur de chargement de l\'image');
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.defaultImage;
    }
  }

  handleVideoError(event: Event): void {
    this.logger.error('Erreur de chargement de la vidéo', {
      url: this.images[this.currentIndex],
      error: (event.target as HTMLVideoElement)?.error
    });
    if (this.images.length > 1) {
      this.nextSlide();
    }
  }

  onVideoLoadStart(): void {
    this.logger.debug('Début du chargement vidéo', this.images[this.currentIndex]);
  }

  onVideoMetadataLoaded(): void {
    this.logger.debug('Métadonnées vidéo chargées', this.images[this.currentIndex]);
  }

  ngOnInit() {
    this.autoSlideInterval = setInterval(() => {
      if (!this.isVideo(this.images[this.currentIndex])) {
        this.nextSlide();
      }
    }, APP_CONSTANTS.CAROUSEL.AUTO_SLIDE_INTERVAL);
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}
