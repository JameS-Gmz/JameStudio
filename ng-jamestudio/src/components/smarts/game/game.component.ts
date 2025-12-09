import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { FormGameComponent } from '../form-game/form-game.component';
import { FileService } from '../../../services/file-service.service';
import { CommonModule } from '@angular/common';

interface FormErrors {
  title?: string;
  description?: string;
  github?: string;
  demo?: string;
  general?: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [FormsModule, FormGameComponent, CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {
  @ViewChild('postGameForm') postGameForm!: FormGameComponent;

  formErrors: FormErrors = {};
  hasErrors: boolean = false;
  isSuccess: boolean = false;
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private projectService: ProjectService,
    private fileService: FileService
  ) { }

  ngAfterViewInit(): void { }

  private getUserId(): number {
    return 1;
  }

  private showError(errors: FormErrors) {
    this.formErrors = errors;
    this.hasErrors = true;
    this.isSuccess = false;
    setTimeout(() => {
      this.hasErrors = false;
      this.formErrors = {};
    }, 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.isSuccess = true;
    this.hasErrors = false;
    setTimeout(() => {
      this.isSuccess = false;
      this.successMessage = '';
    }, 5000);
  }

  private validateForm(postGameFormValues: any): FormErrors {
    const errors: FormErrors = {};

    if (!postGameFormValues.title?.trim()) {
      errors.title = 'Le titre du projet est requis';
    } else if (postGameFormValues.title.length > 100) {
      errors.title = 'Le titre ne doit pas dépasser 100 caractères';
    }

    if (!postGameFormValues.description?.trim()) {
      errors.description = 'La description du projet est requise';
    } else if (postGameFormValues.description.length > 2000) {
      errors.description = 'La description ne doit pas dépasser 2000 caractères';
    }

    if (postGameFormValues.github && postGameFormValues.github.trim() !== '') {
      try {
        const url = new URL(postGameFormValues.github);
        if (!url.hostname.includes('github.com')) {
          errors.github = 'L\'URL doit être un lien GitHub valide';
        }
      } catch (e) {
        errors.github = 'L\'URL GitHub n\'est pas valide';
      }
    }

    if (postGameFormValues.demo && postGameFormValues.demo.trim() !== '') {
      try {
        new URL(postGameFormValues.demo);
      } catch (e) {
        errors.demo = 'L\'URL de démo n\'est pas valide';
      }
    }

    return errors;
  }

  async onSubmit() {
    if (!this.postGameForm) {
      this.showError({ general: 'Erreur: Formulaire non initialisé' });
      return;
    }

    if (!this.postGameForm.isValid()) {
      this.showError({ general: 'Veuillez remplir tous les champs requis' });
      return;
    }

    this.isSubmitting = true;
    this.hasErrors = false;
    this.isSuccess = false;

    const postGameFormValues = this.postGameForm.getFormValues();

    const errors = this.validateForm(postGameFormValues);
    if (Object.keys(errors).length > 0) {
      this.showError(errors);
      this.isSubmitting = false;
      return;
    }

    const userId = this.getUserId();

    const projectData: any = {
      title: postGameFormValues.title,
      description: postGameFormValues.description,
      technologies: postGameFormValues.technologies || [],
      github: postGameFormValues.github || null,
      demo: postGameFormValues.demo || null,
      UserId: userId,
      authorStudio: 'JamesStudio',
      madeWith: postGameFormValues.technologies?.join(', ') || ''
    };

    try {
      const result = await this.projectService.sendProjectData(projectData);
      const projectId = result.id;

      if (this.postGameForm.selectedFiles && this.postGameForm.selectedFiles.length > 0 && projectId) {
        for (const file of this.postGameForm.selectedFiles) {
          await this.fileService.uploadFile(file, projectId);
        }
      }

      this.showSuccess('Projet ajouté avec succès !');
      
      setTimeout(() => {
        this.postGameForm.resetForm();
        this.isSubmitting = false;
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de la création du projet:', error);
      this.showError({ 
        general: error.message || 'Erreur lors de la création du projet'
      });
      this.isSubmitting = false;
    }
  }
}
