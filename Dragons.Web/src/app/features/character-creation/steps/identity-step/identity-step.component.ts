import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { ALIGNMENTS } from '../../../../core/models/character.models';

@Component({
  selector: 'app-identity-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identity-step.component.html',
  styleUrl: './identity-step.component.scss',
  // PERFORMANCE
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentityStepComponent {
  creationService = inject(CharacterCreationService);
  alignments = ALIGNMENTS;

  updateIdentity(field: string, value: string): void {
    this.creationService.setIdentity({ [field]: value });
  }
}
