import { booleanAttribute, Component, ViewChild } from '@angular/core';
import { InputFileComponent } from "../input-file/input-file.component";
import { FormBuilder, FormsModule, NgForm } from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-game',
  standalone: true,
  imports: [InputFileComponent, FormsModule, CommonModule],
  templateUrl: './form-game.component.html',
  styleUrl: './form-game.component.css'
})
export class FormGameComponent {
  @ViewChild('postGameForm') postGameForm!: NgForm;
  selectedFiles: File[] = [];
  previewImageUrls: string[] = [];
  
  form = {
    title: '',
    description: '',
  };

  isValid(): boolean | null {
    return this.postGameForm ? this.postGameForm.valid : null;
  }

  getFormValues() {
    const technologies = this.postGameForm.value.technologies 
      ? this.postGameForm.value.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech.length > 0)
      : [];
    
    return {
      title: this.postGameForm.value.title,
      description: this.postGameForm.value.description,
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
