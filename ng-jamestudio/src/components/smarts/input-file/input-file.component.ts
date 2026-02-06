import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../../services/logger.service';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-input-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-file.component.html',
  styleUrl: './input-file.component.css'
})
export class InputFileComponent {
  @Input() text = "Télécharger une image";
  @Input() description = "Cliquez ou glissez-déposez votre image ici";
  @Input() multiple: boolean = false;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  fileTypes: ('image' | 'video')[] = [];
  isDragOver = false;
  errorMessage: string | null = null;
  private readonly ERROR_MESSAGE_TIMEOUT = 5000;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() filesSelected = new EventEmitter<File[]>();

  constructor(private logger: LoggerService) {}

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) as File[] : [];
    if (files.length > 0) {
      this.processFiles(files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files) as File[];
      this.processFiles(fileArray);
    }
  }

  triggerFileInput(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput.click();
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.fileTypes.splice(index, 1);
    this.filesSelected.emit([...this.selectedFiles]);
  }

  private processFiles(files: File[]) {
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    files.forEach(file => {
      if (this.isValidMediaFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      this.errorMessage = `${invalidFiles.length} fichier(s) invalide(s). Veuillez sélectionner des images (JPEG, PNG, GIF, WEBP) ou des vidéos (MP4, WEBM, OGG)`;
      setTimeout(() => {
        this.errorMessage = null;
      }, this.ERROR_MESSAGE_TIMEOUT);
    }

    if (validFiles.length > 0) {
      if (this.multiple) {
        this.selectedFiles.push(...validFiles);
        validFiles.forEach(file => {
          this.createMediaPreview(file);
        });
        this.filesSelected.emit([...this.selectedFiles]);
      } else {
        this.selectedFiles = [validFiles[0]];
        this.previewUrls = [];
        this.fileTypes = [];
        this.createMediaPreview(validFiles[0]);
        this.fileSelected.emit(validFiles[0]);
      }
      this.errorMessage = null;
    }
  }

  private isValidMediaFile(file: File): boolean {
    const validTypes = [
      ...APP_CONSTANTS.FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
      ...APP_CONSTANTS.FILE_UPLOAD.ALLOWED_VIDEO_TYPES
    ] as string[];
    return validTypes.includes(file.type);
  }

  private isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  private createMediaPreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrls.push(reader.result as string);
      this.fileTypes.push(this.isVideoFile(file) ? 'video' : 'image');
    };
    reader.onerror = () => {
      this.logger.error('Erreur lors de la lecture du fichier', file.name);
      this.errorMessage = `Erreur lors de la lecture du fichier: ${file.name}`;
      setTimeout(() => {
        this.errorMessage = null;
      }, this.ERROR_MESSAGE_TIMEOUT);
    };
    reader.readAsDataURL(file);
  }

  handleImageError(event: Event, index: number): void {
    this.logger.warn('Erreur de chargement de l\'image', { index });
  }

  handleVideoError(event: Event, index: number): void {
    const video = event.target as HTMLVideoElement;
    this.logger.error('Erreur de chargement de la vidéo', {
      fileName: this.selectedFiles[index]?.name,
      error: video?.error
    });
    this.errorMessage = `Erreur lors du chargement de la vidéo: ${this.selectedFiles[index]?.name}`;
    setTimeout(() => {
      this.errorMessage = null;
    }, this.ERROR_MESSAGE_TIMEOUT);
  }

  onVideoMetadataLoaded(index: number): void {
    this.logger.debug('Métadonnées vidéo chargées', this.selectedFiles[index]?.name);
  }
}
