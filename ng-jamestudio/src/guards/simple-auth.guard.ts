import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleAuthService } from '../services/simple-auth.service';

export const simpleAuthGuard = () => {
  const authService = inject(SimpleAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/admin-login');
};

