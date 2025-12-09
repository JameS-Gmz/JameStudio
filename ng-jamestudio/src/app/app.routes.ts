import { Routes } from '@angular/router';
import { HomeComponent } from '../components/dumbs/home/home.component';
import { GameComponent } from '../components/smarts/game/game.component';
import { AllGamesComponent } from '../components/dumbs/all-games/all-games.component';
import { GameDetailsComponent } from '../components/smarts/game-details/game-details.component';
import { DeveloperComponent } from '../components/smarts/developer/developer.component';
import { simpleAuthGuard } from '../guards/simple-auth.guard';
import { AdminLoginComponent } from '../components/smarts/admin-login/admin-login.component';
import { ContactComponent } from '../components/smarts/contact/contact.component';
import { TermsOfServiceComponent } from '../components/dumbs/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from '../components/dumbs/privacy-policy/privacy-policy.component';
import { CookiesComponent } from '../components/dumbs/cookies/cookies.component';
import { LegalNoticeComponent } from '../components/dumbs/legal-notice/legal-notice.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "all-projects", component: AllGamesComponent },
    { path: "project/id/:id", component: GameDetailsComponent },
    { path: "admin-login", component: AdminLoginComponent },
    { path: "project", component: GameComponent, canActivate: [simpleAuthGuard] },
    { path: "developer", component: DeveloperComponent, canActivate: [simpleAuthGuard] },
    { path: "contact-us", component: ContactComponent },
    { path: "terms-of-service", component: TermsOfServiceComponent },
    { path: "privacy-policy", component: PrivacyPolicyComponent },
    { path: "cookies", component: CookiesComponent },
    { path: "legal-notice", component: LegalNoticeComponent },
    { path: "game", redirectTo: "project", pathMatch: "full" },
    { path: "all-games", redirectTo: "all-projects", pathMatch: "full" },
    { path: "game/id/:id", redirectTo: "project/id/:id", pathMatch: "full" },
];
