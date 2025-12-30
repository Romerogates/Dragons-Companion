import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { SpeciesSummary, Species } from '../../../core/models/game-data.models';

// Interface locale pour simplifier l'affichage dans le HTML
interface StatBadge {
  label: string;
  cssClass: string; // 'bonus' ou 'choice'
}

@Component({
  selector: 'app-species-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './species-list.component.html',
  styleUrl: './species-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesListComponent implements OnInit {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  speciesList: SpeciesSummary[] = []; // Utiliser un nom différent pour éviter la confusion avec le type
  fullSpeciesData: Map<string, Species> = new Map(); // Pour stocker les données complètes (langues, etc.)
  loading = true;

  private speciesIcons: Record<string, string> = {
    Drakéide: '🐲',
    Elfe: '🏹',
    Gnome: '⚙️',
    Halfelin: '🍀',
    Humain: '⚔️',
    Nain: '🪓',
    'Demi-elfe': '🌿',
    Melessë: '🌿',
    'Demi-orc': '💪',
    Merosi: '💪',
    Tieffelin: '😈',
    Aasimar: '😇',
    Félys: '🐱',
  };

  private speciesThemes: Record<string, string> = {
    Drakéide: 'theme-red',
    Tieffelin: 'theme-red',
    Elfe: 'theme-green',
    'Demi-elfe': 'theme-green',
    Melessë: 'theme-green',
    Nain: 'theme-gold',
    Humain: 'theme-blue',
    Gnome: 'theme-purple',
    Halfelin: 'theme-orange',
    'Demi-orc': 'theme-gray',
    Merosi: 'theme-gray',
    Félys: 'theme-gold',
  };

  ngOnInit(): void {
    // On charge la liste sommaire
    this.dataService.getSpecies().subscribe({
      next: (data) => {
        this.speciesList = data.sort((a, b) => a.name.localeCompare(b.name));

        // Pour avoir les langues, on doit charger les détails de chaque espèce
        // C'est un peu lourd mais nécessaire si l'info n'est pas dans le summary.
        // Optimisation : On pourrait demander au backend d'inclure les langues dans le summary.
        // Ici, on va faire avec ce qu'on a.
        this.loadAllDetails();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  // Charge les détails pour avoir accès aux langues (qui ne sont pas dans SpeciesSummary)
  loadAllDetails() {
    let loadedCount = 0;
    const total = this.speciesList.length;

    if (total === 0) {
      this.loading = false;
      this.cd.markForCheck();
      return;
    }

    this.speciesList.forEach((s) => {
      this.dataService.getSpeciesById(s.id).subscribe({
        next: (fullSpecies) => {
          this.fullSpeciesData.set(s.id, fullSpecies);
          loadedCount++;
          if (loadedCount === total) {
            this.loading = false;
            this.cd.markForCheck();
          }
        },
        error: (err) => {
          console.error(`Erreur chargement détails ${s.name}`, err);
          loadedCount++;
          if (loadedCount === total) {
            this.loading = false;
            this.cd.markForCheck();
          }
        },
      });
    });
  }

  getIcon(name: string): string {
    const key = Object.keys(this.speciesIcons).find((k) => name.includes(k));
    return key ? this.speciesIcons[key] : '👤';
  }

  getThemeClass(name: string): string {
    const key = Object.keys(this.speciesThemes).find((k) => name.includes(k));
    return key ? this.speciesThemes[key] : 'theme-default';
  }

  getSizeLabel(size: string): string {
    return { P: 'Petite', M: 'Moyenne', G: 'Grande' }[size] || size;
  }

  getSizeClass(size: string): string {
    return size === 'P' ? 'small' : size === 'M' ? 'medium' : 'large';
  }

  /**
   * Génère la liste des badges à afficher (Bonus fixes, Choix de stats, Choix de langues)
   */
  getStatsBadges(summary: SpeciesSummary): StatBadge[] {
    const badges: StatBadge[] = [];
    const bonuses = summary.baseStats.abilityBonuses;

    // 1. Bonus de caractéristiques
    if (bonuses) {
      Object.entries(bonuses).forEach(([key, value]) => {
        if (value === 0) return;

        const lowerKey = key.toLowerCase();
        // Détection si c'est un "Choix" technique (choix_1, choice_b, any...)
        const isChoice =
          lowerKey.includes('choix') || lowerKey.includes('choice') || lowerKey === 'any';

        if (isChoice) {
          badges.push({
            label: `✨ +${value} (au choix)`,
            cssClass: 'badge choice',
          });
        } else {
          badges.push({
            label: `+${value} ${this.translateAbility(key)}`,
            cssClass: 'badge bonus',
          });
        }
      });
    }

    // 2. Langues au choix (si disponibles dans les détails chargés)
    const fullData = this.fullSpeciesData.get(summary.id);
    if (fullData && fullData.languages) {
      fullData.languages.forEach((lang) => {
        const lowerLang = lang.toLowerCase();
        // Détection des langues au choix (ex: "Choix 1", "Une langue au choix")
        if (lowerLang.includes('choix') || lowerLang.includes('choice')) {
          badges.push({
            label: `🗣️ Langue (au choix)`,
            cssClass: 'badge choice', // On utilise le style "choix"
          });
        }
      });
    }

    // 3. Tri pour afficher les Bonus Fixes AVANT les Choix
    return badges.sort((a, b) => {
      if (a.cssClass === b.cssClass) return a.label.localeCompare(b.label);
      return a.cssClass === 'badge bonus' ? -1 : 1;
    });
  }

  // Helper pour vérifier si c'est un humain (pour afficher "...ou Don")
  isHuman(name: string): boolean {
    return name.includes('Humain');
  }

  private translateAbility(ability: string): string {
    const map: Record<string, string> = {
      strength: 'Force',
      dexterity: 'Dex',
      constitution: 'Con',
      intelligence: 'Int',
      wisdom: 'Sag',
      charisma: 'Cha',
    };
    return map[ability.toLowerCase()] || ability;
  }
}
