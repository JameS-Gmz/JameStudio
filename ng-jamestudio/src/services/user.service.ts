import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalAuthService } from './local-auth.service';

interface User {
  id: string | number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  birthday?: string;
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
        birthday: currentUser.birthday
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
        birthday: localUser.birthday
      };
    }
    return this.userSubject.value;
  }

  async getCurrentDeveloperId(): Promise<number> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not logged in');
    }
    return typeof user.id === 'number' ? user.id : parseInt(user.id);
  }
}
