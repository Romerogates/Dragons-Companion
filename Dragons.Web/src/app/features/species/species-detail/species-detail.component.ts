// components/species-detail/species-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Species, Subspecies } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-species-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './species-detail.component.html',
  styleUrl: './species-detail.component.scss',
})
export class SpeciesDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  species: Species | null = null;
  loading = true;
  selectedSubspecies: Subspecies | null = null;

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getSpeciesById(id).subscribe({
        next: (data) => {
          this.species = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement espèce:', err);
          this.loading = false;
        },
      });
    }
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

  selectSubspecies(sub: Subspecies): void {
    this.selectedSubspecies = this.selectedSubspecies?.id === sub.id ? null : sub;
  }

  getTotalBonuses(): Record<string, number> {
    if (!this.species) return {};

    const base = { ...this.species.baseStats.abilityBonuses };

    if (this.selectedSubspecies) {
      Object.entries(this.selectedSubspecies.additionalStats.abilityBonuses).forEach(
        ([key, value]) => {
          base[key] = (base[key] ?? 0) + value;
        }
      );
    }

    return base;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
