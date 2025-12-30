import { Component, HostListener, inject } from '@angular/core'; // + inject
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service'; // Adapte le chemin si nécessaire

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  // Injection du service
  themeService = inject(ThemeService);

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  // Méthode appelée par le bouton
  toggleTheme(): void {
    this.themeService.toggleTheme();
    // Optionnel : on ferme le menu sur mobile après le clic si tu le souhaites
    // this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbar = target.closest('.navbar');

    if (!navbar && this.menuOpen) {
      this.menuOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.menuOpen) {
      this.menuOpen = false;
    }
  }
}
