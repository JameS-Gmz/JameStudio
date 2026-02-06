import { Component, EventEmitter, Output, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { TranslationService } from '../../../services/translation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FileService } from '../../../services/file-service.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css'
})
export class SearchbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  projects: any[] = [];
  errorMessage: string = '';
  imageUrl: string | undefined;
  isLoading: boolean = false;
  showResults: boolean = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  @Output() searchResults = new EventEmitter<any[]>();

  constructor(
    private projectService: ProjectService, 
    private fileService: FileService,
    public translationService: TranslationService,
    private elementRef: ElementRef
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeResults();
    }
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput() {
    this.showResults = true;
    this.searchSubject.next(this.searchQuery.trim());
  }

  public closeResults() {
    this.showResults = false;
  }

  private async performSearch(query: string) {
    if (!query || !query.trim()) {
      this.projects = [];
      this.errorMessage = '';
      this.searchResults.emit([]);
      this.showResults = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const result = await this.projectService.searchProjects(query.trim());
      console.log('Search results:', result);
      
      this.projects = result.map((project: any) => {
        let technologies: string[] = [];
        if (project.technologies) {
          if (typeof project.technologies === 'string') {
            technologies = project.technologies.split(',').map((t: string) => t.trim()).filter((t: string) => t);
          } else if (Array.isArray(project.technologies)) {
            technologies = project.technologies.filter((t: any) => t);
          }
        }
        
        return {
          title: project.title || 'Sans titre',
          id: project.id,
          imageUrl: project.imageUrl || '/assets/images/default-project.jpg',
          description: project.description || '',
          technologies: technologies,
          github: project.github,
          demo: project.demo
        };
      });
      
      this.errorMessage = this.projects.length === 0 ? this.translate('search.noResults') : '';
      this.searchResults.emit(this.projects);
      this.showResults = true;
    } catch (error: any) {
      console.error('Error searching:', error);
      this.errorMessage = this.translate('search.error');
      this.projects = [];
      this.searchResults.emit([]);
    } finally {
      this.isLoading = false;
    }
  }

  reset() {
    this.searchQuery = '';
    this.projects = [];
    this.errorMessage = '';
    this.searchResults.emit([]);
    this.closeResults();
  }
}
