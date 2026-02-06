import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SimpleAuthService } from '../../../services/simple-auth.service';
import { ThemeService, ThemeColors } from '../../../services/theme.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentTheme: ThemeColors = { background: '#000000', accent: '#ffffff' };
  currentUserEmail: string | null = null;
  private themeSubscription?: Subscription;

  showLogoutConfirm: boolean = false;
  showResetConfirm: boolean = false;
  showEmailInput: boolean = false;
  newEmail: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: SimpleAuthService,
    private themeService: ThemeService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    
    this.currentUserEmail = localStorage.getItem('jamesstudio_comment_email');
    
    if (this.currentUserEmail) {
      this.themeService.loadUserTheme(this.currentUserEmail);
    }
    
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = { ...theme };
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showLogoutConfirm = false;
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 100);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  onBackgroundColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTheme: ThemeColors = {
      ...this.currentTheme,
      background: input.value
    };
    this.themeService.setTheme(newTheme);
  }

  onBackgroundTextChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (this.isValidHexColor(value)) {
      const newTheme: ThemeColors = {
        ...this.currentTheme,
        background: value
      };
      this.themeService.setTheme(newTheme);
    }
  }

  onAccentColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTheme: ThemeColors = {
      ...this.currentTheme,
      accent: input.value
    };
    this.themeService.setTheme(newTheme);
  }

  onAccentTextChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (this.isValidHexColor(value)) {
      const newTheme: ThemeColors = {
        ...this.currentTheme,
        accent: value
      };
      this.themeService.setTheme(newTheme);
    }
  }

  resetTheme(): void {
    this.showResetConfirm = true;
  }

  confirmResetTheme(): void {
    this.themeService.resetTheme();
    this.showResetConfirm = false;
    this.successMessage = 'Thème réinitialisé avec succès !';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  cancelResetTheme(): void {
    this.showResetConfirm = false;
  }

  openEmailInput(): void {
    this.showEmailInput = true;
    this.newEmail = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEmailInput(): void {
    this.showEmailInput = false;
    this.newEmail = '';
    this.errorMessage = '';
  }

  saveEmail(): void {
    if (!this.newEmail || !this.newEmail.trim()) {
      this.errorMessage = 'Veuillez entrer un email';
      return;
    }

    if (!this.isValidEmail(this.newEmail)) {
      this.errorMessage = 'Email invalide. Veuillez entrer un email valide.';
      return;
    }

    const normalizedEmail = this.newEmail.toLowerCase().trim();
    localStorage.setItem('jamesstudio_comment_email', normalizedEmail);
    this.currentUserEmail = normalizedEmail;
    
    this.themeService.loadUserTheme(normalizedEmail);
    
    this.showEmailInput = false;
    this.newEmail = '';
    this.errorMessage = '';
    this.successMessage = 'Email sauvegardé ! Vos préférences de thème seront maintenant sauvegardées.';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  closeMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
}
