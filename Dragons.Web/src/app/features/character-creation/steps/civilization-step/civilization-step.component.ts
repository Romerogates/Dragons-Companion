// features/character-creation/steps/civilization-step/civilization-step.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';
import { CivilizationSummary, Civilization } from '../../../../core/models/game-data.models';

@Component({
  selector: 'app-civilization-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './civilization-step.component.html',
  styleUrl: './civilization-step.component.scss',
})
export class CivilizationStepComponent implements OnInit {
  private dataService = inject(DataService);
  creationService = inject(CharacterCreationService);

  civilizations: CivilizationSummary[] = [];
  selectedCivilizationDetail: Civilization | null = null;
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

        const currentCivId = this.creationService.character().civilizationId;
        if (currentCivId) {
          this.loadCivilizationDetail(currentCivId);
        }
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

  selectCivilization(civ: CivilizationSummary): void {
    this.loadCivilizationDetail(civ.id);
  }

  loadCivilizationDetail(civId: string): void {
    this.dataService.getCivilizationById(civId).subscribe({
      next: (detail) => {
        this.selectedCivilizationDetail = detail;
        this.creationService.setCivilization(
          detail.id,
          detail.name,
          detail.linguistics.officialLanguages
        );
      },
      error: (err) => console.error('Erreur chargement détail civilisation:', err),
    });
  }

  clearSelection(): void {
    this.selectedCivilizationDetail = null;
    this.creationService.clearCivilization();
  }

  isCivilizationSelected(civId: string): boolean {
    return this.creationService.character().civilizationId === civId;
  }
}
