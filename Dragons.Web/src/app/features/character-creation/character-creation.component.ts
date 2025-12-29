// features/character-creation/character-creation.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CharacterCreationService } from '../../core/services/character-creation.service';
import { SpeciesStepComponent } from './steps/species-step/species-step.component';
import { CivilizationStepComponent } from './steps/civilization-step/civilization-step.component';
import { ClassStepComponent } from './steps/class-step/class-step.component';
import { AbilitiesStepComponent } from './steps/abilities-step/abilities-step.component';
import { SkillsStepComponent } from './steps/skills-step/skills-step.component';
import { EquipmentStepComponent } from './steps/equipment-step/equipment-step.component';
import { LanguagesStepComponent } from './steps/languages-step/languages-step.component';
import { IdentityStepComponent } from './steps/identity-step/identity-step.component';
import { SummaryStepComponent } from './steps/summary-step/summary-step.component';

interface Step {
  number: number;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SpeciesStepComponent,
    CivilizationStepComponent,
    ClassStepComponent,
    AbilitiesStepComponent,
    SkillsStepComponent,
    EquipmentStepComponent,
    LanguagesStepComponent,
    IdentityStepComponent,
    SummaryStepComponent,
  ],
  templateUrl: './character-creation.component.html',
  styleUrl: './character-creation.component.scss',
})
export class CharacterCreationComponent implements OnInit {
  creationService = inject(CharacterCreationService);
  private router = inject(Router);

  steps: Step[] = [
    { number: 1, title: 'Espèce', icon: '🧬' },
    { number: 2, title: 'Civilisation', icon: '🏰' },
    { number: 3, title: 'Classe', icon: '⚔️' },
    { number: 4, title: 'Caractéristiques', icon: '📊' },
    { number: 5, title: 'Compétences', icon: '🎯' },
    { number: 6, title: 'Équipement', icon: '🎒' },
    { number: 7, title: 'Langues', icon: '🗣️' },
    { number: 8, title: 'Identité', icon: '📜' },
    { number: 9, title: 'Récapitulatif', icon: '✅' },
  ];

  ngOnInit(): void {
    // Vérifier si on est en mode édition (venant de /characters)
    this.creationService.checkForEditMode();
  }

  onReset(): void {
    if (confirm('Êtes-vous sûr de vouloir recommencer ? Toutes les données seront perdues.')) {
      this.creationService.reset();
    }
  }

  finishCreation(): void {
    this.router.navigate(['/character-sheet']);
  }
}
