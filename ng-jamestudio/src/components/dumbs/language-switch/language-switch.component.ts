import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../../services/translation.service';

@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.css'
})
export class LanguageSwitchComponent implements OnInit {
  currentLanguage: Language = 'fr';
  isEnglish: boolean = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.isEnglish = this.currentLanguage === 'en';
    
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.isEnglish = lang === 'en';
    });
  }

  toggleLanguage(): void {
    const newLanguage: Language = this.currentLanguage === 'fr' ? 'en' : 'fr';
    this.translationService.setLanguage(newLanguage);
  }
}
