import { Injectable } from '@angular/core';

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  birthday?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private readonly CURRENT_USER_KEY = 'jamesstudio_current_user';

  constructor() {
    this.initializeDefaultUser();
  }

  private initializeDefaultUser(): void {
    if (!localStorage.getItem(this.CURRENT_USER_KEY)) {
      const defaultUser: User = {
        id: 1,
        username: 'admin',
        email: 'admin@jamesstudio.com',
        bio: 'Administrateur du site'
      };
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(defaultUser));
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
