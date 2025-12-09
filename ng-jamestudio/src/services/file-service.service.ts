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
  ) {}

  // Méthode helper pour convertir les URLs relatives en URLs complètes (images et vidéos)
  private getFullImageUrl(url: string): string {
    // Si c'est déjà une URL complète (http:// ou https:// ou data:), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    
    // Si c'est un chemin relatif commençant par /uploads, ajouter l'URL de base du backend
    if (url.startsWith('/uploads/')) {
      return `${this.apiConfig.getApiUrl()}${url}`;
    }
    
    // Sinon, retourner l'URL telle quelle (pour les assets locaux)
    return url;
  }

  // Fonction pour uploader un fichier avec l'ID du projet
  async uploadFile(file: File, projectId: number): Promise<any> {
    try {
      // Utiliser l'API pour uploader le fichier
      const result = await firstValueFrom(this.apiService.uploadFile(file, projectId));
      
      // Si l'API retourne une URL, mettre à jour le projet avec cette URL
      // Sinon, si c'est en mode localStorage, gérer l'image en base64
      if (result.fileUrl && !result.fileUrl.startsWith('data:')) {
        // URL retournée par l'API
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
      // D'abord, essayer de récupérer le projet complet pour avoir accès à toutes les images/vidéos
      try {
        const project = await this.projectService.getProjectById(projectId.toString());
        
        // Vérifier d'abord le tableau images pour avoir le premier média (image ou vidéo)
        if (project.images && Array.isArray(project.images) && project.images.length > 0) {
          const firstMedia = project.images[0];
          if (firstMedia && firstMedia.trim() !== '' && !firstMedia.includes('null') && !firstMedia.includes('undefined')) {
            const fullUrl = this.getFullImageUrl(firstMedia);
            if (fullUrl && !fullUrl.includes('default-project.jpg')) {
              return fullUrl;
            }
          }
        }
        
        // Sinon, utiliser imageUrl
        if (project.imageUrl && project.imageUrl.trim() !== '' && !project.imageUrl.includes('null') && !project.imageUrl.includes('undefined')) {
          const fullUrl = this.getFullImageUrl(project.imageUrl);
          if (fullUrl && !fullUrl.includes('default-project.jpg')) {
            return fullUrl;
          }
        }
      } catch (projectError) {
        this.logger.warn('Impossible de récupérer le projet complet, utilisation de l\'API', projectError);
      }
      
      // Essayer via l'API
      const url = await firstValueFrom(this.apiService.getImageUrl(projectId));
      
      // Si l'API retourne null ou une valeur invalide, utiliser l'image par défaut
      if (!url || url === null || url === 'null' || url.trim() === '') {
        return APP_CONSTANTS.DEFAULTS.IMAGE;
      }
      
      const fullUrl = this.getFullImageUrl(url);
      
      // Vérifier que l'URL n'est pas l'image par défaut du backend ou invalide
      if (fullUrl && 
          !fullUrl.includes('default-project.jpg') && 
          !fullUrl.includes('assets/images/default-project.jpg') &&
          fullUrl.trim() !== '' &&
          fullUrl !== 'null' &&
          fullUrl !== 'undefined') {
        return fullUrl;
      }
      
      // Sinon, retourner l'image par défaut locale
      return APP_CONSTANTS.DEFAULTS.IMAGE;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'image du projet ${projectId}`, error);
      // Fallback vers une image par défaut locale
      return APP_CONSTANTS.DEFAULTS.IMAGE;
    }
  }

  async getImagesURLS(projectId: number): Promise<any> {
    try {
      const project = await this.projectService.getProjectById(projectId.toString());
      
      // Retourner toutes les images du projet avec URLs complètes
      const images = [];
      if (project.imageUrl) {
        const fullUrl = this.getFullImageUrl(project.imageUrl);
        // Ne pas ajouter si c'est l'image par défaut du backend
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
    
      // Si aucune image valide, retourner l'image par défaut locale
      return images.length > 0 ? images : [APP_CONSTANTS.DEFAULTS.IMAGE];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des images du projet ${projectId}`, error);
      return [APP_CONSTANTS.DEFAULTS.IMAGE];
    }
  }
}
