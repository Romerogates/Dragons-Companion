import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // On utilise un Signal pour que l'interface réagisse instantanément
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    // 1. Vérifier s'il y a une préférence sauvegardée
    const savedTheme = localStorage.getItem('theme');

    // 2. Sinon, vérifier la préférence du système (ordinateur)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      this.enableDarkMode();
    }
  }

  toggleTheme() {
    if (this.isDarkMode()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode() {
    this.isDarkMode.set(true);
    document.body.classList.add('dark-mode'); // Ajoute la classe au BODY (global)
    localStorage.setItem('theme', 'dark');
  }

  private disableDarkMode() {
    this.isDarkMode.set(false);
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}
