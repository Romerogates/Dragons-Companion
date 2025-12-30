import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
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
  // PERFORMANCE
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesStepComponent implements OnInit {
  creationService = inject(CharacterCreationService);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  allLanguages: string[] = [];
  loading = true;
  fixedLanguages: string[] = [];
  languageChoicesCount = 0;
  selectedChoiceLanguages: string[] = [];

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
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement langues:', err);
        // Fallback
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
        this.cd.markForCheck();
      },
    });
  }

  private analyzeLanguageChoices(): void {
    const character = this.creationService.character();
    // On combine les sources sans doublons
    const allSourceLangs = [...character.speciesLanguages, ...character.civilizationLanguages];

    // Reset
    this.fixedLanguages = [];
    this.languageChoicesCount = 0;

    for (const lang of allSourceLangs) {
      if (this.isChoiceLanguage(lang)) {
        this.languageChoicesCount++;
      } else if (!this.fixedLanguages.includes(lang)) {
        this.fixedLanguages.push(lang);
      }
    }

    // Récupérer les langues déjà choisies (si on revient sur cette étape)
    // On doit s'assurer qu'elles ne sont pas dans les fixedLanguages
    const currentLanguages = character.languages;

    this.selectedChoiceLanguages = currentLanguages.filter(
      (lang) => !this.fixedLanguages.includes(lang) && !this.isChoiceLanguage(lang)
    );

    // Initialiser le service si vide
    if (currentLanguages.length === 0) {
      this.updateCharacterLanguages();
    }
  }

  isChoiceLanguage(lang: string): boolean {
    const choicePatterns = ['choix', 'au choix', 'choice', 'any', 'libre', 'à choisir'];
    const normalized = lang.toLowerCase().trim();
    return choicePatterns.some((pattern) => normalized.includes(pattern));
  }

  getAvailableLanguagesForChoice(): string[] {
    // On ne propose pas les langues qu'on a déjà (fixed ou selected)
    const knownLanguages = [...this.fixedLanguages, ...this.selectedChoiceLanguages];
    return this.allLanguages.filter((lang) => !knownLanguages.includes(lang));
  }

  isLanguageSelected(lang: string): boolean {
    return this.selectedChoiceLanguages.includes(lang);
  }

  canSelectMore(): boolean {
    return this.selectedChoiceLanguages.length < this.languageChoicesCount;
  }

  toggleLanguage(lang: string): void {
    const index = this.selectedChoiceLanguages.indexOf(lang);

    if (index >= 0) {
      this.selectedChoiceLanguages.splice(index, 1);
    } else if (this.canSelectMore()) {
      this.selectedChoiceLanguages.push(lang);
    }

    this.updateCharacterLanguages();
    this.cd.markForCheck();
  }

  private updateCharacterLanguages(): void {
    const finalLanguages = [...this.fixedLanguages, ...this.selectedChoiceLanguages];
    this.creationService.setLanguages(finalLanguages);
  }

  clearChoices(): void {
    this.selectedChoiceLanguages = [];
    this.updateCharacterLanguages();
    this.cd.markForCheck();
  }

  getLanguageIcon(lang: string): string {
    for (const [key, icon] of Object.entries(this.languageIcons)) {
      if (lang.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📜';
  }

  isStepComplete(): boolean {
    return this.selectedChoiceLanguages.length >= this.languageChoicesCount;
  }

  filterNonChoiceLanguages(languages: string[]): string[] {
    return languages.filter((l) => !this.isChoiceLanguage(l));
  }
}
