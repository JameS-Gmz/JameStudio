import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef, Renderer2, HostListener } from '@angular/core';
import { SearchbarComponent } from "../searchbar/searchbar.component";
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimpleAuthService } from '../../../services/simple-auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    imports: [
        CommonModule, 
        SearchbarComponent, 
        RouterModule
    ]
})
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
    isLoggedIn: boolean = false;
    isMobileMenuOpen: boolean = false;
    private resizeListener: () => void = () => {}; 
    private clickListener: () => void = () => {};
    private routerSubscription: Subscription | null = null;
    private authSubscription: Subscription | null = null;

    // Pour enregistrer les sections pour affichage mobile
    public mobileSections: Array<{
        label: string,
        icon: string,
        route: string,
        requiresLogin?: boolean,
        requiresLogout?: boolean
    }> = [
        { label: 'Home', icon: 'fas fa-home', route: '/' },
        { label: 'Contact & Settings', icon: 'fas fa-cog', route: '/contact-us' },
        { label: 'All Projects', icon: 'fas fa-project-diagram', route: '/all-projects' },
        { label: 'Add Project', icon: 'fas fa-plus-circle', route: '/project', requiresLogin: true },
        { label: 'My Projects', icon: 'fas fa-folder-open', route: '/developer', requiresLogin: true },
        { label: 'Admin', icon: 'fas fa-user-shield', route: '/admin-login', requiresLogout: true },
    ];

    constructor(
        private el: ElementRef<HTMLElement>, 
        private renderer: Renderer2,
        private router: Router,
        private authService: SimpleAuthService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // S'abonner aux changements d'authentification
        this.authSubscription = this.authService.isAuthenticated$.subscribe(loggedIn => {
            this.isLoggedIn = loggedIn;
            this.cdr.detectChanges();
            setTimeout(() => this.updateHoriSelector(), 100);
        });

        // S'abonner aux changements de route
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                setTimeout(() => {
                    this.updateHoriSelector();
                    // Fermer automatiquement le menu mobile lors d'un changement de route
                    if (this.isMobileMenuOpen) {
                        this.closeMobileMenu();
                    }
                }, 100);
            });
    }

    ngAfterViewInit(): void {
        // Initialiser le sélecteur après un court délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            // Activer la route courante
            this.activateCurrentRoute();
            this.updateHoriSelector();
        }, 200);

        // Écouteur sur resize
        this.resizeListener = this.renderer.listen('window', 'resize', () => {
            setTimeout(() => this.updateHoriSelector(), 100);
        });

    }

    ngOnDestroy(): void {
        if (this.resizeListener) this.resizeListener();
        if (this.clickListener) this.clickListener();
        if (this.routerSubscription) this.routerSubscription.unsubscribe();
        if (this.authSubscription) this.authSubscription.unsubscribe();
    }

    // Supporte le clic sur éléments de menu desktop ET mobile
    onNavClick(event: Event): void {
        const target = event.currentTarget as HTMLElement;
        const navItem = target.closest('li.nav-item');
        const navItems = this.el.nativeElement.querySelectorAll('.navbar-menu ul li.nav-item');
        
        // Retirer active de tous les items
        navItems.forEach((item: Element) => {
            item.classList.remove('active');
        });
        
        // Ajouter active à l'item cliqué
        if (navItem) {
            navItem.classList.add('active');
        }
        
        // Fermer le menu mobile si ouvert
        if (this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
        
        // Mettre à jour le sélecteur après un court délai pour laisser l'animation se faire
        setTimeout(() => {
            this.updateHoriSelector();
        }, 50);
    }

    // Méthode appelée pour le clic dans le menu mobile (car il peut être dans un <div> séparé)
    onMobileSectionClick(sectionRoute: string) {
        if (this.router.url !== sectionRoute) {
            this.router.navigate([sectionRoute]);
        }
        this.closeMobileMenu();
    }

    // Ajoute un gestionnaire pour cliquer hors du menu mobile et le fermer
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (this.isMobileMenuOpen) {
            const clickedInside = (this.el.nativeElement as HTMLElement).contains(event.target as Node);
            if (!clickedInside) {
                this.closeMobileMenu();
            }
        }
    }

    isActiveRoute(route: string): boolean {
        return this.router.url === route || (route !== '/' && this.router.url.startsWith(route));
    }

    // Sert à détecter si une section doit apparaître dans le menu mobile selon connexion
    shouldShowInMobile(section: { requiresLogin?: boolean, requiresLogout?: boolean }): boolean {
        if (section.requiresLogin && !this.isLoggedIn) return false;
        if (section.requiresLogout && this.isLoggedIn) return false;
        return true;
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.toggleMobileMenuDisplay();
    }

    private closeMobileMenu(): void {
        this.isMobileMenuOpen = false;
        this.toggleMobileMenuDisplay();
    }

    // Affiche ou masque le menu mobile (l'affichage/masquage CSS/DOM dépend du template)
    private toggleMobileMenuDisplay(): void {
        const navbarMenu = this.el.nativeElement.querySelector('.navbar-menu');
        if (navbarMenu) {
            if (this.isMobileMenuOpen) {
                navbarMenu.classList.add('show');
            } else {
                navbarMenu.classList.remove('show');
            }
        }
        // Affichage du menu mobile, DOM manipulé via le template Angular
    }

    private activateCurrentRoute(): void {
        const navItems = this.el.nativeElement.querySelectorAll('.navbar-menu ul li.nav-item');
        const currentUrl = this.router.url;
        
        navItems.forEach((item: Element) => {
            const link = item.querySelector('a[routerLink]');
            if (link) {
                const routerLink = link.getAttribute('routerLink');
                if (routerLink) {
                    // Retirer active de tous
                    item.classList.remove('active');
                    // Ajouter active si la route correspond
                    if (routerLink === currentUrl || (routerLink !== '/' && currentUrl.startsWith(routerLink))) {
                        item.classList.add('active');
                    }
                }
            }
        });
        
        // Si aucun item n'est actif, activer le premier (Home)
        const hasActive = Array.from(navItems).some(item => item.classList.contains('active'));
        if (!hasActive && navItems.length > 0) {
            const firstItem = navItems[0] as HTMLElement;
            if (firstItem) {
                firstItem.classList.add('active');
            }
        }
    }

    private updateHoriSelector(): void {
        // Ne pas afficher le sélecteur sur mobile
        if (window.innerWidth <= 991) {
            return;
        }

        const nav = this.el.nativeElement.querySelector('.navbar-menu');
        if (!nav) return;

        const activeItem = nav.querySelector('li.nav-item.active') as HTMLElement;
        const horiSelector = nav.querySelector('.hori-selector') as HTMLElement;
        
        if (activeItem && horiSelector) {
            // Obtenir la position relative au parent ul
            const ul = nav.querySelector('ul.navbar-nav') as HTMLElement;
            if (!ul) return;
            
            const ulRect = ul.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            
            const relativeTop = itemRect.top - ulRect.top;
            const relativeLeft = itemRect.left - ulRect.left;
            
            // Appliquer les styles avec transition
            this.renderer.setStyle(horiSelector, 'top', `${relativeTop}px`);
            this.renderer.setStyle(horiSelector, 'left', `${relativeLeft}px`);
            this.renderer.setStyle(horiSelector, 'height', `${activeItem.offsetHeight}px`);
            this.renderer.setStyle(horiSelector, 'width', `${activeItem.offsetWidth}px`);
            this.renderer.setStyle(horiSelector, 'opacity', '1');
        } else if (horiSelector) {
            // Cacher le sélecteur s'il n'y a pas d'item actif
            this.renderer.setStyle(horiSelector, 'opacity', '0');
        }
    }
}
