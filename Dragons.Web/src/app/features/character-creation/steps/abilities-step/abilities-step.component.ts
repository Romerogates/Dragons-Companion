// features/character-creation/steps/abilities-step/abilities-step.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import {
  AbilityScores,
  ABILITY_NAMES,
  ABILITY_POINT_COSTS,
  MIN_ABILITY_SCORE,
  MAX_ABILITY_SCORE,
} from '../../../../core/models/character.models';

@Component({
  selector: 'app-abilities-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './abilities-step.component.html',
  styleUrl: './abilities-step.component.scss',
})
export class AbilitiesStepComponent {
  creationService = inject(CharacterCreationService);

  abilities: (keyof AbilityScores)[] = [
    'force',
    'dexterite',
    'constitution',
    'intelligence',
    'sagesse',
    'charisme',
  ];
  abilityNames = ABILITY_NAMES;
  pointCosts = ABILITY_POINT_COSTS;
  minScore = MIN_ABILITY_SCORE;
  maxScore = MAX_ABILITY_SCORE;

  getBaseValue(ability: keyof AbilityScores): number {
    return this.creationService.character().baseAbilities[ability];
  }

  getRacialBonus(ability: keyof AbilityScores): number {
    return this.creationService.character().racialBonuses[ability] ?? 0;
  }

  getFinalValue(ability: keyof AbilityScores): number {
    return this.creationService.finalAbilities()[ability];
  }

  getModifier(ability: keyof AbilityScores): string {
    return this.creationService.formatModifier(this.getFinalValue(ability));
  }

  getPointCost(value: number): number {
    return this.pointCosts[value] ?? 0;
  }

  canIncrement(ability: keyof AbilityScores): boolean {
    const current = this.getBaseValue(ability);
    if (current >= this.maxScore) return false;

    const currentCost = this.getPointCost(current);
    const newCost = this.getPointCost(current + 1);
    const costDiff = newCost - currentCost;

    return this.creationService.character().pointsRemaining >= costDiff;
  }

  canDecrement(ability: keyof AbilityScores): boolean {
    return this.getBaseValue(ability) > this.minScore;
  }

  increment(ability: keyof AbilityScores): void {
    if (this.canIncrement(ability)) {
      this.creationService.incrementAbility(ability);
    }
  }

  decrement(ability: keyof AbilityScores): void {
    if (this.canDecrement(ability)) {
      this.creationService.decrementAbility(ability);
    }
  }

  reset(): void {
    this.creationService.resetAbilities();
  }
}
