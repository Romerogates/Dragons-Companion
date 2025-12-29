// features/character-sheet/character-sheet.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CharacterCreationService } from '../../core/services/character-creation.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import {
  Character,
  ABILITY_NAMES,
  AbilityScores,
  EquipmentItem,
} from '../../core/models/character.models';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
})
export class CharacterSheetComponent implements OnInit {
  private creationService = inject(CharacterCreationService);
  private pdfService = inject(PdfGeneratorService);
  private router = inject(Router);

  character: Character | null = null;
  abilityNames = ABILITY_NAMES;
  isFromSavedCharacters = false;

  skillAbilityMap: Record<string, keyof AbilityScores> = {
    Athlétisme: 'force',
    Acrobaties: 'dexterite',
    Escamotage: 'dexterite',
    Discrétion: 'dexterite',
    Arcanes: 'intelligence',
    Histoire: 'intelligence',
    Investigation: 'intelligence',
    Nature: 'intelligence',
    Religion: 'intelligence',
    Dressage: 'sagesse',
    Intuition: 'sagesse',
    Médecine: 'sagesse',
    Perception: 'sagesse',
    Survie: 'sagesse',
    Intimidation: 'charisme',
    Persuasion: 'charisme',
    Représentation: 'charisme',
    Tromperie: 'charisme',
  };

  ngOnInit(): void {
    this.loadCharacter();
  }

  private loadCharacter(): void {
    // 1. Vérifier si on vient de /characters (personnage sauvegardé)
    const savedCharacterJson = localStorage.getItem('dragons-current-character');

    if (savedCharacterJson) {
      try {
        this.character = JSON.parse(savedCharacterJson);
        this.isFromSavedCharacters = true;
        localStorage.removeItem('dragons-current-character');
        return;
      } catch (error) {
        console.error('Erreur lors du chargement du personnage sauvegardé:', error);
        localStorage.removeItem('dragons-current-character');
      }
    }

    // 2. Sinon, charger depuis le service de création (venant de /create)
    this.character = this.creationService.generateFinalCharacter();
    this.isFromSavedCharacters = false;

    // 3. Si pas de personnage valide, rediriger
    if (!this.character || !this.character.name) {
      this.router.navigate(['/create']);
    }
  }

  get isEditMode(): boolean {
    return this.creationService.isEditMode();
  }

  formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  getHitDie(): number {
    if (!this.character) return 8;
    return this.character.hitPointsMax - this.character.abilityModifiers.constitution;
  }

  getSkillModifier(skill: string): number {
    if (!this.character) return 0;
    const ability = this.skillAbilityMap[skill];
    const abilityMod = this.character.abilityModifiers[ability];
    const isProficient = this.character.skills.includes(skill);
    return abilityMod + (isProficient ? this.character.proficiencyBonus : 0);
  }

  isSkillProficient(skill: string): boolean {
    return this.character?.skills.includes(skill) ?? false;
  }

  isSaveProficient(ability: keyof AbilityScores): boolean {
    const abilityName = this.abilityNames[ability];
    return this.character?.savingThrows.includes(abilityName) ?? false;
  }

  getSaveModifier(ability: keyof AbilityScores): number {
    if (!this.character) return 0;
    const abilityMod = this.character.abilityModifiers[ability];
    const isProficient = this.isSaveProficient(ability);
    return abilityMod + (isProficient ? this.character.proficiencyBonus : 0);
  }

  // === ARMES ET ATTAQUES ===

  // Récupérer les armes de l'équipement (items avec damage)
  getWeapons(): EquipmentItem[] {
    if (!this.character) return [];
    return this.character.equipment.filter((item) => item.type === 'Weapon' && item.damage);
  }

  // Vérifier si l'arme a une propriété spécifique
  private hasWeaponProperty(weapon: EquipmentItem, property: string): boolean {
    if (!weapon.properties) return false;
    return weapon.properties.some((p) => p.toLowerCase().includes(property.toLowerCase()));
  }

  // Calculer le bonus d'attaque d'une arme
  getWeaponAttackBonus(weapon: EquipmentItem): string {
    if (!this.character) return '+0';

    const modifiers = this.character.abilityModifiers;
    const profBonus = this.character.proficiencyBonus;
    let abilityMod: number;

    // Arme à distance (Projectiles) → Dextérité
    if (this.hasWeaponProperty(weapon, 'projectile')) {
      abilityMod = modifiers.dexterite;
    }
    // Arme Finesse → max(Force, Dextérité)
    else if (this.hasWeaponProperty(weapon, 'finesse')) {
      abilityMod = Math.max(modifiers.force, modifiers.dexterite);
    }
    // Par défaut (mêlée) → Force
    else {
      abilityMod = modifiers.force;
    }

    const total = abilityMod + profBonus;
    return total >= 0 ? `+${total}` : `${total}`;
  }

  // Calculer les dégâts d'une arme (ex: "1d8+3 tranchant")
  getWeaponDamage(weapon: EquipmentItem): string {
    if (!this.character || !weapon.damage) return '';

    const modifiers = this.character.abilityModifiers;
    let damageMod: number;

    // Arme à distance → Dextérité
    if (this.hasWeaponProperty(weapon, 'projectile')) {
      damageMod = modifiers.dexterite;
    }
    // Finesse → max(Force, Dextérité)
    else if (this.hasWeaponProperty(weapon, 'finesse')) {
      damageMod = Math.max(modifiers.force, modifiers.dexterite);
    }
    // Par défaut → Force
    else {
      damageMod = modifiers.force;
    }

    const modStr = damageMod >= 0 ? `+${damageMod}` : `${damageMod}`;
    const damageType = weapon.damageType || '';

    return `${weapon.damage}${modStr} ${damageType}`.trim();
  }

  // === ACTIONS ===

  saveCharacter(): void {
    if (!this.character) return;

    // Si on vient de la visualisation d'un personnage sauvegardé
    if (this.isFromSavedCharacters) {
      this.router.navigate(['/characters']);
      return;
    }

    const savedCharacters = this.getSavedCharacters();
    const editId = this.creationService.getEditingCharacterId();
    const editCreatedAt = this.creationService.getEditingCharacterCreatedAt();

    if (editId) {
      // Mode édition : mettre à jour le personnage existant
      const index = savedCharacters.findIndex((c: any) => c.id === editId);
      if (index !== -1) {
        savedCharacters[index] = {
          ...this.character,
          id: editId,
          createdAt: editCreatedAt,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Si non trouvé, ajouter comme nouveau
        savedCharacters.push({
          ...this.character,
          id: editId,
          createdAt: editCreatedAt,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      // Nouveau personnage
      const characterToSave = {
        ...this.character,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      savedCharacters.push(characterToSave);
    }

    localStorage.setItem('dragons-characters', JSON.stringify(savedCharacters));
    this.creationService.reset();
    this.router.navigate(['/characters']);
  }

  private getSavedCharacters(): any[] {
    const saved = localStorage.getItem('dragons-characters');
    return saved ? JSON.parse(saved) : [];
  }

  createAnother(): void {
    this.creationService.reset();
    this.router.navigate(['/create']);
  }

  downloadPdf(): void {
    if (!this.character) return;
    const hitDie = this.getHitDie();
    this.pdfService.generatePdf(this.character, hitDie);
  }

  goBack(): void {
    if (this.isFromSavedCharacters) {
      this.router.navigate(['/characters']);
    } else {
      this.router.navigate(['/create']);
    }
  }
}
