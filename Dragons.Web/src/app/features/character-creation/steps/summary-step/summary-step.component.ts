import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { ABILITY_NAMES } from '../../../../core/models/character.models';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-step.component.html',
  styleUrl: './summary-step.component.scss',
  // PERFORMANCE
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStepComponent {
  creationService = inject(CharacterCreationService);
  abilityNames = ABILITY_NAMES;

  get character() {
    return this.creationService.character();
  }

  get finalAbilities() {
    return this.creationService.finalAbilities();
  }

  get modifiers() {
    return this.creationService.abilityModifiers();
  }

  formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }
}
