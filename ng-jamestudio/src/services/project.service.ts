import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  constructor(
    private apiService: ApiService,
    private localStorageService: LocalStorageService // Gardé pour la bibliothèque utilisateur (localStorage)
  ) { }

  async sendProjectData(projectData: any): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.createProject(projectData));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du projet:', error);
      throw error;
    }
  }

  async getAllProjects(): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.getAllProjects());
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }
  }

  async getProjectById(projectId: string): Promise<any> {
    try {
      const id = parseInt(projectId, 10);
      return await firstValueFrom(this.apiService.getProjectById(id));
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${projectId}:`, error);
      throw error;
    }
  }

  async getProjectsByDate(): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.getProjectsByDate());
    } catch (error) {
      console.error('Erreur lors de la récupération des projets par date:', error);
      throw error;
    }
  }

  async searchProjects(query: string): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.searchProjects(query));
    } catch (error) {
      console.error('Erreur lors de la recherche de projets:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, projectData: any): Promise<any> {
    try {
      const id = parseInt(projectId, 10);
      return await firstValueFrom(this.apiService.updateProject(id, projectData));
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${projectId}:`, error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<any> {
    try {
      const id = parseInt(projectId, 10);
      await firstValueFrom(this.apiService.deleteProject(id));
      return { message: 'Projet supprimé avec succès' };
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${projectId}:`, error);
      throw error;
    }
  }

  async getProjectsByUpdateDate(): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.getProjectsByUpdateDate());
    } catch (error) {
      console.error('Erreur lors de la récupération des projets par date de mise à jour:', error);
      throw error;
    }
  }

  async getProjectsByUserId(userId: number): Promise<any[]> {
    try {
      return await firstValueFrom(this.apiService.getProjectsByUserId(userId));
    } catch (error) {
      console.error(`Erreur lors de la récupération des projets de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  async addProjectToLibrary(ProjectId: number, UserId: number): Promise<any> {
    // La bibliothèque utilisateur reste en localStorage car elle est personnelle
    this.localStorageService.addProjectToLibrary(ProjectId, UserId);
    return { message: 'Projet ajouté à la bibliothèque avec succès' };
  }

  async getProjectLibrary(userId: number): Promise<any> {
    // La bibliothèque utilisateur reste en localStorage car elle est personnelle
    return this.localStorageService.getProjectLibrary(userId);
  }
}
