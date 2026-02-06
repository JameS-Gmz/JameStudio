import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeColors {
  background: string;
  accent: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEMES_KEY = 'jamesstudio_user_themes';
  private readonly CURRENT_USER_KEY = 'jamesstudio_comment_email';
  private themeSubject = new BehaviorSubject<ThemeColors>(this.getDefaultTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  private getDefaultTheme(): ThemeColors {
    return {
      background: '#1F1F1F',
      accent: '#FFFFFF'
    };
  }

  private getCurrentUserId(): string | null {
    return localStorage.getItem(this.CURRENT_USER_KEY);
  }

  private getAllThemes(): Record<string, ThemeColors> {
    const themesData = localStorage.getItem(this.THEMES_KEY);
    if (!themesData) {
      return {};
    }
    try {
      return JSON.parse(themesData);
    } catch (e) {
      console.error('Error parsing themes:', e);
      return {};
    }
  }

  private saveAllThemes(themes: Record<string, ThemeColors>): void {
    localStorage.setItem(this.THEMES_KEY, JSON.stringify(themes));
  }

  private loadTheme(): void {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      this.applyTheme(this.getDefaultTheme());
      return;
    }

    const allThemes = this.getAllThemes();
    const userTheme = allThemes[userId];

    if (userTheme) {
      this.applyTheme(userTheme);
      this.themeSubject.next(userTheme);
    } else {
      this.applyTheme(this.getDefaultTheme());
    }
  }

  setTheme(theme: ThemeColors): void {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      this.applyTheme(theme);
      this.themeSubject.next(theme);
      return;
    }

    const allThemes = this.getAllThemes();
    allThemes[userId] = theme;
    this.saveAllThemes(allThemes);

    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  getCurrentTheme(): ThemeColors {
    return this.themeSubject.value;
  }

  getUserTheme(userId: string): ThemeColors {
    const allThemes = this.getAllThemes();
    return allThemes[userId] || this.getDefaultTheme();
  }

  resetTheme(): void {
    const userId = this.getCurrentUserId();
    const defaultTheme = this.getDefaultTheme();
    
    if (userId) {
      const allThemes = this.getAllThemes();
      delete allThemes[userId];
      this.saveAllThemes(allThemes);
    }
    
    this.applyTheme(defaultTheme);
    this.themeSubject.next(defaultTheme);
  }

  loadUserTheme(userId: string): void {
    const allThemes = this.getAllThemes();
    const userTheme = allThemes[userId];
    
    if (userTheme) {
      this.applyTheme(userTheme);
      this.themeSubject.next(userTheme);
    } else {
      this.applyTheme(this.getDefaultTheme());
    }
  }

  private applyTheme(theme: ThemeColors): void {
    const root = document.documentElement;
    
    root.style.setProperty('--bg-primary', theme.background);
    root.style.setProperty('--bg-secondary', this.adjustBrightness(theme.background, 2));
    root.style.setProperty('--bg-card', this.adjustBrightness(theme.background, 10));
    root.style.setProperty('--bg-card-hover', this.adjustBrightness(theme.background, 16));
    root.style.setProperty('--bg-header-footer', this.adjustBrightness(theme.background, -5));
    document.body.style.backgroundColor = theme.background;
    
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-hover', this.adjustBrightness(theme.accent, -10));
    root.style.setProperty('--accent-light', this.adjustBrightness(theme.accent, 10));
    root.style.setProperty('--accent-dark', this.adjustBrightness(theme.accent, -20));
    root.style.setProperty('--border-accent', theme.accent);
    
    const borderColor = this.hexToRgba(theme.accent, 0.2);
    root.style.setProperty('--border-color', borderColor);
    
    const glowColor = this.hexToRgba(theme.accent, 0.2);
    root.style.setProperty('--shadow-glow', `0 0 20px ${glowColor}`);
    
    root.style.setProperty('--accent-90', this.hexToRgba(theme.accent, 0.9));
    root.style.setProperty('--accent-80', this.hexToRgba(theme.accent, 0.8));
    root.style.setProperty('--accent-60', this.hexToRgba(theme.accent, 0.6));
    root.style.setProperty('--accent-50', this.hexToRgba(theme.accent, 0.5));
    root.style.setProperty('--accent-40', this.hexToRgba(theme.accent, 0.4));
    root.style.setProperty('--accent-30', this.hexToRgba(theme.accent, 0.3));
    root.style.setProperty('--accent-20', this.hexToRgba(theme.accent, 0.2));
    root.style.setProperty('--accent-15', this.hexToRgba(theme.accent, 0.15));
    root.style.setProperty('--accent-10', this.hexToRgba(theme.accent, 0.1));
    root.style.setProperty('--accent-05', this.hexToRgba(theme.accent, 0.05));
    
    const isDarkBackground = this.isDarkColor(theme.background);
    if (isDarkBackground) {
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--text-muted', 'rgba(255, 255, 255, 0.5)');
    } else {
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.8)');
      root.style.setProperty('--text-muted', 'rgba(0, 0, 0, 0.5)');
    }
  }

  private isDarkColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
