import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Project } from '../models/project.model';
import { APP_CONSTANTS } from '../constants/app.constants';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageFallbackService {
  private readonly storageKey = APP_CONSTANTS.STORAGE_KEYS.PROJECTS;

  constructor(private logger: LoggerService) {}

  private getProjectsFromStorage(): Project[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      this.logger.error('Erreur lors de la lecture du localStorage', error);
      return [];
    }
  }

  private saveProjectsToStorage(projects: Project[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      this.logger.error('Erreur lors de l\'écriture dans le localStorage', error);
      throw error;
    }
  }

  getAllProjects(): Observable<Project[]> {
    const projects = this.getProjectsFromStorage();
    return of(projects);
  }

  getProjectById(id: number): Observable<Project> {
    const projects = this.getProjectsFromStorage();
    const project = projects.find(p => p.id === id);
    
    if (project) {
      return of(project);
    } else {
      return throwError(() => new Error(`Projet avec l'ID ${id} non trouvé`));
    }
  }

  createProject(projectData: Partial<Project>): Observable<Project> {
    const projects = this.getProjectsFromStorage();
    const nextId = projects.length > 0 
      ? Math.max(...projects.map(p => p.id)) + 1 
      : 1;
    
    const newProject: Project = {
      id: nextId,
      title: projectData.title || '',
      description: projectData.description || '',
      technologies: projectData.technologies || [],
      github: projectData.github || null,
      demo: projectData.demo || null,
      imageUrl: projectData.imageUrl,
      images: projectData.images || [],
      UserId: projectData.UserId || APP_CONSTANTS.DEFAULTS.USER_ID,
      StatusId: projectData.StatusId || APP_CONSTANTS.DEFAULTS.STATUS_ID,
      LanguageId: projectData.LanguageId || APP_CONSTANTS.DEFAULTS.LANGUAGE_ID,
      ControllerIds: projectData.ControllerIds || [],
      PlatformIds: projectData.PlatformIds || [],
      genreIds: projectData.genreIds || [],
      tagIds: projectData.tagIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      price: projectData.price || 0,
      authorStudio: projectData.authorStudio || null
    };

    projects.push(newProject);
    this.saveProjectsToStorage(projects);
    return of(newProject);
  }

  updateProject(id: number, projectData: Partial<Project>): Observable<Project> {
    const projects = this.getProjectsFromStorage();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Projet avec l'ID ${id} non trouvé`));
    }

    const updatedProject: Project = {
      ...projects[index],
      ...projectData,
      id,
      updatedAt: new Date().toISOString()
    };

    projects[index] = updatedProject;
    this.saveProjectsToStorage(projects);
    return of(updatedProject);
  }

  deleteProject(id: number): Observable<void> {
    const projects = this.getProjectsFromStorage();
    const filtered = projects.filter(p => p.id !== id);
    
    if (filtered.length === projects.length) {
      return throwError(() => new Error(`Projet avec l'ID ${id} non trouvé`));
    }

    this.saveProjectsToStorage(filtered);
    return of(undefined);
  }

  searchProjects(query: string): Observable<Project[]> {
    const projects = this.getProjectsFromStorage();
    const lowerQuery = query.toLowerCase().trim();
    
    const filtered = projects.filter(project => {
      const titleMatch = project.title?.toLowerCase().includes(lowerQuery) || false;
      const descriptionMatch = project.description?.toLowerCase().includes(lowerQuery) || false;
      const techMatch = project.technologies && Array.isArray(project.technologies)
        ? project.technologies.some(tech => 
            tech && typeof tech === 'string' && tech.toLowerCase().includes(lowerQuery)
          )
        : false;
      
      return titleMatch || descriptionMatch || techMatch;
    });

    return of(filtered);
  }

  uploadFileAsBase64(file: File, projectId: number): Observable<{ fileUrl: string; message: string }> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Image = reader.result as string;
        try {
          const projects = this.getProjectsFromStorage();
          const project = projects.find(p => p.id === projectId);
          
          if (project) {
            if (!project.imageUrl) {
              project.imageUrl = base64Image;
            } else {
              if (!project.images) {
                project.images = [];
              }
              project.images.push(base64Image);
            }
            this.saveProjectsToStorage(projects);
          }
          
          observer.next({ fileUrl: base64Image, message: 'Fichier uploadé avec succès' });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };
      
      reader.onerror = () => {
        observer.error(new Error('Erreur lors de la lecture du fichier'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

