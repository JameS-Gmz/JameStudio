import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameDateListComponent } from "../../smarts/game-date-list/game-date-list.component";
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameDateListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'fr';
  private languageSubscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.languageSubscription = this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
