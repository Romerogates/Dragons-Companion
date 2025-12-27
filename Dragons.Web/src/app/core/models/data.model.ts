// models/game-data.models.ts

// ============================================================
// LANGUAGES
// ============================================================

export interface LanguageSummary {
  id: string;
  name: string;
  category: string; // "Base" | "Exotique" | "Secret"
}

export interface Language extends LanguageSummary {
  scripts: string[];
  typicalSpeakers: string[];
  lore: string;
}

// ============================================================
// CIVILIZATIONS
// ============================================================

export interface CivilizationSummary {
  id: string;
  name: string;
}

export interface Civilization extends CivilizationSummary {
  randomization: RandomizationInfo;
  demographics: DemographicsInfo;
  linguistics: LinguisticsInfo;
  lore: LoreInfo;
}

export interface RandomizationInfo {
  diceMin: number;
  diceMax: number;
}

export interface DemographicsInfo {
  primarySpecies: string[];
  secondarySpecies: string[];
  isCosmopolitan: boolean;
}

export interface LinguisticsInfo {
  officialLanguages: string[];
  writingSystems: string[];
}

export interface LoreInfo {
  summary: string;
  keywords: string[];
}

// ============================================================
// SPECIES
// ============================================================

export interface SpeciesSummary {
  id: string;
  name: string;
  baseStats: BaseStatsInfo;
}

export interface Species extends SpeciesSummary {
  traits: TraitInfo[];
  languages: string[];
  subspecies: Subspecies[];
}

export interface BaseStatsInfo {
  abilityBonuses: Record<string, number>; // Ex: { "dexterite": 2, "sagesse": 1 }
  speedMeters: number;
  sizeCategory: string; // "P" | "M" | "G"
  hasDarkvision: boolean;
  darkvisionRadiusMeters: number;
}

export interface TraitInfo {
  name: string;
  description: string;
}

export interface Subspecies {
  id: string;
  name: string;
  additionalStats: AdditionalStatsInfo;
  additionalTraits: TraitInfo[];
}

export interface AdditionalStatsInfo {
  abilityBonuses: Record<string, number>;
}

// ============================================================
// CHARACTER CLASSES
// ============================================================

export interface CharacterClassSummary {
  id: string;
  name: string;
  hitDie: number;
  hasSpellcasting: boolean;
}

export interface CharacterClass extends CharacterClassSummary {
  primaryAbility: string[];
  spellcasting?: SpellcastingInfo;
  proficiencies: ProficienciesInfo;
  startingEquipment: EquipmentChoice[];
  progressionTable: LevelProgression[];
  subclassesAvailableAtLevel: number;
}

export interface SpellcastingInfo {
  ability: string;
  type: string; // "Spontaneous" | "Prepared"
}

export interface ProficienciesInfo {
  armor: string[];
  weapons: string[];
  tools: string[];
  savingThrows: string[];
  skills: SkillChoiceInfo;
}

export interface SkillChoiceInfo {
  chooseCount: number;
  options: string[];
}

export interface EquipmentChoice {
  choiceA?: string[];
  choiceB?: string[];
  choiceC?: string[];
  fixed?: string[];
}

export interface LevelProgression {
  level: number;
  profBonus: number;
  features: string[];
  spellSlots?: number[];
  classResources?: Record<string, number | string>; // Flexible pour rage_count, wild_shape_cr, etc.
}
