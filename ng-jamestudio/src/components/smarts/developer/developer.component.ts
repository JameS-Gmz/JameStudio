import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.css'
})
export class DeveloperComponent implements OnInit, OnDestroy {
  projects: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedProject: any = null;
  isEditing: boolean = false;
  showDeleteConfirm: boolean = false;
  projectToDelete: number | null = null;
  private languageSubscription?: Subscription;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    public translationService: TranslationService
  ) {}

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.loadDeveloperProjects();
  }

  async loadDeveloperProjects() {
    try {
      this.loading = true;
      this.error = null;
      const developerId = await this.userService.getCurrentDeveloperId();
      
      if (!developerId) {
        throw new Error('ID développeur non trouvé');
      }

      this.projects = await this.projectService.getProjectsByUserId(developerId);
    } catch (error) {
      console.error('Erreur:', error);
      this.error = error instanceof Error ? error.message : 'Erreur lors du chargement des projets';
    } finally {
      this.loading = false;
    }
  }

  editProject(project: any) {
    const titleFr = this.translationService.getMultilingualText(project.title, '');
    const titleEn = this.translationService.getMultilingualText(project.title, '');
    const descriptionFr = this.translationService.getMultilingualText(project.description, '');
    const descriptionEn = this.translationService.getMultilingualText(project.description, '');
    
    let parsedTitle: any = {};
    let parsedDescription: any = {};
    
    try {
      if (typeof project.title === 'string') {
        const titleParsed = JSON.parse(project.title);
        if (typeof titleParsed === 'object' && titleParsed !== null) {
          parsedTitle = titleParsed;
        } else {
          parsedTitle = { fr: project.title, en: '' };
        }
      } else if (typeof project.title === 'object') {
        parsedTitle = project.title;
      } else {
        parsedTitle = { fr: project.title || '', en: '' };
      }
    } catch (e) {
      parsedTitle = { fr: project.title || '', en: '' };
    }
    
    try {
      if (typeof project.description === 'string') {
        const descParsed = JSON.parse(project.description);
        if (typeof descParsed === 'object' && descParsed !== null) {
          parsedDescription = descParsed;
        } else {
          parsedDescription = { fr: project.description || '', en: '' };
        }
      } else if (typeof project.description === 'object') {
        parsedDescription = project.description;
      } else {
        parsedDescription = { fr: project.description || '', en: '' };
      }
    } catch (e) {
      parsedDescription = { fr: project.description || '', en: '' };
    }
    
    this.selectedProject = { 
      ...project,
      titleFr: parsedTitle.fr || '',
      titleEn: parsedTitle.en || '',
      descriptionFr: parsedDescription.fr || '',
      descriptionEn: parsedDescription.en || ''
    };
    this.isEditing = true;
    this.scrollToEditForm();
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

      const titleFr = this.selectedProject.titleFr || '';
      const titleEn = this.selectedProject.titleEn || '';
      const descriptionFr = this.selectedProject.descriptionFr || '';
      const descriptionEn = this.selectedProject.descriptionEn || '';
      
      const title = titleFr || titleEn || '';
      const description = JSON.stringify({
        fr: descriptionFr || descriptionEn || '',
        en: descriptionEn || descriptionFr || ''
      });

      const updatedProject = await this.projectService.updateProject(
        this.selectedProject.id.toString(),
        {
          title: title || JSON.stringify({ fr: titleFr, en: titleEn }),
          description: description,
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
      console.error('Erreur lors de la mise à jour du projet:', error);
      this.error = 'Erreur lors de la mise à jour du projet';
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
        console.error('Erreur lors de la suppression:', error);
        this.error = 'Erreur lors de la suppression du projet';
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
      });
  }
}
