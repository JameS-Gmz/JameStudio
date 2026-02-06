import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavItemComponent} from "../../smarts/nav-item/nav-item.component";
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NavItemComponent, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnDestroy {
  isExpanded = false;
  private languageSubscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  toggleFooter() {
    this.isExpanded = !this.isExpanded;
  }
}
