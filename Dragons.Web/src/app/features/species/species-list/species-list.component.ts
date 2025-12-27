// components/species-list/species-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { SpeciesSummary } from '../../../core/models/data.model';

@Component({
  selector: 'app-species-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './species-list.component.html',
  styleUrl: './species-list.component.scss',
})
export class SpeciesListComponent implements OnInit {
  private dataService = inject(DataService);

  species: SpeciesSummary[] = [];
  loading = true;

  private speciesIcons: Record<string, string> = {
    Drakéide: '🐲',
    Elfe: '🏹',
    Gnome: '⚙️',
    Halfelin: '🍀',
    Humain: '⚔️',
    Nain: '🪓',
    'Demi-elfe': '🌿',
    'Demi-orc': '💪',
    Tieffelin: '😈',
  };

  ngOnInit(): void {
    this.dataService.getSpecies().subscribe({
      next: (data) => {
        this.species = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement espèces:', err);
        this.loading = false;
      },
    });
  }

  getIcon(name: string): string {
    return this.speciesIcons[name] ?? '👤';
  }

  formatAbilityBonuses(bonuses: Record<string, number>): string {
    return Object.entries(bonuses)
      .map(([ability, value]) => `+${value} ${this.capitalizeFirst(ability)}`)
      .join(', ');
  }

  getSizeLabel(sizeCategory: string): string {
    const sizes: Record<string, string> = {
      P: 'Petite',
      M: 'Moyenne',
      G: 'Grande',
    };
    return sizes[sizeCategory] ?? sizeCategory;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
