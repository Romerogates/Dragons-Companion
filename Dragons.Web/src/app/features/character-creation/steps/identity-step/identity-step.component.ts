import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { DataService } from '../../../../core/services/data.service';
import { ALIGNMENTS } from '../../../../core/models/character.models';

@Component({
  selector: 'app-identity-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identity-step.component.html',
  styleUrl: './identity-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentityStepComponent {
  creationService = inject(CharacterCreationService);
  dataService = inject(DataService);
  alignments = ALIGNMENTS;

  // État pour la génération IA
  isGenerating = signal(false);
  generationError = signal<string | null>(null);

  updateIdentity(field: string, value: string): void {
    this.creationService.setIdentity({ [field]: value });
  }

  generateStory(): void {
    const char = this.creationService.character();

    // Vérifications
    if (!char.name?.trim()) {
      this.generationError.set("Veuillez d'abord entrer un nom.");
      return;
    }
    if (!char.speciesName || !char.civilizationName || !char.className) {
      this.generationError.set("Complétez d'abord les étapes Espèce, Civilisation et Classe.");
      return;
    }

    this.isGenerating.set(true);
    this.generationError.set(null);

    this.dataService
      .generateBackstory({
        name: char.name,
        speciesName: char.speciesName,
        subspeciesName: char.subspeciesName,
        civilizationName: char.civilizationName,
        className: char.className,
        alignment: char.alignment || null,
        traits: char.traits || null,
        bonds: char.bonds || null,
        flaws: char.flaws || null,
        background: char.background || null, // <-- AJOUTÉ
      })
      .subscribe({
        next: (response) => {
          this.creationService.setIdentity({ story: response.story });
          this.isGenerating.set(false);
        },
        error: (err) => {
          console.error('Erreur génération:', err);
          this.generationError.set('Erreur lors de la génération. Réessayez.');
          this.isGenerating.set(false);
        },
      });
  }
}
