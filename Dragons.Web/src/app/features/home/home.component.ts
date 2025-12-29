// features/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  savedCharactersCount = 0;

  features: Feature[] = [
    {
      icon: '🧙‍♂️',
      title: 'Création guidée',
      description: 'Wizard en 9 étapes pour créer ton personnage facilement',
    },
    {
      icon: '📜',
      title: 'Fiche complète',
      description: 'Génère une fiche de personnage PDF fidèle au jeu',
    },
    {
      icon: '🎲',
      title: 'Données officielles',
      description: '9 espèces, 13 classes, 18 civilisations du jeu Dragons',
    },
    {
      icon: '💾',
      title: 'Sauvegarde locale',
      description: 'Tes personnages sont sauvegardés dans ton navigateur',
    },
  ];

  stats: Stat[] = [
    { value: '9', label: 'Espèces' },
    { value: '13', label: 'Classes' },
    { value: '18', label: 'Civilisations' },
    { value: '27', label: 'Langues' },
  ];

  ngOnInit(): void {
    this.loadSavedCharactersCount();
  }

  private loadSavedCharactersCount(): void {
    try {
      const saved = localStorage.getItem('dragons-characters');
      if (saved) {
        const characters = JSON.parse(saved);
        this.savedCharactersCount = Array.isArray(characters) ? characters.length : 0;
      }
    } catch {
      this.savedCharactersCount = 0;
    }
  }
}
