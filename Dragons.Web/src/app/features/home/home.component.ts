import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// Import du service pour vérifier le localStorage (optionnel si tu le fais en dur)
// import { CharacterCreationService } from '../../core/services/character-creation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  savedCharactersCount = 0;

  // Stats pour la bande horizontale
  stats = [
    { value: '9', label: 'Espèces' },
    { value: '13', label: 'Classes' },
    { value: '18', label: 'Civilisations' },
    { value: '∞', label: 'Aventures' },
  ];

  // Les 4 cartes pour la grille 2x2
  features = [
    {
      title: 'Création Guidée',
      description:
        "Un assistant pas-à-pas pour forger votre légende, du choix de l'espèce jusqu'à l'équipement final.",
      icon: '🧙‍♂️',
    },
    {
      title: 'Fiches PDF',
      description:
        'Exportez votre personnage en un clic vers une fiche PDF élégante, prête à être imprimée.',
      icon: '📄',
    },
    {
      title: 'Sauvegarde Auto',
      description:
        'Vos héros sont stockés localement dans votre navigateur. Ne perdez jamais votre progression.',
      icon: '💾',
    },
    {
      title: 'Grimoire de Règles',
      description:
        "Accédez rapidement aux détails des espèces, classes et civilisations de l'univers Dragons.",
      icon: '📚',
    },
  ];

  ngOnInit(): void {
    this.checkSavedCharacters();
  }

  private checkSavedCharacters(): void {
    const saved = localStorage.getItem('dragons-characters');
    if (saved) {
      try {
        const chars = JSON.parse(saved);
        this.savedCharactersCount = Array.isArray(chars) ? chars.length : 0;
      } catch (e) {
        this.savedCharactersCount = 0;
      }
    }
  }
}
