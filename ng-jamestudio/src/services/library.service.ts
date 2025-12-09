import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(
    private localStorageService: LocalStorageService
  ) {}

  private getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  async getLibraryProjects() {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      const projects = this.localStorageService.getProjectLibrary(userId);
      return projects;
    } catch (error: any) {
      console.error('Error getting library projects:', error);
      return [];
    }
  }

  async addProjectToLibrary(projectId: number) {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      this.localStorageService.addProjectToLibrary(projectId, userId);
      return { message: 'Project added to library' };
    } catch (error) {
      console.error('Error adding project to library:', error);
      throw error;
    }
  }

  async removeProjectFromLibrary(projectId: number) {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      this.localStorageService.removeProjectFromLibrary(projectId, userId);
      return { message: 'Project removed from library' };
    } catch (error) {
      console.error('Error removing project from library:', error);
      throw error;
    }
  }

  async isProjectInLibrary(projectId: number): Promise<boolean> {
    const userId = this.getUserId();
    if (!userId) {
      return false;
    }

    try {
      const libraryProjects = this.localStorageService.getProjectLibrary(userId);
      return libraryProjects.some(p => p.id === projectId);
    } catch (error) {
      console.error('Error checking if project is in library:', error);
      return false;
    }
  }

  async getLibraryGames() {
    return this.getLibraryProjects();
  }

  async addGameToLibrary(gameId: number) {
    return this.addProjectToLibrary(gameId);
  }

  async removeGameFromLibrary(gameId: number) {
    return this.removeProjectFromLibrary(gameId);
  }

  async isGameInLibrary(gameId: number): Promise<boolean> {
    return this.isProjectInLibrary(gameId);
  }
}
