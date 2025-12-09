import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalAuthService } from './local-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn$ = this.localAuth.isLoggedIn$;
  role$ = this.localAuth.role$;

  constructor(
    private localAuth: LocalAuthService
  ) {}

  async signUp(userData: any): Promise<any> {
    const result = await this.localAuth.signUp(userData);
    return result.user.id;
  }

  async signIn(userData: any): Promise<any> {
    return this.localAuth.signIn(userData);
  }

  async updateProfile(userData: any): Promise<any> {
    return this.localAuth.updateProfile(userData);
  }

  logout(): void {
    this.localAuth.logout();
  }

  isAuthenticated(): boolean {
    return this.localAuth.isAuthenticated();
  }

  checkTokenContent() {
    const user = this.localAuth.getCurrentUser();
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          return JSON.parse(atob(token));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  isAdmin(): boolean {
    return this.localAuth.isAdmin();
  }

  isSuperAdmin(): boolean {
    return this.localAuth.isSuperAdmin();
  }

  isDeveloper(): boolean {
    return this.localAuth.isDeveloper();
  }

  checkTokenExpiration(): boolean {
    return this.localAuth.isAuthenticated();
  }
}
