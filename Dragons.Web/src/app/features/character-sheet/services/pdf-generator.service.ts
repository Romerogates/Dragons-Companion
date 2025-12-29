// features/character-sheet/services/pdf-generator.service.ts
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Character, EquipmentItem, AbilityScores } from '../../../core/models/character.models';

// Ratios de conversion SÉPARÉS pour X et Y
// Image source : 595 x 842 px
// PDF A4 : 210 x 297 mm
const SCALE_X = 210 / 595; // 0.3529
const SCALE_Y = 297 / 842; // 0.3527

// Convertir px en mm
function pxToMmX(px: number): number {
  return px * SCALE_X;
}

function pxToMmY(px: number): number {
  return px * SCALE_Y;
}

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  async generatePdf(character: Character, hitDie: number): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Charger les images de fond
    const images = await this.loadBackgroundImages();

    // === PAGE 1 ===
    pdf.addImage(images[0], 'JPEG', 0, 0, 210, 297);
    this.drawPage1(pdf, character, hitDie);

    // === PAGE 2 ===
    pdf.addPage();
    pdf.addImage(images[1], 'JPEG', 0, 0, 210, 297);
    this.drawPage2(pdf, character);

    // === PAGE 3 ===
    pdf.addPage();
    pdf.addImage(images[2], 'JPEG', 0, 0, 210, 297);
    this.drawPage3(pdf, character);

    // === PAGE 4 ===
    pdf.addPage();
    pdf.addImage(images[3], 'JPEG', 0, 0, 210, 297);
    this.drawPage4(pdf, character);

    // Télécharger
    pdf.save(`${character.name || 'personnage'}.pdf`);
  }

  private async loadBackgroundImages(): Promise<string[]> {
    const urls = [
      '/images/sheets/sheet-page1.jpg',
      '/images/sheets/sheet-page2.jpg',
      '/images/sheets/sheet-page3.jpg',
      '/images/sheets/sheet-page4.jpg',
    ];

    const promises = urls.map((url) => this.loadImage(url));
    return Promise.all(promises);
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // === HELPERS POUR LES ARMES ===

  // Récupérer les armes de l'équipement
  private getWeapons(equipment: EquipmentItem[]): EquipmentItem[] {
    return equipment.filter((item) => item.type === 'Weapon' && item.damage);
  }

  // Vérifier si l'arme a une propriété
  private hasProperty(weapon: EquipmentItem, property: string): boolean {
    if (!weapon.properties) return false;
    return weapon.properties.some((p) => p.toLowerCase().includes(property.toLowerCase()));
  }

  // Calculer le bonus d'attaque d'une arme
  private getWeaponAttackBonus(
    weapon: EquipmentItem,
    modifiers: AbilityScores,
    proficiencyBonus: number
  ): number {
    let abilityMod: number;

    // Arme à distance (Projectiles) → Dextérité
    if (this.hasProperty(weapon, 'projectile')) {
      abilityMod = modifiers.dexterite;
    }
    // Arme Finesse → max(Force, Dextérité)
    else if (this.hasProperty(weapon, 'finesse')) {
      abilityMod = Math.max(modifiers.force, modifiers.dexterite);
    }
    // Par défaut (mêlée) → Force
    else {
      abilityMod = modifiers.force;
    }

    return abilityMod + proficiencyBonus;
  }

  // Calculer le modificateur de dégâts d'une arme
  private getWeaponDamageMod(weapon: EquipmentItem, modifiers: AbilityScores): number {
    // Arme à distance → Dextérité
    if (this.hasProperty(weapon, 'projectile')) {
      return modifiers.dexterite;
    }
    // Finesse → max(Force, Dextérité)
    if (this.hasProperty(weapon, 'finesse')) {
      return Math.max(modifiers.force, modifiers.dexterite);
    }
    // Par défaut → Force
    return modifiers.force;
  }

  // Formater le bonus d'attaque (+5, -1, etc.)
  private formatBonus(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  // Raccourcir le type de dégâts pour l'affichage
  private shortenDamageType(damageType: string): string {
    const shortTypes: Record<string, string> = {
      tranchant: 'tr.',
      perforant: 'perf.',
      contondant: 'cont.',
      feu: 'feu',
      froid: 'froid',
      foudre: 'foudr.',
      acide: 'acide',
      poison: 'pois.',
      nécrotique: 'nécr.',
      radiant: 'rad.',
      psychique: 'psy.',
      force: 'force',
    };
    return shortTypes[damageType.toLowerCase()] || damageType;
  }

  // Dessiner un cercle plein (maîtrise)
  private drawFilledCircle(pdf: jsPDF, xPx: number, yPx: number, radiusMm: number = 2.1): void {
    pdf.setFillColor('#2c1810');
    pdf.circle(pxToMmX(xPx), pxToMmY(yPx), radiusMm, 'F');
  }

  // Dessiner un cercle vide (pas de maîtrise)
  private drawEmptyCircle(pdf: jsPDF, xPx: number, yPx: number, radiusMm: number = 0): void {
    pdf.setDrawColor('#2c1810');
    pdf.setLineWidth(0.3);
    pdf.circle(pxToMmX(xPx), pxToMmY(yPx), radiusMm, 'S');
  }

  // Dessiner cercle selon maîtrise
  private drawProfCircle(pdf: jsPDF, isProficient: boolean, xPx: number, yPx: number): void {
    if (isProficient) {
      this.drawFilledCircle(pdf, xPx, yPx);
    } else {
      this.drawEmptyCircle(pdf, xPx, yPx);
    }
  }

  // Helper pour écrire du texte
  private text(pdf: jsPDF, text: string, xPx: number, yPx: number): void {
    if (!text && text !== '0') return;
    pdf.text(String(text), pxToMmX(xPx), pxToMmY(yPx));
  }

  private drawPage1(pdf: jsPDF, c: Character, hitDie: number): void {
    const dark = '#2c1810';
    pdf.setTextColor(dark);

    // Helper pour formater les modificateurs
    const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

    // === HEADER ===
    pdf.setFontSize(18);
    this.text(pdf, c.name, 140, 43);
    this.text(pdf, c.species, 140, 66);
    this.text(pdf, c.civilization, 140, 90);
    this.text(pdf, `${c.class} ${c.level}`, 400, 43);
    this.text(pdf, String(c.experience), 400, 90);

    // === STATS VITALES ===
    this.text(pdf, String(c.hitPointsCurrent), 230, 123);
    this.text(pdf, String(c.hitPointsTemporary), 250, 171);
    this.text(pdf, `1d${hitDie}`, 438, 123);

    pdf.setFontSize(20);
    this.text(pdf, `+${c.proficiencyBonus}`, 55, 173);
    this.text(pdf, String(c.hitPointsMax), 370, 171);
    this.text(pdf, String(c.woundThreshold), 530, 171);
    this.text(pdf, fmt(c.initiative), 270, 220);
    this.text(pdf, String(c.passivePerception), 520, 220);

    pdf.setFontSize(15);
    this.text(pdf, String(c.armorClass), 360, 220);

    // === SCORES DE CARACTÉRISTIQUES ===
    pdf.setFontSize(15);
    this.text(pdf, String(c.abilities.force), 118, 221);
    this.text(pdf, String(c.abilities.dexterite), 118, 291);
    this.text(pdf, String(c.abilities.constitution), 118, 388);
    this.text(pdf, String(c.abilities.intelligence), 118, 442);
    this.text(pdf, String(c.abilities.sagesse), 118, 565);
    this.text(pdf, String(c.abilities.charisme), 118, 700);

    // === MODIFICATEURS ===
    pdf.setFontSize(10);
    this.text(pdf, fmt(c.abilityModifiers.force), 165, 225);
    this.text(pdf, fmt(c.abilityModifiers.dexterite), 165, 296);
    this.text(pdf, fmt(c.abilityModifiers.constitution), 165, 392);
    this.text(pdf, fmt(c.abilityModifiers.intelligence), 165, 445);
    this.text(pdf, fmt(c.abilityModifiers.sagesse), 165, 570);
    this.text(pdf, fmt(c.abilityModifiers.charisme), 165, 705);

    // === JETS DE SAUVEGARDE (cercles) ===
    const isSaveProf = (ability: string) =>
      c.savingThrows.some((s) => s.toLowerCase().includes(ability.toLowerCase()));

    this.drawProfCircle(pdf, isSaveProf('force'), 36, 237);
    this.drawProfCircle(pdf, isSaveProf('dext'), 36, 307);
    this.drawProfCircle(pdf, isSaveProf('const'), 36, 404);
    this.drawProfCircle(pdf, isSaveProf('intel'), 36, 455);
    this.drawProfCircle(pdf, isSaveProf('sag'), 36, 580);
    this.drawProfCircle(pdf, isSaveProf('char'), 36, 716);

    // === COMPÉTENCES (cercles) ===
    const isSkillProf = (skill: string) => c.skills.includes(skill);

    // Force - Athlétisme
    this.drawProfCircle(pdf, isSkillProf('Athlétisme'), 36, 255);
    this.drawEmptyCircle(pdf, 23, 255);

    // Dextérité
    this.drawProfCircle(pdf, isSkillProf('Acrobaties'), 36, 323);
    this.drawEmptyCircle(pdf, 23, 323);
    this.drawProfCircle(pdf, isSkillProf('Escamotage'), 36, 338);
    this.drawEmptyCircle(pdf, 23, 338);
    this.drawProfCircle(pdf, isSkillProf('Discrétion'), 36, 355);
    this.drawEmptyCircle(pdf, 23, 355);

    // Intelligence
    this.drawProfCircle(pdf, isSkillProf('Arcanes'), 36, 472);
    this.drawEmptyCircle(pdf, 23, 472);
    this.drawProfCircle(pdf, isSkillProf('Histoire'), 36, 487);
    this.drawEmptyCircle(pdf, 23, 487);
    this.drawProfCircle(pdf, isSkillProf('Investigation'), 36, 503);
    this.drawEmptyCircle(pdf, 23, 503);
    this.drawProfCircle(pdf, isSkillProf('Nature'), 36, 519);
    this.drawEmptyCircle(pdf, 23, 519);
    this.drawProfCircle(pdf, isSkillProf('Religion'), 36, 535);
    this.drawEmptyCircle(pdf, 23, 535);

    // Sagesse
    this.drawProfCircle(pdf, isSkillProf('Dressage'), 36, 596);
    this.drawEmptyCircle(pdf, 23, 596);
    this.drawProfCircle(pdf, isSkillProf('Intuition'), 36, 612);
    this.drawEmptyCircle(pdf, 23, 612);
    this.drawProfCircle(pdf, isSkillProf('Médecine'), 36, 628);
    this.drawEmptyCircle(pdf, 23, 628);
    this.drawProfCircle(pdf, isSkillProf('Perception'), 36, 644);
    this.drawEmptyCircle(pdf, 23, 644);
    this.drawProfCircle(pdf, isSkillProf('Survie'), 36, 660);
    this.drawEmptyCircle(pdf, 23, 660);

    // Charisme
    this.drawProfCircle(pdf, isSkillProf('Intimidation'), 36, 731);
    this.drawEmptyCircle(pdf, 23, 731);
    this.drawProfCircle(pdf, isSkillProf('Persuasion'), 36, 747);
    this.drawEmptyCircle(pdf, 23, 747);
    this.drawProfCircle(pdf, isSkillProf('Représentation'), 36, 763);
    this.drawEmptyCircle(pdf, 23, 763);
    this.drawProfCircle(pdf, isSkillProf('Tromperie'), 36, 779);
    this.drawEmptyCircle(pdf, 23, 779);

    // === VITESSE ===
    pdf.setFontSize(12);
    this.text(pdf, String(c.speed), 238, 360);
    this.text(pdf, String(c.speedClimb), 312, 360);
    this.text(pdf, String(c.speedSwim), 365, 360);
    this.text(pdf, String(c.jumpHeight), 286, 381);
    this.text(pdf, String(c.jumpLength), 361, 381);

    // === ATTAQUES (armes avec colonnes séparées) ===
    const attackTops = [476, 500, 523, 545, 570];

    // Positions X pour les 3 colonnes
    const colName = 210; // Nom de l'arme
    const colBonus = 450; // Bonus d'attaque (+5)
    const colDamage = 510; // Dégâts complets (1d12+3 tranchant)

    // Récupérer les armes
    const weapons = this.getWeapons(c.equipment);

    if (weapons.length > 0) {
      pdf.setFontSize(10);

      weapons.slice(0, 5).forEach((weapon, i) => {
        const yPos = attackTops[i];

        // Colonne 1 : Nom de l'arme
        this.text(pdf, weapon.name, colName, yPos);

        // Colonne 2 : Bonus d'attaque
        const attackBonus = this.getWeaponAttackBonus(
          weapon,
          c.abilityModifiers,
          c.proficiencyBonus
        );
        this.text(pdf, this.formatBonus(attackBonus), colBonus, yPos);

        // Colonne 3 : Dégâts complets (dés + mod + type)
        const damageMod = this.getWeaponDamageMod(weapon, c.abilityModifiers);
        const damageModStr = damageMod >= 0 ? `+${damageMod}` : `${damageMod}`;
        const damageType = weapon.damageType || '';
        const damageStr = `${weapon.damage}${damageModStr} ${damageType}`;
        this.text(pdf, damageStr, colDamage, yPos);
      });
    } else {
      // Fallback: afficher juste les noms d'équipement
      pdf.setFontSize(12);
      c.equipment.slice(0, 5).forEach((item, i) => {
        this.text(pdf, item.name, colName, attackTops[i]);
      });
    }
  }

  private drawPage2(pdf: jsPDF, c: Character): void {
    const dark = '#2c1810';
    pdf.setTextColor(dark);

    // === ARMURES ===
    pdf.setFontSize(15);
    const armors = c.armorProficiencies || [];
    if (armors[0]) this.text(pdf, armors[0], 125, 98);
    if (armors[1]) this.text(pdf, armors[1], 125, 120);

    // === ARMES ===
    const weapons = c.weaponProficiencies || [];
    if (weapons[0]) this.text(pdf, weapons[0], 125, 145);
    if (weapons[1]) this.text(pdf, weapons[1], 125, 168);

    // === RÉSISTANCES ===
    const resTops = [95, 115, 138, 160, 185];
    let resIndex = 0;

    if (c.hasDarkvision) {
      this.text(pdf, `Vision dans le noir (${c.darkvisionRadius}m)`, 380, resTops[resIndex]);
      resIndex++;
    }

    (c.resistances || []).forEach((res, i) => {
      if (resIndex + i < 5) {
        this.text(pdf, res, 375, resTops[resIndex + i]);
      }
    });

    // === TRAITS ===
    pdf.setFontSize(10);
    const traitTops = [250, 273, 294, 315, 338, 362, 383, 406, 429, 450];
    (c.racialTraits || []).forEach((trait, i) => {
      if (i < 10) {
        this.text(pdf, trait.name, 15, traitTops[i]);
      }
    });

    // === OUTILS ===
    const toolTops = [250, 273, 294, 315, 338, 362, 383, 406, 429, 450];
    (c.toolProficiencies || []).forEach((tool, i) => {
      if (i < 10) {
        this.text(pdf, tool, 204, toolTops[i]);
      }
    });

    // === LANGUES ===
    const langTops = [250, 273, 294, 315, 338, 362, 383, 406, 429, 450];
    (c.languages || []).forEach((lang, i) => {
      if (i < 10) {
        this.text(pdf, lang, 396, langTops[i]);
      }
    });
  }

  private drawPage3(pdf: jsPDF, c: Character): void {
    const dark = '#2c1810';
    pdf.setTextColor(dark);
    pdf.setFontSize(10);

    // Description
    if (c.description) this.text(pdf, c.description, 37, 70);

    // Background
    if (c.background) this.text(pdf, c.background, 37, 135);

    // Idéal
    if (c.ideal) this.text(pdf, c.ideal, 402, 125);

    // Traits
    if (c.traits) this.text(pdf, c.traits, 402, 198);

    // Alignement
    if (c.alignment) this.text(pdf, c.alignment, 402, 267);

    // Obligations
    if (c.bonds) this.text(pdf, c.bonds, 402, 314);

    // Failles
    if (c.flaws) this.text(pdf, c.flaws, 402, 387);

    // Handicap
    if (c.handicap) this.text(pdf, c.handicap, 402, 457);
  }

  private drawPage4(pdf: jsPDF, c: Character): void {
    const dark = '#2c1810';
    pdf.setTextColor(dark);
    pdf.setFontSize(10);

    // Équipement
    const equipTops = [173, 194, 216, 239, 262, 285, 307, 331, 354, 373, 397, 419];
    (c.equipment || []).forEach((item, i) => {
      if (i < 12) {
        const text = item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
        this.text(pdf, text, 66, equipTops[i]);
      }
    });

    // Équipement colonne droite (12-13)
    if (c.equipment[12]) {
      this.text(pdf, c.equipment[12].name, 222, 168);
    }
    if (c.equipment[13]) {
      this.text(pdf, c.equipment[13].name, 223, 188);
    }

    // Bourse
    this.text(pdf, `${c.currency?.or || 0} po`, 71, 486);
    this.text(pdf, `${c.currency?.argent || 0} pa`, 71, 507);
    this.text(pdf, `${c.currency?.cuivre || 0} pc`, 70, 531);

    // Charge max
    this.text(pdf, `${c.abilities.force * 7.5} kg`, 413, 245);
  }
}
