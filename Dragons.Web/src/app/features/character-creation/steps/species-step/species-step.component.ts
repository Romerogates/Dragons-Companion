// features/character-creation/steps/species-step/species-step.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';
import { Species, SpeciesSummary, Subspecies } from '../../../../core/models/game-data.models';

@Component({
  selector: 'app-species-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-step.component.html',
  styleUrl: './species-step.component.scss',
})
export class SpeciesStepComponent implements OnInit {
  private dataService = inject(DataService);
  creationService = inject(CharacterCreationService);

  speciesList: SpeciesSummary[] = [];
  selectedSpeciesDetail: Species | null = null;
  loading = true;

  private speciesIcons: Record<string, string> = {
    Drakéide: '🐲',
    Elfe: '🏹',
    Gnome: '⚙️',
    Halfelin: '🍀',
    Humain: '⚔️',
    Nain: '🪓',
  };

  ngOnInit(): void {
    this.dataService.getSpecies().subscribe({
      next: (data) => {
        this.speciesList = data;
        this.loading = false;

        const currentSpeciesId = this.creationService.character().speciesId;
        if (currentSpeciesId) {
          this.loadSpeciesDetail(currentSpeciesId);
        }
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
      .map(([ability, value]) => `+${value} ${this.capitalize(ability)}`)
      .join(', ');
  }

  getSizeLabel(size: string): string {
    const sizes: Record<string, string> = { P: 'Petite', M: 'Moyenne', G: 'Grande' };
    return sizes[size] ?? size;
  }

  getSpeciesDetails(species: SpeciesSummary): string[] {
    const details: string[] = [
      this.getSizeLabel(species.baseStats.sizeCategory),
      species.baseStats.speedMeters + 'm',
    ];
    if (species.baseStats.hasDarkvision) {
      details.push('👁️ Vision nuit');
    }
    return details;
  }

  getSubspeciesTraitNames(subspecies: Subspecies): string[] {
    return subspecies.additionalTraits.map((t) => t.name);
  }

  selectSpecies(species: SpeciesSummary): void {
    this.loadSpeciesDetail(species.id);
  }

  loadSpeciesDetail(speciesId: string): void {
    this.dataService.getSpeciesById(speciesId).subscribe({
      next: (detail) => {
        this.selectedSpeciesDetail = detail;

        if (detail.subspecies.length === 0) {
          this.confirmSpeciesSelection(detail, null);
        }
      },
      error: (err) => console.error('Erreur chargement détail espèce:', err),
    });
  }

  selectSubspecies(subspecies: Subspecies): void {
    if (this.selectedSpeciesDetail) {
      this.confirmSpeciesSelection(this.selectedSpeciesDetail, subspecies);
    }
  }

  confirmSpeciesSelection(species: Species, subspecies: Subspecies | null): void {
    const racialBonuses = { ...species.baseStats.abilityBonuses };
    if (subspecies) {
      Object.entries(subspecies.additionalStats.abilityBonuses).forEach(([key, value]) => {
        racialBonuses[key] = (racialBonuses[key] ?? 0) + value;
      });
    }

    const allTraits = [...species.traits];
    if (subspecies) {
      allTraits.push(...subspecies.additionalTraits);
    }

    this.creationService.setSpecies(
      species.id,
      species.name,
      subspecies?.id ?? null,
      subspecies?.name ?? null,
      racialBonuses,
      allTraits,
      species.baseStats.speedMeters,
      species.baseStats.sizeCategory,
      species.languages,
      [],
      species.baseStats.hasDarkvision,
      species.baseStats.darkvisionRadiusMeters
    );
  }

  clearSelection(): void {
    this.selectedSpeciesDetail = null;
    this.creationService.clearSpecies();
  }

  isSpeciesSelected(speciesId: string): boolean {
    return this.creationService.character().speciesId === speciesId;
  }

  isSubspeciesSelected(subspeciesId: string): boolean {
    return this.creationService.character().subspeciesId === subspeciesId;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
