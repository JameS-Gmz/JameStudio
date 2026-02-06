import { Component, ComponentFactoryResolver, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardGameComponent } from "../card-game/card-game.component";
import { ProjectService } from '../../../services/project.service';
import { TranslationService } from '../../../services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-games',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './all-games.component.html',
  styleUrls: ['./all-games.component.css']
})
export class AllGamesComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  isLoading = true; // Indicateur de chargement
  errorMessage: string | null = null; // Message d'erreur
  private languageSubscription?: Subscription;

  constructor(
    private projectService: ProjectService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private translationService: TranslationService
  ) {}

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit() {
    this.loadProjects();
  }

  private async loadProjects() {
    try {
      const projects = await this.projectService.getAllProjects();
      this.renderProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
      this.errorMessage = this.translate('common.error');
    } finally {
      this.isLoading = false;
    }
  }

  private renderProjects(projects: any[]) {
    this.container.clear();

    projects
      .filter(project => project.title)
      .forEach(project => {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CardGameComponent);
        const componentRef = this.container.createComponent(componentFactory);
        componentRef.instance.game = project;  // Using 'game' property for compatibility with card component
      });
  }
}
