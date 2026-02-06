import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleAuthService } from '../../../services/simple-auth.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnDestroy {
  password: string = '';
  error: string = '';
  isLoading: boolean = false;
  private languageSubscription?: Subscription;

  constructor(
    private authService: SimpleAuthService,
    private router: Router,
    private translationService: TranslationService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/project']);
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    if (!this.password) {
      this.error = this.translate('admin.passwordPlaceholder');
      this.isLoading = false;
      return;
    }

    if (this.authService.login(this.password)) {
      this.router.navigate(['/project']);
    } else {
      this.error = this.translate('common.error');
      this.isLoading = false;
    }
  }
}

