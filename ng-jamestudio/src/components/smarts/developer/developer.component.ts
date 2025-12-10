import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.css'
})
export class DeveloperComponent implements OnInit {
  projects: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedProject: any = null;
  isEditing: boolean = false;
  showDeleteConfirm: boolean = false;
  projectToDelete: number | null = null;

  constructor(
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDeveloperProjects();
  }

  async loadDeveloperProjects() {
    try {
      this.loading = true;
      this.error = null;
      const developerId = await this.userService.getCurrentDeveloperId();
      
      if (!developerId) {
        throw new Error('Developer ID not found');
      }

      this.projects = await this.projectService.getProjectsByUserId(developerId);
    } catch (error) {
      console.error('Error:', error);
      this.error = error instanceof Error ? error.message : 'Error loading projects';
    } finally {
      this.loading = false;
    }
  }

  editProject(project: any) {
    this.selectedProject = { ...project };
    this.isEditing = true;
  }

  scrollToEditForm() {
    setTimeout(() => {
      const element = document.getElementById('editForm');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cancelEdit() {
    this.selectedProject = null;
    this.isEditing = false;
  }

  async updateProject() {
    try {
      if (!this.selectedProject) return;

      const updatedProject = await this.projectService.updateProject(
        this.selectedProject.id.toString(),
        {
          title: this.selectedProject.title,
          description: this.selectedProject.description,
          technologies: this.selectedProject.technologies,
          github: this.selectedProject.github,
          demo: this.selectedProject.demo,
          authorStudio: this.selectedProject.authorStudio
        }
      );

      const index = this.projects.findIndex(p => p.id === updatedProject.id);
      if (index !== -1) {
        this.projects = [
          ...this.projects.slice(0, index),
          { ...updatedProject },
          ...this.projects.slice(index + 1)
        ];
      }

      this.cancelEdit();
    } catch (error) {
      console.error('Error updating project:', error);
      this.error = 'Error updating project';
    }
  }

  requestDeleteProject(projectId: number) {
    this.projectToDelete = projectId;
    this.showDeleteConfirm = true;
  }

  cancelDeleteProject() {
    this.showDeleteConfirm = false;
    this.projectToDelete = null;
  }

  confirmDeleteProject() {
    if (!this.projectToDelete) {
      return;
    }

    this.projectService.deleteProject(this.projectToDelete.toString())
      .then(() => {
        this.projects = this.projects.filter(project => project.id !== this.projectToDelete);
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
      })
      .catch(error => {
        console.error('Error deleting:', error);
        this.error = 'Error deleting project';
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
      });
  }
}
