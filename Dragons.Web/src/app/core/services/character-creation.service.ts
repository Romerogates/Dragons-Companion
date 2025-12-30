import { Injectable, signal, computed, effect } from '@angular/core';
import {
  CharacterCreation,
  Character,
  AbilityScores,
  TraitInfo,
  FeatureInfo,
  EquipmentItem,
  EquipmentChoice,
  SpellcastingInfo,
  ABILITY_POINT_COSTS,
  STARTING_POINTS,
  DEFAULT_ABILITY_SCORE,
  MIN_ABILITY_SCORE,
  MAX_ABILITY_SCORE,
} from '../models/character.models';

interface EditingCharacter {
  id: string;
  createdAt: string;
}

// Clé pour le LocalStorage
const STORAGE_KEY = 'dragon_character_creation_v1';

@Injectable({ providedIn: 'root' })
export class CharacterCreationService {
  // === ÉTAT INITIAL ===
  private initialState: CharacterCreation = {
    // Espèce
    speciesId: null,
    speciesName: null,
    subspeciesId: null,
    subspeciesName: null,
    racialBonuses: {},
    speciesTraits: [],
    speciesSpeed: 9,
    speciesSize: 'M',
    speciesLanguages: [],
    speciesResistances: [],
    hasDarkvision: false,
    darkvisionRadius: 0,

    // Civilisation
    civilizationId: null,
    civilizationName: null,
    civilizationLanguages: [],

    // Classe
    classId: null,
    className: null,
    hitDie: 0,
    hasSpellcasting: false,
    spellcastingAbility: null,
    savingThrows: [],
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    skillOptions: [],
    skillChooseCount: 0,
    classFeatures: [],
    startingEquipment: [],

    // Caractéristiques
    baseAbilities: {
      force: DEFAULT_ABILITY_SCORE,
      dexterite: DEFAULT_ABILITY_SCORE,
      constitution: DEFAULT_ABILITY_SCORE,
      intelligence: DEFAULT_ABILITY_SCORE,
      sagesse: DEFAULT_ABILITY_SCORE,
      charisme: DEFAULT_ABILITY_SCORE,
    },
    pointsRemaining: STARTING_POINTS,

    // Compétences
    selectedSkills: [],

    // Équipement
    selectedEquipment: [],
    currency: { or: 0, argent: 0, cuivre: 0 },

    // Langues
    languages: [],

    // Identité
    name: '',
    description: '',
    background: '',
    alignment: '',
    traits: '',
    ideal: '',
    bonds: '',
    flaws: '',
    handicap: '',
    story: '', // <-- AJOUTÉ
  };

  // === SIGNAUX RÉACTIFS ===
  character = signal<CharacterCreation>({ ...this.initialState });
  currentStep = signal<number>(1);
  totalSteps = 9;

  // === MODE ÉDITION ===
  private editingCharacter = signal<EditingCharacter | null>(null);

  constructor() {
    // 1. Tenter de charger une sauvegarde existante (Draft)
    this.loadFromStorage();

    // 2. Sauvegarde automatique à chaque changement
    effect(() => {
      // Cet effet se déclenche à chaque fois que 'character' ou 'currentStep' change
      this.saveToStorage({
        character: this.character(),
        step: this.currentStep(),
        editing: this.editingCharacter(),
      });
    });
  }

  // === COMPUTED ===

  // Caractéristiques finales (base + bonus raciaux)
  finalAbilities = computed<AbilityScores>(() => {
    const char = this.character();
    const base = char.baseAbilities;
    const bonuses = char.racialBonuses;

    return {
      force: base.force + (bonuses['force'] ?? 0),
      dexterite: base.dexterite + (bonuses['dexterite'] ?? 0),
      constitution: base.constitution + (bonuses['constitution'] ?? 0),
      intelligence: base.intelligence + (bonuses['intelligence'] ?? 0),
      sagesse: base.sagesse + (bonuses['sagesse'] ?? 0),
      charisme: base.charisme + (bonuses['charisme'] ?? 0),
    };
  });

  // Modificateurs
  abilityModifiers = computed<AbilityScores>(() => {
    const abilities = this.finalAbilities();
    return {
      force: this.getModifier(abilities.force),
      dexterite: this.getModifier(abilities.dexterite),
      constitution: this.getModifier(abilities.constitution),
      intelligence: this.getModifier(abilities.intelligence),
      sagesse: this.getModifier(abilities.sagesse),
      charisme: this.getModifier(abilities.charisme),
    };
  });

  // Perception passive
  passivePerception = computed<number>(() => {
    const mods = this.abilityModifiers();
    const char = this.character();
    const hasPerception = char.selectedSkills.includes('Perception');
    return 10 + mods.sagesse + (hasPerception ? 2 : 0);
  });

  // PV Max
  hitPointsMax = computed<number>(() => {
    const char = this.character();
    const mods = this.abilityModifiers();
    return char.hitDie + mods.constitution;
  });

  // Seuil de blessure
  woundThreshold = computed<number>(() => {
    return Math.ceil(this.hitPointsMax() / 2);
  });

  // CA de base (sans armure)
  armorClass = computed<number>(() => {
    const mods = this.abilityModifiers();
    return 10 + mods.dexterite;
  });

  // Initiative
  initiative = computed<number>(() => {
    return this.abilityModifiers().dexterite;
  });

  // Validation étape actuelle
  isCurrentStepValid = computed<boolean>(() => {
    const char = this.character();
    const step = this.currentStep();

    switch (step) {
      case 1:
        return char.speciesId !== null;
      case 2:
        return char.civilizationId !== null;
      case 3:
        return char.classId !== null;
      case 4:
        return char.pointsRemaining >= 0;
      case 5:
        return char.selectedSkills.length === char.skillChooseCount;
      case 6:
        return true;
      case 7:
        // Vérification basique : on a au moins les langues natives
        return char.languages.length > 0;
      case 8:
        return char.name.trim().length > 0;
      case 9:
        return true;
      default:
        return false;
    }
  });

  // === MODE ÉDITION & PERSISTANCE ===

  private saveToStorage(data: any) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erreur sauvegarde localStorage', e);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.character) {
          this.character.set(parsed.character);
        }
        if (parsed.step) {
          this.currentStep.set(parsed.step);
        }
        if (parsed.editing) {
          this.editingCharacter.set(parsed.editing);
        }
      }
    } catch (e) {
      console.error('Erreur lecture localStorage', e);
      this.clearStorage();
    }
  }

  private clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
  }

  checkForEditMode(): void {
    const editData = localStorage.getItem('dragons-edit-character');
    if (editData) {
      try {
        const character = JSON.parse(editData);
        this.loadCharacterForEdit(character);
        localStorage.removeItem('dragons-edit-character');
      } catch (error) {
        console.error('Erreur lors du chargement du personnage à éditer:', error);
        localStorage.removeItem('dragons-edit-character');
      }
    }
  }

  private loadCharacterForEdit(savedChar: any): void {
    // Sauvegarder l'ID pour la mise à jour
    this.editingCharacter.set({
      id: savedChar.id,
      createdAt: savedChar.createdAt,
    });

    // Extraire le nom de l'espèce (peut contenir la sous-espèce)
    let speciesName = savedChar.species || '';
    let subspeciesName: string | null = null;

    // Si le format est "Espèce (Sous-espèce)"
    const speciesMatch = speciesName.match(/^(.+?)\s*\((.+)\)$/);
    if (speciesMatch) {
      speciesName = speciesMatch[1].trim();
      subspeciesName = speciesMatch[2].trim();
    }

    // Charger toutes les données dans le character
    this.character.set({
      // Espèce
      speciesId: speciesName ? 'edit-mode' : null,
      speciesName: speciesName || null,
      subspeciesId: subspeciesName ? 'edit-mode' : null,
      subspeciesName: subspeciesName,
      racialBonuses: {},
      speciesTraits: savedChar.racialTraits || [],
      speciesSpeed: savedChar.speed || 9,
      speciesSize: 'M',
      speciesLanguages: [],
      speciesResistances: savedChar.resistances || [],
      hasDarkvision: savedChar.hasDarkvision || false,
      darkvisionRadius: savedChar.darkvisionRadius || 0,

      // Civilisation
      civilizationId: savedChar.civilization ? 'edit-mode' : null,
      civilizationName: savedChar.civilization || null,
      civilizationLanguages: [],

      // Classe
      classId: savedChar.class ? 'edit-mode' : null,
      className: savedChar.class || null,
      hitDie: savedChar.hitPointsMax - (savedChar.abilityModifiers?.constitution || 0),
      hasSpellcasting: savedChar.spellcasting !== null,
      spellcastingAbility: savedChar.spellcasting?.ability || null,
      savingThrows: savedChar.savingThrows || [],
      armorProficiencies: savedChar.armorProficiencies || [],
      weaponProficiencies: savedChar.weaponProficiencies || [],
      toolProficiencies: savedChar.toolProficiencies || [],
      skillOptions: [],
      skillChooseCount: savedChar.skills?.length || 0,
      classFeatures: savedChar.classFeatures || [],
      startingEquipment: [],

      // Caractéristiques
      baseAbilities: savedChar.abilities || {
        force: DEFAULT_ABILITY_SCORE,
        dexterite: DEFAULT_ABILITY_SCORE,
        constitution: DEFAULT_ABILITY_SCORE,
        intelligence: DEFAULT_ABILITY_SCORE,
        sagesse: DEFAULT_ABILITY_SCORE,
        charisme: DEFAULT_ABILITY_SCORE,
      },
      pointsRemaining: 0,

      // Compétences
      selectedSkills: savedChar.skills || [],

      // Équipement
      selectedEquipment: savedChar.equipment || [],
      currency: savedChar.currency || { or: 0, argent: 0, cuivre: 0 },

      // Langues
      languages: savedChar.languages || [],

      // Identité
      name: savedChar.name || '',
      description: savedChar.description || '',
      background: savedChar.background || '',
      alignment: savedChar.alignment || '',
      traits: savedChar.traits || '',
      ideal: savedChar.ideal || '',
      bonds: savedChar.bonds || '',
      flaws: savedChar.flaws || '',
      handicap: savedChar.handicap || '',
      story: savedChar.story || '', // <-- AJOUTÉ
    });

    // Aller à l'étape 9 (résumé)
    this.currentStep.set(9);
  }

  isEditMode(): boolean {
    return this.editingCharacter() !== null;
  }

  getEditingCharacterId(): string | null {
    return this.editingCharacter()?.id || null;
  }

  getEditingCharacterCreatedAt(): string | null {
    return this.editingCharacter()?.createdAt || null;
  }

  // === SETTERS (ACTIONS) ===

  // ÉTAPE 1
  setSpecies(
    speciesId: string,
    speciesName: string,
    subspeciesId: string | null,
    subspeciesName: string | null,
    racialBonuses: Record<string, number>,
    speciesTraits: TraitInfo[],
    speciesSpeed: number,
    speciesSize: string,
    speciesLanguages: string[],
    speciesResistances: string[],
    hasDarkvision: boolean,
    darkvisionRadius: number
  ): void {
    this.character.update((c) => ({
      ...c,
      speciesId,
      speciesName,
      subspeciesId,
      subspeciesName,
      racialBonuses,
      speciesTraits,
      speciesSpeed,
      speciesSize,
      speciesLanguages,
      speciesResistances,
      hasDarkvision,
      darkvisionRadius,
      languages: [...speciesLanguages],
    }));
  }

  clearSpecies(): void {
    this.character.update((c) => ({
      ...c,
      speciesId: null,
      speciesName: null,
      subspeciesId: null,
      subspeciesName: null,
      racialBonuses: {},
      speciesTraits: [],
      speciesSpeed: 9,
      speciesSize: 'M',
      speciesLanguages: [],
      speciesResistances: [],
      hasDarkvision: false,
      darkvisionRadius: 0,
      languages: [...c.civilizationLanguages],
    }));
  }

  // ÉTAPE 2
  setCivilization(
    civilizationId: string,
    civilizationName: string,
    officialLanguages: string[]
  ): void {
    this.character.update((c) => {
      const allLanguages = [...new Set([...c.speciesLanguages, ...officialLanguages])];
      return {
        ...c,
        civilizationId,
        civilizationName,
        civilizationLanguages: officialLanguages,
        languages: allLanguages,
      };
    });
  }

  clearCivilization(): void {
    this.character.update((c) => ({
      ...c,
      civilizationId: null,
      civilizationName: null,
      civilizationLanguages: [],
      languages: [...c.speciesLanguages],
    }));
  }

  // ÉTAPE 3
  setClass(
    classId: string,
    className: string,
    hitDie: number,
    hasSpellcasting: boolean,
    spellcastingAbility: string | null,
    savingThrows: string[],
    armorProficiencies: string[],
    weaponProficiencies: string[],
    toolProficiencies: string[],
    skillOptions: string[],
    skillChooseCount: number,
    classFeatures: FeatureInfo[],
    startingEquipment: EquipmentChoice[]
  ): void {
    this.character.update((c) => ({
      ...c,
      classId,
      className,
      hitDie,
      hasSpellcasting,
      spellcastingAbility,
      savingThrows,
      armorProficiencies,
      weaponProficiencies,
      toolProficiencies,
      skillOptions,
      skillChooseCount,
      classFeatures,
      startingEquipment,
      selectedSkills: [],
      selectedEquipment: [],
    }));
  }

  clearClass(): void {
    this.character.update((c) => ({
      ...c,
      classId: null,
      className: null,
      hitDie: 0,
      hasSpellcasting: false,
      spellcastingAbility: null,
      savingThrows: [],
      armorProficiencies: [],
      weaponProficiencies: [],
      toolProficiencies: [],
      skillOptions: [],
      skillChooseCount: 0,
      classFeatures: [],
      startingEquipment: [],
      selectedSkills: [],
      selectedEquipment: [],
    }));
  }

  // ÉTAPE 4
  setAbilityScore(ability: keyof AbilityScores, value: number): void {
    if (value < MIN_ABILITY_SCORE || value > MAX_ABILITY_SCORE) return;

    const currentChar = this.character();
    const currentValue = currentChar.baseAbilities[ability];

    const currentCost = ABILITY_POINT_COSTS[currentValue] ?? 0;
    const newCost = ABILITY_POINT_COSTS[value] ?? 0;
    const pointsDiff = currentCost - newCost;

    if (currentChar.pointsRemaining + pointsDiff < 0) return;

    this.character.update((c) => ({
      ...c,
      baseAbilities: {
        ...c.baseAbilities,
        [ability]: value,
      },
      pointsRemaining: c.pointsRemaining + pointsDiff,
    }));
  }

  incrementAbility(ability: keyof AbilityScores): void {
    const current = this.character().baseAbilities[ability];
    if (current < MAX_ABILITY_SCORE) {
      this.setAbilityScore(ability, current + 1);
    }
  }

  decrementAbility(ability: keyof AbilityScores): void {
    const current = this.character().baseAbilities[ability];
    if (current > MIN_ABILITY_SCORE) {
      this.setAbilityScore(ability, current - 1);
    }
  }

  resetAbilities(): void {
    this.character.update((c) => ({
      ...c,
      baseAbilities: {
        force: DEFAULT_ABILITY_SCORE,
        dexterite: DEFAULT_ABILITY_SCORE,
        constitution: DEFAULT_ABILITY_SCORE,
        intelligence: DEFAULT_ABILITY_SCORE,
        sagesse: DEFAULT_ABILITY_SCORE,
        charisme: DEFAULT_ABILITY_SCORE,
      },
      pointsRemaining: STARTING_POINTS,
    }));
  }

  // ÉTAPE 5
  toggleSkill(skill: string): void {
    this.character.update((c) => {
      const isSelected = c.selectedSkills.includes(skill);

      if (isSelected) {
        return {
          ...c,
          selectedSkills: c.selectedSkills.filter((s) => s !== skill),
        };
      } else if (c.selectedSkills.length < c.skillChooseCount) {
        return {
          ...c,
          selectedSkills: [...c.selectedSkills, skill],
        };
      }

      return c;
    });
  }

  clearSkills(): void {
    this.character.update((c) => ({
      ...c,
      selectedSkills: [],
    }));
  }

  // ÉTAPE 6
  addEquipment(item: EquipmentItem): void {
    this.character.update((c) => ({
      ...c,
      selectedEquipment: [...c.selectedEquipment, item],
    }));
  }

  removeEquipment(itemName: string): void {
    this.character.update((c) => ({
      ...c,
      selectedEquipment: c.selectedEquipment.filter((e) => e.name !== itemName),
    }));
  }

  setEquipmentChoice(items: EquipmentItem[]): void {
    this.character.update((c) => ({
      ...c,
      selectedEquipment: items,
    }));
  }

  setCurrency(currency: { or?: number; argent?: number; cuivre?: number }): void {
    this.character.update((c) => ({
      ...c,
      currency: {
        ...c.currency,
        ...currency,
      },
    }));
  }

  // ÉTAPE 7
  addLanguage(language: string): void {
    this.character.update((c) => ({
      ...c,
      languages: [...new Set([...c.languages, language])],
    }));
  }

  removeLanguage(language: string): void {
    this.character.update((c) => ({
      ...c,
      languages: c.languages.filter((l) => l !== language),
    }));
  }

  setLanguages(languages: string[]): void {
    this.character.update((c) => ({
      ...c,
      languages: languages,
    }));
  }

  // ÉTAPE 8
  setIdentity(identity: {
    name?: string;
    description?: string;
    background?: string;
    alignment?: string;
    traits?: string;
    ideal?: string;
    bonds?: string;
    flaws?: string;
    handicap?: string;
    story?: string; // <-- AJOUTÉ
  }): void {
    this.character.update((c) => ({
      ...c,
      ...identity,
    }));
  }

  // === NAVIGATION ===
  nextStep(): void {
    if (this.currentStep() < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep.update((s) => s + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
    }
  }

  // === RESET ===
  reset(): void {
    this.character.set({ ...this.initialState });
    this.currentStep.set(1);
    this.editingCharacter.set(null);
    this.clearStorage();
  }

  // === UTILITAIRES ===
  getModifier(value: number): number {
    return Math.floor((value - 10) / 2);
  }

  formatModifier(value: number): string {
    const mod = this.getModifier(value);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  // === GÉNÉRATION PERSONNAGE FINAL ===
  generateFinalCharacter(): Character {
    const c = this.character();
    const abilities = this.finalAbilities();
    const modifiers = this.abilityModifiers();

    const hasPerception = c.selectedSkills.includes('Perception');

    let spellcasting: SpellcastingInfo | null = null;
    if (c.hasSpellcasting && c.spellcastingAbility) {
      const spellMod = modifiers[c.spellcastingAbility.toLowerCase() as keyof AbilityScores] ?? 0;
      spellcasting = {
        ability: c.spellcastingAbility,
        spellSaveDC: 8 + 2 + spellMod,
        spellAttackBonus: 2 + spellMod,
        cantripsKnown: 0,
        spellsKnown: 0,
        spellSlots: [],
      };
    }

    return {
      name: c.name,
      species: c.subspeciesName ? `${c.speciesName} (${c.subspeciesName})` : c.speciesName ?? '',
      subspecies: c.subspeciesName,
      civilization: c.civilizationName ?? '',
      class: c.className ?? '',
      level: 1,
      experience: 0,
      background: c.background,
      alignment: c.alignment,
      abilities,
      abilityModifiers: modifiers,
      hitPointsMax: c.hitDie + modifiers.constitution,
      hitPointsCurrent: c.hitDie + modifiers.constitution,
      hitPointsTemporary: 0,
      woundThreshold: Math.ceil((c.hitDie + modifiers.constitution) / 2),
      armorClass: 10 + modifiers.dexterite,
      initiative: modifiers.dexterite,
      proficiencyBonus: 2,
      speed: c.speciesSpeed,
      speedClimb: Math.floor(c.speciesSpeed / 2),
      speedSwim: Math.floor(c.speciesSpeed / 2),
      jumpHeight: Math.floor(3 + modifiers.force),
      jumpLength: Math.floor(3 + modifiers.force),
      passivePerception: 10 + modifiers.sagesse + (hasPerception ? 2 : 0),
      hasDarkvision: c.hasDarkvision,
      darkvisionRadius: c.darkvisionRadius,
      savingThrows: c.savingThrows,
      skills: c.selectedSkills,
      armorProficiencies: c.armorProficiencies,
      weaponProficiencies: c.weaponProficiencies,
      toolProficiencies: c.toolProficiencies,
      languages: c.languages,
      racialTraits: c.speciesTraits,
      classFeatures: c.classFeatures,
      resistances: c.speciesResistances,
      immunities: [],
      spellcasting,
      equipment: c.selectedEquipment,
      currency: c.currency,
      description: c.description,
      traits: c.traits,
      ideal: c.ideal,
      bonds: c.bonds,
      flaws: c.flaws,
      handicap: c.handicap,
      story: c.story, // <-- AJOUTÉ
    };
  }
}
