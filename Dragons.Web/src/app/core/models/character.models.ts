// core/models/character.models.ts
import { EquipmentChoice, TraitInfo } from './game-data.models';

// Réexporter pour usage simplifié
export type { EquipmentChoice, TraitInfo };

// === CARACTÉRISTIQUES ===
export interface AbilityScores {
  force: number;
  dexterite: number;
  constitution: number;
  intelligence: number;
  sagesse: number;
  charisme: number;
}

// === INTERFACES UTILITAIRES ===
export interface FeatureInfo {
  name: string;
  description: string;
  level: number;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  weight?: number;
  // Données pour les armes
  type?: string; // "Weapon", "Armor", "Gear", etc.
  subtype?: string; // "Martial Melee", "Simple Ranged", etc.
  damage?: string; // "1d8", "2d6", etc.
  damageType?: string; // "tranchant", "perforant", "contondant"
  properties?: string[]; // ["Finesse", "Deux mains", "Projectiles (24/96)"]
  // Données pour les armures
  baseAC?: number;
  addDexMod?: boolean;
  maxDexBonus?: number;
}

export interface CurrencyInfo {
  or: number;
  argent: number;
  cuivre: number;
}

export interface SpellcastingInfo {
  ability: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  cantripsKnown: number;
  spellsKnown: number;
  spellSlots: number[];
}

// === ÉTAT DU PERSONNAGE EN COURS DE CRÉATION ===
export interface CharacterCreation {
  // === ÉTAPE 1 - ESPÈCE ===
  speciesId: string | null;
  speciesName: string | null;
  subspeciesId: string | null;
  subspeciesName: string | null;
  racialBonuses: Record<string, number>;
  speciesTraits: TraitInfo[];
  speciesSpeed: number;
  speciesSize: string;
  speciesLanguages: string[];
  speciesResistances: string[];
  hasDarkvision: boolean;
  darkvisionRadius: number;

  // === ÉTAPE 2 - CIVILISATION ===
  civilizationId: string | null;
  civilizationName: string | null;
  civilizationLanguages: string[];

  // === ÉTAPE 3 - CLASSE ===
  classId: string | null;
  className: string | null;
  hitDie: number;
  hasSpellcasting: boolean;
  spellcastingAbility: string | null;
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillOptions: string[];
  skillChooseCount: number;
  classFeatures: FeatureInfo[];
  startingEquipment: EquipmentChoice[];

  // === ÉTAPE 4 - CARACTÉRISTIQUES ===
  baseAbilities: AbilityScores;
  pointsRemaining: number;

  // === ÉTAPE 5 - COMPÉTENCES ===
  selectedSkills: string[];

  // === ÉTAPE 6 - ÉQUIPEMENT ===
  selectedEquipment: EquipmentItem[];
  currency: CurrencyInfo;

  // === ÉTAPE 7 - LANGUES ===
  languages: string[];

  // === ÉTAPE 8 - IDENTITÉ ===
  name: string;
  description: string;
  background: string;
  alignment: string;
  traits: string;
  ideal: string;
  bonds: string;
  flaws: string;
  handicap: string;
}

// === PERSONNAGE FINAL CALCULÉ ===
export interface Character {
  // Identité
  name: string;
  species: string;
  subspecies: string | null;
  civilization: string;
  class: string;
  level: number;
  experience: number;
  background: string;
  alignment: string;

  // Caractéristiques
  abilities: AbilityScores;
  abilityModifiers: AbilityScores;

  // Combat
  hitPointsMax: number;
  hitPointsCurrent: number;
  hitPointsTemporary: number;
  woundThreshold: number;
  armorClass: number;
  initiative: number;
  proficiencyBonus: number;

  // Vitesse
  speed: number;
  speedClimb: number;
  speedSwim: number;
  jumpHeight: number;
  jumpLength: number;

  // Perception
  passivePerception: number;
  hasDarkvision: boolean;
  darkvisionRadius: number;

  // Maîtrises
  savingThrows: string[];
  skills: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];

  // Capacités
  racialTraits: TraitInfo[];
  classFeatures: FeatureInfo[];
  resistances: string[];
  immunities: string[];

  // Sorts
  spellcasting: SpellcastingInfo | null;

  // Équipement
  equipment: EquipmentItem[];
  currency: CurrencyInfo;

  // Roleplay
  description: string;
  traits: string;
  ideal: string;
  bonds: string;
  flaws: string;
  handicap: string;
}

// === CONSTANTES ===
export const ABILITY_POINT_COSTS: Record<number, number> = {
  6: -3,
  7: -2,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
};

export const STARTING_POINTS = 15;
export const DEFAULT_ABILITY_SCORE = 10;
export const MIN_ABILITY_SCORE = 6;
export const MAX_ABILITY_SCORE = 15;

export const ALIGNMENTS = [
  'Loyal Bon',
  'Neutre Bon',
  'Chaotique Bon',
  'Loyal Neutre',
  'Neutre',
  'Chaotique Neutre',
  'Loyal Mauvais',
  'Neutre Mauvais',
  'Chaotique Mauvais',
];

export const ABILITY_NAMES: Record<keyof AbilityScores, string> = {
  force: 'Force',
  dexterite: 'Dextérité',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  sagesse: 'Sagesse',
  charisme: 'Charisme',
};
