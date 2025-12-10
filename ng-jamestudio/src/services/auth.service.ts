import { Injectable } from '@angular/core';
import { LocalAuthService } from './local-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private localAuth: LocalAuthService
  ) {}

  isAuthenticated(): boolean {
    return this.localAuth.isAuthenticated();
  }

  getCurrentUser() {
    return this.localAuth.getCurrentUser();
  }
}
