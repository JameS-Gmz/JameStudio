import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ProjectService } from './project.service';
import { ApiConfigService } from './api-config.service';
import { LoggerService } from './logger.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private apiService: ApiService,
    private projectService: ProjectService,
    private apiConfig: ApiConfigService,
    private logger: LoggerService
  ) {  }

  private getFullImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    
    if (url.startsWith('/uploads/')) {
      return `${this.apiConfig.getApiUrl()}${url}`;
    }
    
    return url;
  }

  async uploadFile(file: File, projectId: number): Promise<any> {
    try {
      const result = await firstValueFrom(this.apiService.uploadFile(file, projectId));
      
      if (result.fileUrl && !result.fileUrl.startsWith('data:')) {
        const project = await this.projectService.getProjectById(projectId.toString());
        if (!project.imageUrl) {
          await this.projectService.updateProject(projectId.toString(), { imageUrl: result.fileUrl });
        } else {
          const images = project.images || [];
          if (!images.includes(result.fileUrl)) {
            images.push(result.fileUrl);
            await this.projectService.updateProject(projectId.toString(), { images });
          }
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Erreur durant le processus d\'upload', error);
      throw error;
    }
  }

  async getImageUrl(projectId: number): Promise<string> {
    try {
      try {
        const project = await this.projectService.getProjectById(projectId.toString());
        
        if (project.images && Array.isArray(project.images) && project.images.length > 0) {
          const firstMedia = project.images[0];
          if (firstMedia && firstMedia.trim() !== '' && !firstMedia.includes('null') && !firstMedia.includes('undefined')) {
            const fullUrl = this.getFullImageUrl(firstMedia);
            if (fullUrl && !fullUrl.includes('default-project.jpg')) {
              return fullUrl;
            }
          }
        }
        
        if (project.imageUrl && project.imageUrl.trim() !== '' && !project.imageUrl.includes('null') && !project.imageUrl.includes('undefined')) {
          const fullUrl = this.getFullImageUrl(project.imageUrl);
          if (fullUrl && !fullUrl.includes('default-project.jpg')) {
            return fullUrl;
          }
        }
      } catch (projectError) {
        this.logger.warn('Impossible de récupérer le projet complet, utilisation de l\'API', projectError);
      }
      
      const url = await firstValueFrom(this.apiService.getImageUrl(projectId));
      
      if (!url || url === null || url === 'null' || url.trim() === '') {
        return APP_CONSTANTS.DEFAULTS.IMAGE;
      }
      
      const fullUrl = this.getFullImageUrl(url);
      
      if (fullUrl && 
          !fullUrl.includes('default-project.jpg') && 
          !fullUrl.includes('assets/images/default-project.jpg') &&
          fullUrl.trim() !== '' &&
          fullUrl !== 'null' &&
          fullUrl !== 'undefined') {
        return fullUrl;
      }
      
      return APP_CONSTANTS.DEFAULTS.IMAGE;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'image du projet ${projectId}`, error);
      return APP_CONSTANTS.DEFAULTS.IMAGE;
    }
  }

  async getImagesURLS(projectId: number): Promise<any> {
    try {
      const project = await this.projectService.getProjectById(projectId.toString());
      
      const images = [];
      if (project.imageUrl) {
        const fullUrl = this.getFullImageUrl(project.imageUrl);
        if (!fullUrl.includes('default-project.jpg') && 
            !fullUrl.includes('assets/images/default-project.jpg') &&
            fullUrl.trim() !== '' &&
            !fullUrl.includes('null') &&
            !fullUrl.includes('undefined')) {
          images.push(fullUrl);
        }
      }
      if (project.images && project.images.length > 0) {
        const validImages = project.images
          .map((img: string) => this.getFullImageUrl(img))
          .filter((url: string) => 
            url && 
            !url.includes('default-project.jpg') &&
            !url.includes('assets/images/default-project.jpg') &&
            url.trim() !== '' &&
            !url.includes('null') &&
            !url.includes('undefined')
          );
        images.push(...validImages);
      }
    
      return images.length > 0 ? images : [APP_CONSTANTS.DEFAULTS.IMAGE];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des images du projet ${projectId}`, error);
      return [APP_CONSTANTS.DEFAULTS.IMAGE];
    }
  }
}
