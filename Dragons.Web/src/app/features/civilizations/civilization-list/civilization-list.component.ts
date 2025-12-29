// components/civilization-list/civilization-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
})
export class CivilizationListComponent implements OnInit {
  private dataService = inject(DataService);

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

  ngOnInit(): void {
    this.dataService.getCivilizations().subscribe({
      next: (data) => {
        this.civilizations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement civilisations:', err);
        this.loading = false;
      },
    });
  }

  getIcon(name: string): string {
    return this.civilizationIcons[name] ?? '🏘️';
  }
}
