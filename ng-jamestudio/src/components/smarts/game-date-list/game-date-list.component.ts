import { Component, OnInit, Input } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { CardGameComponent } from "../../dumbs/card-game/card-game.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-date-list',
  standalone: true,
  imports: [CardGameComponent, CommonModule],
  templateUrl: './game-date-list.component.html',
  styleUrl: './game-date-list.component.css'
})
export class GameDateListComponent implements OnInit {
  @Input() listType: 'recent' | 'updated' = 'recent';
  projects: any[] = [];
  isLoading = true;

  constructor(private projectService: ProjectService) { }

  async ngOnInit() {
    try {
      console.log('Loading projects, type:', this.listType);
      this.projects = this.listType === 'recent' 
        ? await this.projectService.getProjectsByDate()
        : await this.projectService.getProjectsByDate();
      console.log('Projects loaded:', this.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
