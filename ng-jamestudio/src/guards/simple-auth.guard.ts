import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleAuthService } from '../services/simple-auth.service';

/**
 * Guard simple pour protéger la route d'ajout de projets
 */
export const simpleAuthGuard = () => {
  const authService = inject(SimpleAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers la page de login pour l'ajout de projets
  return router.parseUrl('/admin-login');
};

