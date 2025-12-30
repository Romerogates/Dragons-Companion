import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';
import { Species, SpeciesSummary, Subspecies } from '../../../../core/models/game-data.models';

@Component({
  selector: 'app-species-step',
  standalone: true,
  imports: [CommonModule, SelectionCardComponent],
  templateUrl: './species-step.component.html',
  styleUrl: './species-step.component.scss',
  // On garde OnPush pour la performance, mais on va le gérer correctement avec le cd.markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesStepComponent implements OnInit {
  private dataService = inject(DataService);
  creationService = inject(CharacterCreationService);

  // Correction #1 : On injecte le détecteur de changement
  private cd = inject(ChangeDetectorRef);

  speciesList: SpeciesSummary[] = [];
  selectedSpeciesDetail: Species | null = null;
  loading = true;

  private speciesIcons: Record<string, string> = {
    Drakéide: '🐲',
    Elfe: '🧝',
    Gnome: '⚙️',
    Halfelin: '🍀',
    Humain: '👨‍👩‍👧',
    Nain: '⛏️',
    'Demi-Orc': '🦷',
    Tieffelin: '😈',
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

        // Correction #1 : On dit à Angular "Les données sont là, mets à jour l'écran maintenant !"
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement espèces:', err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  getIcon(name: string): string {
    const key = Object.keys(this.speciesIcons).find((k) => name.includes(k));
    return key ? this.speciesIcons[key] : '👤';
  }

  // Correction #2 : Retourne un tableau de strings [] au lieu d'une string unique
  formatAbilityBonusesList(bonuses: Record<string, number>): string[] {
    if (!bonuses) return [];
    return Object.entries(bonuses).map(
      ([ability, value]) => `+${value} ${this.capitalize(ability)}`
    );
  }

  // Garde l'ancienne méthode pour le résumé en bas de page (string unique)
  formatAbilityBonusesString(bonuses: Record<string, number>): string {
    if (!bonuses) return '';
    return Object.entries(bonuses)
      .map(([ability, value]) => `+${value} ${this.capitalize(ability)}`)
      .join(', ');
  }

  getSizeLabel(size: string): string {
    const sizes: Record<string, string> = { P: 'Petite', M: 'Moyenne', G: 'Grande' };
    return sizes[size] ?? size;
  }

  // Prépare les données pour <app-selection-card>
  getSpeciesDetails(species: SpeciesSummary): string[] {
    const details: string[] = [
      this.getSizeLabel(species.baseStats.sizeCategory),
      species.baseStats.speedMeters + 'm',
    ];

    // Correction #2 : On ajoute chaque bonus comme un tag séparé
    const bonuses = this.formatAbilityBonusesList(species.baseStats.abilityBonuses);
    details.push(...bonuses);

    if (species.baseStats.hasDarkvision) {
      details.push('Vision nuit');
    }
    return details;
  }

  getSubspeciesDetails(sub: Subspecies): string[] {
    const details: string[] = [];

    // Bonus stats de la sous-espèce (séparés aussi)
    if (sub.additionalStats.abilityBonuses) {
      const bonuses = this.formatAbilityBonusesList(sub.additionalStats.abilityBonuses);
      details.push(...bonuses);
    }

    // Traits spécifiques
    if (sub.additionalTraits) {
      details.push(...sub.additionalTraits.map((t) => t.name));
    }
    return details;
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
        // Mise à jour de l'interface après chargement du détail
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement détail espèce:', err);
        this.cd.markForCheck();
      },
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
