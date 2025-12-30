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
import { CivilizationSummary } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-civilization-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './civilization-list.component.html',
  styleUrl: './civilization-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CivilizationListComponent implements OnInit {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  civilizations: CivilizationSummary[] = [];
  loading = true;

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

  // Mapping des couleurs (thèmes)
  private civThemes: Record<string, string> = {
    Kaan: 'theme-red',
    Acoatl: 'theme-red',
    Rachamangekr: 'theme-red',
    Arolavie: 'theme-blue',
    'Cité Franche': 'theme-blue',
    Torea: 'theme-blue',
    Drakenbergen: 'theme-gray',
    Septentrion: 'theme-gray',
    Ellerina: 'theme-pink',
    Lothrienne: 'theme-green',
    Mibu: 'theme-gold',
    'Royaumes des Sables': 'theme-orange',
    Inframonde: 'theme-purple',
  };

  ngOnInit(): void {
    this.dataService.getCivilizations().subscribe({
      next: (data) => {
        // Tri alphabétique pour un meilleur rendu
        this.civilizations = data.sort((a, b) => a.name.localeCompare(b.name));
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement civilisations:', err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  getIcon(name: string): string {
    return this.civilizationIcons[name] ?? '🏘️';
  }

  getThemeClass(name: string): string {
    return this.civThemes[name] ?? 'theme-default';
  }
}
