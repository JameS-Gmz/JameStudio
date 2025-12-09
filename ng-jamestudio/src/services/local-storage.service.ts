import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly PROJECTS_KEY = 'jamesstudio_projects';
  private readonly LIBRARIES_KEY = 'jamesstudio_libraries';
  private nextProjectId: number = 1;

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Initialiser les projets si la clé n'existe pas
    if (!localStorage.getItem(this.PROJECTS_KEY)) {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify([]));
    }
    
    // Initialiser les bibliothèques si la clé n'existe pas
    if (!localStorage.getItem(this.LIBRARIES_KEY)) {
      localStorage.setItem(this.LIBRARIES_KEY, JSON.stringify({}));
    }

    // Calculer le prochain ID disponible
    const projects = this.getAllProjects();
    if (projects.length > 0) {
      this.nextProjectId = Math.max(...projects.map(p => p.id)) + 1;
    }
  }

  // ========== GESTION DES PROJETS ==========

  getAllProjects(): Project[] {
    const data = localStorage.getItem(this.PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getProjectById(id: number): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  createProject(projectData: Partial<Project>): Project {
    const projects = this.getAllProjects();
    const newProject: Project = {
      id: this.nextProjectId++,
      title: projectData.title || '',
      description: projectData.description || '',
      technologies: projectData.technologies || [],
      github: projectData.github || null,
      demo: projectData.demo || null,
      imageUrl: projectData.imageUrl || undefined,
      images: projectData.images || [],
      UserId: projectData.UserId || 1,
      StatusId: projectData.StatusId || 1,
      LanguageId: projectData.LanguageId || 1,
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
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  }

  updateProject(id: number, projectData: Partial<Project>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedProject: Project = {
      ...projects[index],
      ...projectData,
      id, // S'assurer que l'ID ne change pas
      updatedAt: new Date().toISOString()
    };

    projects[index] = updatedProject;
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return updatedProject;
  }

  deleteProject(id: number): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    
    if (filtered.length === projects.length) {
      return false; // Projet non trouvé
    }

    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filtered));
    
    // Supprimer aussi de toutes les bibliothèques
    this.removeProjectFromAllLibraries(id);
    
    return true;
  }

  searchProjects(query: string): Project[] {
    const projects = this.getAllProjects();
    if (!query || !query.trim()) {
      return [];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    return projects.filter(project => {
      const titleMatch = project.title?.toLowerCase().includes(lowerQuery) || false;
      const descriptionMatch = project.description?.toLowerCase().includes(lowerQuery) || false;
      const techMatch = project.technologies && Array.isArray(project.technologies)
        ? project.technologies.some(tech => 
            tech && typeof tech === 'string' && tech.toLowerCase().includes(lowerQuery)
          )
        : false;
      
      return titleMatch || descriptionMatch || techMatch;
    });
  }

  getProjectsByDate(): Project[] {
    const projects = this.getAllProjects();
    return [...projects].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  getProjectsByUpdateDate(): Project[] {
    const projects = this.getAllProjects();
    return [...projects].sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }

  getProjectsByUserId(userId: number): Project[] {
    const projects = this.getAllProjects();
    return projects.filter(p => p.UserId === userId);
  }

  // ========== GESTION DES BIBLIOTHÈQUES ==========

  private getLibraries(): { [userId: number]: number[] } {
    const data = localStorage.getItem(this.LIBRARIES_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveLibraries(libraries: { [userId: number]: number[] }): void {
    localStorage.setItem(this.LIBRARIES_KEY, JSON.stringify(libraries));
  }

  addProjectToLibrary(projectId: number, userId: number): void {
    const libraries = this.getLibraries();
    if (!libraries[userId]) {
      libraries[userId] = [];
    }
    
    if (!libraries[userId].includes(projectId)) {
      libraries[userId].push(projectId);
      this.saveLibraries(libraries);
    }
  }

  removeProjectFromLibrary(projectId: number, userId: number): void {
    const libraries = this.getLibraries();
    if (libraries[userId]) {
      libraries[userId] = libraries[userId].filter(id => id !== projectId);
      this.saveLibraries(libraries);
    }
  }

  getProjectLibrary(userId: number): Project[] {
    const libraries = this.getLibraries();
    const projectIds = libraries[userId] || [];
    const projects = this.getAllProjects();
    
    return projects.filter(p => projectIds.includes(p.id));
  }

  private removeProjectFromAllLibraries(projectId: number): void {
    const libraries = this.getLibraries();
    Object.keys(libraries).forEach(userId => {
      libraries[parseInt(userId)] = libraries[parseInt(userId)].filter(id => id !== projectId);
    });
    this.saveLibraries(libraries);
  }

  // ========== GESTION DES IMAGES ==========

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

