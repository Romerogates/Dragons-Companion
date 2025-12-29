// core/models/game-data.models.ts

// ============================================================
// LANGUAGES
// ============================================================

export interface LanguageSummary {
  id: string;
  name: string;
  category: string;
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
  abilityBonuses: Record<string, number>;
  speedMeters: number;
  sizeCategory: string;
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
  spellcasting?: ClassSpellcastingInfo;
  proficiencies: ProficienciesInfo;
  startingEquipment: EquipmentChoice[];
  progressionTable: LevelProgression[];
  subclassesAvailableAtLevel: number;
}

export interface ClassSpellcastingInfo {
  ability: string;
  type: string;
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
  choiceA: string[] | null;
  choiceB: string[] | null;
  choiceC: string[] | null;
  fixed: string[] | null;
}

export interface LevelProgression {
  level: number;
  profBonus: number;
  features: string[];
  spellSlots?: number[];
  classResources?: Record<string, number | string>;
}

// ============================================================
// EQUIPMENT
// ============================================================

export interface EquipmentSummary {
  id: string;
  name: string;
  type: string;
  subtype: string;
  cost: CostInfo;
}

export interface Equipment extends EquipmentSummary {
  weightKg: number;
  data?: WeaponData | ArmorData | GearData | ToolData | MountData;
}

export interface CostInfo {
  value: number;
  unit: string;
}

export interface WeaponData {
  damage_dice: string;
  damage_type: string;
  properties: string[];
}

export interface ArmorData {
  ac_base?: number;
  ac_bonus?: number;
  add_dex_mod?: boolean;
  max_dex_bonus?: number;
  str_requirement?: number;
  stealth_disadvantage?: boolean;
}

export interface GearData {
  description: string;
}

export interface ToolData {
  description?: string;
}

export interface MountData {
  speed: string;
  carry_capacity_kg: number;
  description?: string;
}
