import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service d'authentification simple pour l'ajout de projets
 * Utilise un mot de passe simple stocké dans localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class SimpleAuthService {
  private readonly ADMIN_PASSWORD_KEY = 'jamestudio_admin_password';
  private readonly ADMIN_PASSWORD = 'JameSAdmin!'; // ⚠️ CHANGEZ ICI : Mot de passe admin par défaut
  private readonly SESSION_KEY = 'jamestudio_admin_session';
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 heures

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkSession();
  }

  /**
   * Vérifier si une session valide existe
   */
  private checkSession(): void {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        if (session.expiresAt > now) {
          this.isAuthenticatedSubject.next(true);
          return;
        }
      } catch (e) {
        // Session invalide
      }
    }
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Se connecter avec un mot de passe
   */
  login(password: string): boolean {
    const savedPassword = localStorage.getItem(this.ADMIN_PASSWORD_KEY) || this.ADMIN_PASSWORD;
    
    if (password === savedPassword) {
      const session = {
        expiresAt: Date.now() + this.SESSION_DURATION
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    
    return false;
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    this.checkSession();
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Changer le mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): boolean {
    const savedPassword = localStorage.getItem(this.ADMIN_PASSWORD_KEY) || this.ADMIN_PASSWORD;
    
    if (oldPassword === savedPassword && newPassword.length >= 4) {
      localStorage.setItem(this.ADMIN_PASSWORD_KEY, newPassword);
      return true;
    }
    
    return false;
  }
}

