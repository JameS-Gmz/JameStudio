import { booleanAttribute, Component, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InputFileComponent } from "../input-file/input-file.component";
import { FormBuilder, FormsModule, NgForm } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-form-game',
  standalone: true,
  imports: [InputFileComponent, FormsModule, CommonModule],
  templateUrl: './form-game.component.html',
  styleUrl: './form-game.component.css'
})
export class FormGameComponent implements OnDestroy {
  @ViewChild('postGameForm') postGameForm!: NgForm;
  selectedFiles: File[] = [];
  previewImageUrls: string[] = [];
  private languageSubscription?: Subscription;
  
  form = {
    title: '',
    description: '',
  };

  constructor(private translationService: TranslationService) {}

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  isValid(): boolean | null {
    return this.postGameForm ? this.postGameForm.valid : null;
  }

  getFormValues() {
    const technologies = this.postGameForm.value.technologies 
      ? this.postGameForm.value.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech.length > 0)
      : [];
    
    const titleFr = this.postGameForm.value.titleFr || '';
    const titleEn = this.postGameForm.value.titleEn || '';
    const descriptionFr = this.postGameForm.value.descriptionFr || '';
    const descriptionEn = this.postGameForm.value.descriptionEn || '';
    
    const title = titleFr || titleEn || '';
    const description = JSON.stringify({
      fr: descriptionFr || descriptionEn || '',
      en: descriptionEn || descriptionFr || ''
    });
    
    return {
      title: title || JSON.stringify({ fr: titleFr, en: titleEn }),
      description: description,
      technologies: technologies,
      github: this.postGameForm.value.github || null,
      demo: this.postGameForm.value.demo || null,
    }
  }

  resetForm() {
    if (this.postGameForm) {
      this.postGameForm.resetForm();
    }
    this.selectedFiles = [];
    this.previewImageUrls = [];
  }

  onFilesSelected(files: File[]) {
    this.selectedFiles = files;
    this.previewImageUrls = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  onFileSelected(file: File) {
    this.selectedFiles = [file];
    this.previewImageUrls = [];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImageUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImageUrls.splice(index, 1);
  }
}
