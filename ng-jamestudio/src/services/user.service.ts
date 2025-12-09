import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalAuthService } from './local-auth.service';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: string | number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  birthday?: string;
  role?: Role | string;
  RoleId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor(private localAuth: LocalAuthService) {
    const currentUser = this.localAuth.getCurrentUser();
    if (currentUser) {
      this.userSubject.next({
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio,
        avatar: currentUser.avatar,
        birthday: currentUser.birthday,
        role: currentUser.role
      });
    }
  }

  getCurrentUser(): User | null {
    const localUser = this.localAuth.getCurrentUser();
    if (localUser) {
      return {
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        bio: localUser.bio,
        avatar: localUser.avatar,
        birthday: localUser.birthday,
        role: localUser.role
      };
    }
    return this.userSubject.value;
  }

  setCurrentUser(user: User | null): void {
    this.userSubject.next(user);
  }

  async getAllUsers(): Promise<User[]> {
    const current = this.getCurrentUser();
    return current ? [current] : [];
  }

  async getUserById(userId: string | number): Promise<User> {
    const current = this.getCurrentUser();
    if (current && (current.id === userId || current.id.toString() === userId.toString())) {
      return current;
    }
    throw new Error('User not found');
  }

  async getUserByUsername(username: string): Promise<User> {
    const current = this.getCurrentUser();
    if (current && current.username === username) {
      return current;
    }
    throw new Error('User not found');
  }

  async getRoles(): Promise<Role[]> {
    return [
      { id: 1, name: 'user' },
      { id: 2, name: 'developer' },
      { id: 3, name: 'admin' },
      { id: 4, name: 'superadmin' }
    ];
  }

  async getCurrentDeveloperId(): Promise<number> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not logged in');
    }
    return typeof user.id === 'number' ? user.id : parseInt(user.id);
  }

  async updateUser(user: User): Promise<User> {
    const result = await this.localAuth.updateProfile(user);
    return result.user as User;
  }

  async deleteUser(userId: string): Promise<void> {
    throw new Error('User deletion not supported in static mode');
  }

  async assignUserRole(userId: number): Promise<void> {
    console.warn('Role assignment not supported in static mode');
  }

  async assignDeveloperRole(userId: string): Promise<void> {
    console.warn('Role assignment not supported in static mode');
  }

  async assignAdminRole(userId: string): Promise<void> {
    console.warn('Role assignment not supported in static mode');
  }

  async assignSuperAdminRole(userId: string): Promise<void> {
    console.warn('Role assignment not supported in static mode');
  }
}
