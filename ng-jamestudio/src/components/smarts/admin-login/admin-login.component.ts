import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleAuthService } from '../../../services/simple-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: SimpleAuthService,
    private router: Router
  ) {
    // Si déjà authentifié, rediriger vers la page d'ajout de projets
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/project']);
    }
  }

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    if (!this.password) {
      this.error = 'Veuillez entrer un mot de passe';
      this.isLoading = false;
      return;
    }

    if (this.authService.login(this.password)) {
      // Connexion réussie, rediriger vers la page d'ajout de projets
      this.router.navigate(['/project']);
    } else {
      this.error = 'Mot de passe incorrect';
      this.isLoading = false;
    }
  }
}

