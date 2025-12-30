import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../../../core/services/data.service';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';
import { Civilization } from '../../../../core/models/game-data.models';

@Component({
  selector: 'app-civilization-step',
  standalone: true,
  imports: [CommonModule, SelectionCardComponent],
  templateUrl: './civilization-step.component.html',
  styleUrl: './civilization-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CivilizationStepComponent implements OnInit {
  private dataService = inject(DataService);
  creationService = inject(CharacterCreationService);
  private cd = inject(ChangeDetectorRef);

  // On utilise le type complet 'Civilization' et non plus 'CivilizationSummary'
  civilizations: Civilization[] = [];
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
    // 1. On récupère la liste sommaire
    this.dataService
      .getCivilizations()
      .pipe(
        // 2. On transforme la liste en un tableau de requêtes pour avoir les détails
        switchMap((summaries) => {
          const detailRequests = summaries.map((s) => this.dataService.getCivilizationById(s.id));
          return forkJoin(detailRequests); // Exécute tout en parallèle
        })
      )
      .subscribe({
        next: (details) => {
          this.civilizations = details;
          this.loading = false;

          // Si une civ est déjà sélectionnée (mode édition), on la charge dans la vue détail
          const currentCivId = this.creationService.character().civilizationId;
          if (currentCivId) {
            // On la trouve directement dans notre liste chargée
            this.selectedCivilizationDetail =
              this.civilizations.find((c) => c.id === currentCivId) || null;
          }

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

  // Prépare les tags pour la carte (Langues)
  getCivTags(civ: Civilization): string[] {
    // On retourne les langues officielles comme tags
    return civ.linguistics.officialLanguages || [];
  }

  selectCivilization(civ: Civilization): void {
    this.selectedCivilizationDetail = civ;

    // Mise à jour du service
    this.creationService.setCivilization(civ.id, civ.name, civ.linguistics.officialLanguages);

    // Scroll automatique vers le résumé (optionnel, améliore l'UX)
    setTimeout(() => {
      const summary = document.querySelector('.selection-summary');
      summary?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  clearSelection(): void {
    this.selectedCivilizationDetail = null;
    this.creationService.clearCivilization();
  }

  isCivilizationSelected(civId: string): boolean {
    return this.creationService.character().civilizationId === civId;
  }
}
