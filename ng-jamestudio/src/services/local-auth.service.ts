import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
  birthday?: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private readonly USERS_KEY = 'jamesstudio_users';
  private readonly CURRENT_USER_KEY = 'jamesstudio_current_user';
  private nextUserId: number = 1;

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private roleSubject = new BehaviorSubject<string | null>(null);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor() {
    this.initializeUsers();
    this.checkAuthStatus();
  }

  private initializeUsers(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@jamesstudio.com',
          password: 'admin123',
          role: 'admin',
          bio: 'Administrateur du site'
        },
        {
          id: 2,
          username: 'developer',
          email: 'dev@jamesstudio.com',
          password: 'dev123',
          role: 'developer',
          bio: 'Développeur web'
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
      this.nextUserId = 3;
    } else {
      const users = this.getUsers();
      if (users.length > 0) {
        this.nextUserId = Math.max(...users.map(u => u.id)) + 1;
      }
    }
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateToken(userId: number, role: string): string {
    const payload = {
      userId,
      role,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };
    return btoa(JSON.stringify(payload));
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
    
    if (token && currentUser) {
      try {
        const payload = JSON.parse(atob(token));
        if (payload.exp > Date.now()) {
          const user = JSON.parse(currentUser);
          this.isLoggedInSubject.next(true);
          this.roleSubject.next(user.role);
          return;
        }
      } catch (e) {
      }
    }
    
    this.isLoggedInSubject.next(false);
    this.roleSubject.next(null);
  }

  async signUp(userData: any): Promise<any> {
    const users = this.getUsers();
    
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    if (users.some(u => u.username === userData.username)) {
      throw new Error('Ce nom d\'utilisateur est déjà utilisé');
    }

    const newUser: User = {
      id: this.nextUserId++,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: 'user',
      bio: userData.bio || '',
      avatar: userData.avatar || '',
      birthday: userData.birthday || null
    };

    users.push(newUser);
    this.saveUsers(users);

    return this.signIn({ email: userData.email, password: userData.password });
  }

  async signIn(credentials: any): Promise<any> {
    const users = this.getUsers();
    const user = users.find(
      u => (u.email === credentials.email || u.username === credentials.email) 
        && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = this.generateToken(user.id, user.role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

    this.isLoggedInSubject.next(true);
    this.roleSubject.next(user.role);

    return {
      token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        birthday: user.birthday,
        role: user.role
      }
    };
  }

  async updateProfile(userData: any): Promise<any> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userData.id);

    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }

    users[userIndex] = {
      ...users[userIndex],
      username: userData.username || users[userIndex].username,
      email: userData.email || users[userIndex].email,
      bio: userData.bio !== undefined ? userData.bio : users[userIndex].bio,
      avatar: userData.avatar !== undefined ? userData.avatar : users[userIndex].avatar,
      birthday: userData.birthday !== undefined ? userData.birthday : users[userIndex].birthday
    };

    this.saveUsers(users);

    const currentUser = JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY) || '{}');
    if (currentUser.id === userData.id) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }

    const token = this.generateToken(users[userIndex].id, users[userIndex].role);
    localStorage.setItem('token', token);

    return {
      token,
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        bio: users[userIndex].bio,
        avatar: users[userIndex].avatar,
        birthday: users[userIndex].birthday,
        role: users[userIndex].role
      }
    };
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.isLoggedInSubject.next(false);
    this.roleSubject.next(null);
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

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'superadmin';
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'superadmin';
  }

  isDeveloper(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'developer' || user?.role === 'admin' || user?.role === 'superadmin';
  }
}
