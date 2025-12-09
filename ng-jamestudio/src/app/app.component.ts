import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../components/dumbs/header/header.component";
import { FooterComponent } from "../components/dumbs/footer/footer.component";
import { ThemeService } from '../services/theme.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, RouterLink, HeaderComponent, FooterComponent, RouterModule]
})
export class AppComponent implements OnInit {
  title = 'PlayForge';

  constructor(private themeService: ThemeService) {
    const currentTheme = this.themeService.getCurrentTheme();
    this.themeService.setTheme(currentTheme);
  }

  ngOnInit(): void {
    this.themeService.theme$.subscribe();
  }
}
