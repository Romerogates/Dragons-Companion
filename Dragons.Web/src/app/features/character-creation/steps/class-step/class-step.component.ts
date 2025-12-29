import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { CharacterClassSummary, CharacterClass } from '../../../../core/models/game-data.models';
import { FeatureInfo } from '../../../../core/models/character.models';

@Component({
  selector: 'app-class-step',
  standalone: true,
  imports: [CommonModule], // Plus besoin de SelectionCardComponent
  templateUrl: './class-step.component.html',
  styleUrl: './class-step.component.scss',
})
export class ClassStepComponent implements OnInit {
  private dataService = inject(DataService);
  creationService = inject(CharacterCreationService);

  classes: CharacterClassSummary[] = [];
  selectedClassDetail: CharacterClass | null = null;
  loading = true;

  private classIcons: Record<string, string> = {
    Barbare: '🪓',
    Barde: '🎵',
    Druide: '🌿',
    Ensorceleur: '✨',
    Guerrier: '⚔️',
    Lettré: '📚',
    Magicien: '🔮',
    Moine: '👊',
    Paladin: '🛡️',
    Prêtre: '✝️',
    Rôdeur: '🏹',
    Roublard: '🗡️',
    Sorcier: '👁️',
  };

  ngOnInit(): void {
    this.dataService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;

        const currentClassId = this.creationService.character().classId;
        if (currentClassId) {
          this.loadClassDetail(currentClassId);
        }
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.loading = false;
      },
    });
  }

  getIcon(name: string): string {
    return this.classIcons[name] ?? '⚔️';
  }

  getHitDieColor(hitDie: number): string {
    if (hitDie >= 12) return 'very-high';
    if (hitDie >= 10) return 'high';
    if (hitDie >= 8) return 'medium';
    return 'low';
  }

  selectClass(charClass: CharacterClassSummary): void {
    this.loadClassDetail(charClass.id);
  }

  loadClassDetail(classId: string): void {
    this.dataService.getClassById(classId).subscribe({
      next: (detail) => {
        this.selectedClassDetail = detail;

        // Extraction des features de niveau 1
        const level1Features: FeatureInfo[] = detail.progressionTable
          .filter((p) => p.level === 1)
          .flatMap((p) => p.features.map((f) => ({ name: f, description: '', level: 1 })));

        this.creationService.setClass(
          detail.id,
          detail.name,
          detail.hitDie,
          detail.spellcasting !== null && detail.spellcasting !== undefined,
          detail.spellcasting?.ability ?? null,
          detail.proficiencies.savingThrows,
          detail.proficiencies.armor,
          detail.proficiencies.weapons,
          detail.proficiencies.tools,
          detail.proficiencies.skills.options,
          detail.proficiencies.skills.chooseCount,
          level1Features,
          detail.startingEquipment
        );
      },
      error: (err) => console.error('Erreur chargement détail classe:', err),
    });
  }

  clearSelection(): void {
    this.selectedClassDetail = null;
    this.creationService.clearClass();
  }

  isClassSelected(classId: string): boolean {
    return this.creationService.character().classId === classId;
  }
}
