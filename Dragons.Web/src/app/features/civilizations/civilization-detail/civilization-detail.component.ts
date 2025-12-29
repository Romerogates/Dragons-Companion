// components/civilization-detail/civilization-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
})
export class CivilizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  civilization: Civilization | null = null;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getCivilizationById(id).subscribe({
        next: (data) => {
          this.civilization = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement civilisation:', err);
          this.loading = false;
        },
      });
    }
  }

  getIcon(name: string): string {
    return this.civilizationIcons[name] ?? '🏘️';
  }

  getDiceRange(): string {
    if (!this.civilization) return '';
    const { diceMin, diceMax } = this.civilization.randomization;
    return diceMin === diceMax ? `${diceMin}` : `${diceMin}-${diceMax}`;
  }
}
