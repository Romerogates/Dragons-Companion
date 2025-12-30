import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Civilization } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-civilization-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './civilization-detail.component.html',
  styleUrl: './civilization-detail.component.scss',
  // PERFORMANCE : OnPush pour éviter les rendus inutiles
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CivilizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  civilization: Civilization | null = null;
  loading = true;

  // Tes icônes existantes
  private civilizationIcons: Record<string, string> = {
    Acoatl: '🌋',
    Ajagar: '🐘',
    Arolavie: '❄️',
    'Barbaresques (Îles)': '⚓',
    'Cité Franche': '🏛️',
    Cyrillane: '🦅',
    Drakenbergen: '⛰️',
    Ellerina: '🌸',
    'Éoliennes (Îles)': '💨',
    Inframonde: '🕳️',
    Kaan: '🐎',
    Lothrienne: '🏰',
    Mibu: '🦁',
    Rachamangekr: '🐲',
    'Royaumes des Sables': '☀️',
    Septentrion: '🐺',
    'Shi-huang': '🏯',
    Torea: '🌊',
  };

  // NOUVEAU : Mapping des couleurs pour le header (SCSS themes)
  // Associe une ambiance à chaque civilisation
  private civThemes: Record<string, string> = {
    Acoatl: 'theme-red', // Volcan
    Arolavie: 'theme-blue-light', // Froid
    'Cité Franche': 'theme-blue', // Standard
    Drakenbergen: 'theme-gray', // Pierre
    Ellerina: 'theme-pink', // Féérique
    Inframonde: 'theme-purple', // Ténèbres
    Kaan: 'theme-red', // Guerre
    Lothrienne: 'theme-green', // Nature
    Mibu: 'theme-gold', // Honneur
    'Royaumes des Sables': 'theme-orange', // Désert
    Septentrion: 'theme-gray', // Nord
    Cyrillane: 'theme-blue', // Magie
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getCivilizationById(id).subscribe({
        next: (data) => {
          this.civilization = data;
          this.loading = false;
          // Nécessaire avec OnPush pour dire à Angular "j'ai reçu les données, mets à jour !"
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement civilisation:', err);
          this.loading = false;
          this.cd.markForCheck();
        },
      });
    }
  }

  getIcon(name: string): string {
    return this.civilizationIcons[name] ?? '🏘️';
  }

  // Permet d'appliquer la classe CSS dynamique dans le HTML
  getThemeClass(name: string): string {
    // Recherche exacte
    if (this.civThemes[name]) return this.civThemes[name];

    // Fallback par défaut
    return 'theme-default';
  }

  getDiceRange(): string {
    if (!this.civilization) return '';
    // J'ai gardé ta structure exacte (randomization.diceMin)
    const { diceMin, diceMax } = this.civilization.randomization;
    return diceMin === diceMax ? `${diceMin}` : `${diceMin}-${diceMax}`;
  }
}
