// features/character-creation/steps/languages-step/languages-step.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { DataService } from '../../../../core/services/data.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';

@Component({
  selector: 'app-languages-step',
  standalone: true,
  imports: [CommonModule, SelectionCardComponent],
  templateUrl: './languages-step.component.html',
  styleUrl: './languages-step.component.scss',
})
export class LanguagesStepComponent implements OnInit {
  creationService = inject(CharacterCreationService);
  private dataService = inject(DataService);

  // Liste de toutes les langues disponibles
  allLanguages: string[] = [];
  loading = true;

  // Langues fixes (non modifiables)
  fixedLanguages: string[] = [];

  // Nombre de choix à faire
  languageChoicesCount = 0;

  // Langues choisies par le joueur
  selectedChoiceLanguages: string[] = [];

  // Icônes pour les langues
  private languageIcons: Record<string, string> = {
    Commun: '🗣️',
    Draconique: '🐉',
    Elfique: '🧝',
    Nain: '⛏️',
    Géant: '🗻',
    Gnome: '🔧',
    Gobelin: '👺',
    Halfelin: '🍀',
    Infernal: '😈',
    Orc: '💀',
    Primordial: '🌋',
    Sylvestre: '🌲',
    Céleste: '👼',
    Abyssal: '👿',
    Profond: '🦑',
    Thieves: '🤫',
    Druidique: '🍃',
  };

  ngOnInit(): void {
    this.loadLanguages();
  }

  private loadLanguages(): void {
    this.dataService.getLanguages().subscribe({
      next: (languages) => {
        this.allLanguages = languages.map((l) => l.name);
        this.loading = false;
        this.analyzeLanguageChoices();
      },
      error: (err) => {
        console.error('Erreur chargement langues:', err);
        // Fallback : liste de langues par défaut
        this.allLanguages = [
          'Commun',
          'Draconique',
          'Elfique',
          'Nain',
          'Géant',
          'Gnome',
          'Gobelin',
          'Halfelin',
          'Infernal',
          'Orc',
          'Primordial',
          'Sylvestre',
          'Céleste',
          'Abyssal',
          'Profond',
        ];
        this.loading = false;
        this.analyzeLanguageChoices();
      },
    });
  }

  private analyzeLanguageChoices(): void {
    const character = this.creationService.character();
    const allLangs = [...character.speciesLanguages, ...character.civilizationLanguages];

    this.fixedLanguages = [];
    this.languageChoicesCount = 0;

    for (const lang of allLangs) {
      if (this.isChoiceLanguage(lang)) {
        this.languageChoicesCount++;
      } else if (!this.fixedLanguages.includes(lang)) {
        this.fixedLanguages.push(lang);
      }
    }

    // Récupérer les langues déjà choisies (si on revient sur cette étape)
    const currentLanguages = character.languages;
    this.selectedChoiceLanguages = currentLanguages.filter(
      (lang) => !this.fixedLanguages.includes(lang) && !this.isChoiceLanguage(lang)
    );

    // Si aucune langue n'est encore définie, initialiser avec les fixes
    if (currentLanguages.length === 0) {
      this.updateCharacterLanguages();
    }
  }

  // Vérifie si une langue est un choix à faire
  isChoiceLanguage(lang: string): boolean {
    const choicePatterns = ['choix', 'au choix', 'choice', 'any', 'libre', 'à choisir'];
    const normalized = lang.toLowerCase().trim();
    return choicePatterns.some((pattern) => normalized.includes(pattern));
  }

  // Langues disponibles pour le choix (exclut les langues déjà connues)
  getAvailableLanguagesForChoice(): string[] {
    const knownLanguages = [...this.fixedLanguages, ...this.selectedChoiceLanguages];
    return this.allLanguages.filter((lang) => !knownLanguages.includes(lang));
  }

  // Vérifie si une langue est sélectionnée
  isLanguageSelected(lang: string): boolean {
    return this.selectedChoiceLanguages.includes(lang);
  }

  // Peut encore choisir des langues ?
  canSelectMore(): boolean {
    return this.selectedChoiceLanguages.length < this.languageChoicesCount;
  }

  // Toggle une langue
  toggleLanguage(lang: string): void {
    const index = this.selectedChoiceLanguages.indexOf(lang);

    if (index >= 0) {
      // Désélectionner
      this.selectedChoiceLanguages.splice(index, 1);
    } else if (this.canSelectMore()) {
      // Sélectionner
      this.selectedChoiceLanguages.push(lang);
    }

    // Mettre à jour le service
    this.updateCharacterLanguages();
  }

  // Met à jour les langues du personnage
  private updateCharacterLanguages(): void {
    const finalLanguages = [...this.fixedLanguages, ...this.selectedChoiceLanguages];
    this.creationService.setLanguages(finalLanguages);
  }

  // Réinitialiser les choix
  clearChoices(): void {
    this.selectedChoiceLanguages = [];
    this.updateCharacterLanguages();
  }

  // Obtenir l'icône pour une langue
  getLanguageIcon(lang: string): string {
    // Chercher une correspondance partielle
    for (const [key, icon] of Object.entries(this.languageIcons)) {
      if (lang.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📜';
  }

  // Vérifie si l'étape est complète
  isStepComplete(): boolean {
    return this.selectedChoiceLanguages.length >= this.languageChoicesCount;
  }

  // Filtre les langues non-choix pour l'affichage
  filterNonChoiceLanguages(languages: string[]): string[] {
    return languages.filter((l) => !this.isChoiceLanguage(l));
  }
}
