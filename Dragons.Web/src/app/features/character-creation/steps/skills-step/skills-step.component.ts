import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { SelectionCardComponent } from '../../../../shared/components/selection-card/selection-card.component';

@Component({
  selector: 'app-skills-step',
  standalone: true,
  imports: [CommonModule, SelectionCardComponent],
  templateUrl: './skills-step.component.html',
  styleUrl: './skills-step.component.scss',
  // OPTIMISATION PERFORMANCE
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsStepComponent {
  creationService = inject(CharacterCreationService);
  private cd = inject(ChangeDetectorRef);

  // Liste complète de toutes les compétences
  private allSkills: string[] = [
    'Acrobaties',
    'Arcanes',
    'Athlétisme',
    'Discrétion',
    'Dressage',
    'Escamotage',
    'Histoire',
    'Intimidation',
    'Intuition',
    'Investigation',
    'Médecine',
    'Nature',
    'Perception',
    'Persuasion',
    'Religion',
    'Représentation',
    'Survie',
    'Tromperie',
  ];

  private skillAbilities: Record<string, string> = {
    Acrobaties: 'Dextérité',
    Arcanes: 'Intelligence',
    Athlétisme: 'Force',
    Discrétion: 'Dextérité',
    Dressage: 'Sagesse',
    Escamotage: 'Dextérité',
    Histoire: 'Intelligence',
    Intimidation: 'Charisme',
    Intuition: 'Sagesse',
    Investigation: 'Intelligence',
    Médecine: 'Sagesse',
    Nature: 'Intelligence',
    Perception: 'Sagesse',
    Persuasion: 'Charisme',
    Religion: 'Intelligence',
    Représentation: 'Charisme',
    Survie: 'Sagesse',
    Tromperie: 'Charisme',
  };

  getAvailableSkills(): string[] {
    const options = this.creationService.character().skillOptions;

    // Si aucune option, on retourne tout
    if (!options || options.length === 0) {
      return this.allSkills;
    }

    // Gestion du cas "Toutes les compétences"
    const normalizedOptions = options.map((opt) => opt.toLowerCase().trim());
    const allSkillsKeywords = ['toutes', 'au choix', 'any', 'all', 'libre', "n'importe"];

    const hasAllSkillsOption = normalizedOptions.some((opt) =>
      allSkillsKeywords.some((keyword) => opt.includes(keyword))
    );

    if (hasAllSkillsOption) {
      return this.allSkills;
    }

    return options;
  }

  getSkillAbility(skill: string): string {
    return this.skillAbilities[skill] ?? '';
  }

  isSkillSelected(skill: string): boolean {
    return this.creationService.character().selectedSkills.includes(skill);
  }

  canSelectMore(): boolean {
    const char = this.creationService.character();
    return char.selectedSkills.length < char.skillChooseCount;
  }

  toggleSkill(skill: string): void {
    this.creationService.toggleSkill(skill);
    this.cd.markForCheck(); // Mise à jour UI
  }

  clearSkills(): void {
    this.creationService.clearSkills();
    this.cd.markForCheck(); // Mise à jour UI
  }
}
