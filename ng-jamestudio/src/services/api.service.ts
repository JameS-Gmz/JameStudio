import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import { LocalStorageFallbackService } from './local-storage-fallback.service';
import { LoggerService } from './logger.service';
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../models/project.model';
import { APP_CONSTANTS } from '../constants/app.constants';

export interface FileUploadResponse {
  fileUrl: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly useApi: boolean = true;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private localStorageFallback: LocalStorageFallbackService,
    private logger: LoggerService
  ) {}

  // ========== GESTION DES PROJETS ==========

  getAllProjects(): Observable<Project[]> {
    if (!this.useApi) {
      return this.localStorageFallback.getAllProjects();
    }

    return this.http.get<Project[]>(this.apiConfig.getEndpointUrl('/api/projects'))
      .pipe(
        catchError(error => {
          this.logger.error('Erreur lors de la récupération des projets', error);
          // Fallback vers localStorage en cas d'erreur
          return this.localStorageFallback.getAllProjects();
        })
      );
  }

  getProjectById(id: number): Observable<Project> {
    if (!this.useApi) {
      return this.localStorageFallback.getProjectById(id);
    }

    return this.http.get<Project>(this.apiConfig.getEndpointUrl(`/api/projects/${id}`))
      .pipe(
        catchError(error => {
          this.logger.error(`Erreur lors de la récupération du projet ${id}`, error);
          return throwError(() => error);
        })
      );
  }

  createProject(projectData: ProjectCreateRequest): Observable<Project> {
    if (!this.useApi) {
      return this.localStorageFallback.createProject(projectData);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Project>(
      this.apiConfig.getEndpointUrl('/api/projects/'),
      projectData,
      { headers }
    ).pipe(
      catchError(error => {
        this.logger.error('Erreur lors de la création du projet', error);
        return throwError(() => error);
      })
    );
  }

  updateProject(id: number, projectData: ProjectUpdateRequest): Observable<Project> {
    if (!this.useApi) {
      return this.localStorageFallback.updateProject(id, projectData);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Project>(
      this.apiConfig.getEndpointUrl(`/api/projects/${id}`),
      projectData,
      { headers }
    ).pipe(
      catchError(error => {
        this.logger.error(`Erreur lors de la mise à jour du projet ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  deleteProject(id: number): Observable<void> {
    if (!this.useApi) {
      return this.localStorageFallback.deleteProject(id);
    }

    return this.http.delete<void>(this.apiConfig.getEndpointUrl(`/api/projects/${id}`))
      .pipe(
        catchError(error => {
          this.logger.error(`Erreur lors de la suppression du projet ${id}`, error);
          return throwError(() => error);
        })
      );
  }

  searchProjects(query: string): Observable<Project[]> {
    if (!this.useApi) {
      return this.localStorageFallback.searchProjects(query);
    }

    return this.http.get<Project[]>(
      this.apiConfig.getEndpointUrl(`/api/projects/search?q=${encodeURIComponent(query)}`)
    ).pipe(
      catchError(error => {
        this.logger.error('Erreur lors de la recherche de projets', error);
        return throwError(() => error);
      })
    );
  }

  getProjectsByDate(): Observable<Project[]> {
    return this.getAllProjects().pipe(
      map(projects => [...projects].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }))
    );
  }

  getProjectsByUpdateDate(): Observable<Project[]> {
    return this.getAllProjects().pipe(
      map(projects => [...projects].sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      }))
    );
  }

  getProjectsByUserId(userId: number): Observable<Project[]> {
    if (!this.useApi) {
      return this.getAllProjects().pipe(
        map(projects => projects.filter(p => p.UserId === userId))
      );
    }

    return this.http.get<Project[]>(
      this.apiConfig.getEndpointUrl(`/api/projects/user/${userId}`)
    ).pipe(
      catchError(error => {
        this.logger.warn(`Endpoint /api/projects/user/${userId} non disponible, fallback vers getAllProjects()`, error);
        // Fallback: récupérer tous les projets et filtrer côté client
        return this.getAllProjects().pipe(
          map(projects => projects.filter(p => p.UserId === userId))
        );
      })
    );
  }

  // ========== GESTION DES FICHIERS ==========

  uploadFile(file: File, projectId: number): Observable<FileUploadResponse> {
    if (!this.useApi) {
      return this.localStorageFallback.uploadFileAsBase64(file, projectId);
    }
  
    const formData = new FormData();
    formData.append('file', file); // correspond à upload.single('file')
    formData.append('projectId', projectId.toString());
  
    return this.http.post<FileUploadResponse>(
      this.apiConfig.getEndpointUrl('/game/upload/file'),
      formData
    ).pipe(
      catchError(error => {
        this.logger.error('Erreur lors de l\'upload du fichier', error);
        return throwError(() => error);
      })
    );
  }
  

  getImageUrl(projectId: number): Observable<string | null> {
    if (!this.useApi) {
      return this.localStorageFallback.getProjectById(projectId).pipe(
        map(project => project.imageUrl || APP_CONSTANTS.DEFAULTS.IMAGE)
      );
    }

    return this.http.get<{ fileUrl: string | null }>(
      this.apiConfig.getEndpointUrl(`/game/image/${projectId}`)
    ).pipe(
      map(response => {
        if (!response.fileUrl || response.fileUrl.trim() === '' || response.fileUrl === 'null') {
          return null;
        }
        return response.fileUrl;
      }),
      catchError(error => {
        this.logger.error(`Erreur lors de la récupération de l'image du projet ${projectId}`, error);
        return throwError(() => new Error('Erreur lors de la récupération de l\'image'));
      })
    );
  }
}
