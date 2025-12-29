// features/character-creation/steps/equipment-step/equipment-step.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CharacterCreationService } from '../../../../core/services/character-creation.service';
import { DataService } from '../../../../core/services/data.service';
import { EquipmentItem } from '../../../../core/models/character.models';
import {
  Equipment,
  EquipmentSummary,
  EquipmentChoice,
  WeaponData,
  ArmorData,
} from '../../../../core/models/game-data.models';

@Component({
  selector: 'app-equipment-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-step.component.html',
  styleUrl: './equipment-step.component.scss',
})
export class EquipmentStepComponent implements OnInit {
  creationService = inject(CharacterCreationService);
  private dataService = inject(DataService);

  // Stocke le choix sélectionné pour chaque ligne d'équipement (index -> 'A' | 'B' | 'C')
  selectedChoices: Record<number, string> = {};

  // Cache des détails d'équipement (name lowercase normalisé -> Equipment)
  private equipmentCache = new Map<string, Equipment>();

  // Map nom normalisé -> id pour retrouver les équipements
  private equipmentNameToId = new Map<string, string>();

  // Liste complète des équipements de l'API (pour debug et matching)
  private allEquipments: EquipmentSummary[] = [];

  // État de chargement
  isLoading = true;

  ngOnInit(): void {
    this.loadEquipmentData();
  }

  // Normaliser un nom pour le matching (enlever accents, minuscules, espaces multiples)
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  private loadEquipmentData(): void {
    // 1. Charger la liste complète des équipements
    this.dataService.getEquipment().subscribe({
      next: (equipments: EquipmentSummary[]) => {
        this.allEquipments = equipments;

        console.log('📋 Équipements API chargés:', equipments.length);

        // Créer le mapping nom normalisé -> id
        equipments.forEach((eq) => {
          const normalizedName = this.normalizeName(eq.name);
          this.equipmentNameToId.set(normalizedName, eq.id);
          console.log(`  - "${eq.name}" → "${normalizedName}" → ${eq.id}`);
        });

        // 2. Identifier tous les noms d'équipements dans les choix de départ
        const allItemNames = this.getAllEquipmentNames();
        console.log('🎒 Items dans startingEquipment:', allItemNames);

        // 3. Trouver les IDs correspondants
        const itemsToLoad: { name: string; id: string }[] = [];

        allItemNames.forEach((name) => {
          const id = this.findEquipmentId(name);
          if (id) {
            itemsToLoad.push({ name, id });
            console.log(`  ✅ "${name}" → ID trouvé: ${id}`);
          } else {
            console.warn(`  ❌ "${name}" → ID NON TROUVÉ`);
            // Afficher les noms similaires pour debug
            this.findSimilarNames(name);
          }
        });

        // 4. Charger les détails de chaque équipement trouvé
        if (itemsToLoad.length === 0) {
          console.warn('⚠️ Aucun équipement à charger!');
          this.isLoading = false;
          return;
        }

        const detailRequests = itemsToLoad.map((item) =>
          this.dataService.getEquipmentById(item.id).pipe(
            catchError((err) => {
              console.error(`Erreur chargement ${item.name}:`, err);
              return of(null);
            })
          )
        );

        forkJoin(detailRequests).subscribe({
          next: (details) => {
            details.forEach((detail) => {
              if (detail) {
                const normalizedName = this.normalizeName(detail.name);
                this.equipmentCache.set(normalizedName, detail);
                console.log(`📦 Détail chargé: "${detail.name}"`, detail.data);
              }
            });
            console.log('✅ Cache rempli:', this.equipmentCache.size, 'items');
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des détails:', err);
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des équipements:', err);
        this.isLoading = false;
      },
    });
  }

  // Trouver l'ID d'un équipement par son nom (avec plusieurs stratégies)
  private findEquipmentId(name: string): string | null {
    const cleanName = this.extractItemName(name);
    const normalizedName = this.normalizeName(cleanName);

    // 1. Essayer le match exact normalisé
    let id = this.equipmentNameToId.get(normalizedName);
    if (id) return id;

    // 2. Essayer de trouver un nom qui contient notre recherche
    for (const [apiName, apiId] of this.equipmentNameToId.entries()) {
      if (apiName.includes(normalizedName) || normalizedName.includes(apiName)) {
        return apiId;
      }
    }

    // 3. Essayer sans les parenthèses et ce qu'il y a dedans
    const withoutParens = normalizedName.replace(/\s*\([^)]*\)/g, '').trim();
    id = this.equipmentNameToId.get(withoutParens);
    if (id) return id;

    return null;
  }

  // Afficher les noms similaires pour debug
  private findSimilarNames(searchName: string): void {
    const normalized = this.normalizeName(this.extractItemName(searchName));
    const similar: string[] = [];

    this.allEquipments.forEach((eq) => {
      const eqNormalized = this.normalizeName(eq.name);
      // Vérifier si les premiers caractères correspondent
      if (
        eqNormalized.startsWith(normalized.substring(0, 3)) ||
        normalized.startsWith(eqNormalized.substring(0, 3))
      ) {
        similar.push(eq.name);
      }
    });

    if (similar.length > 0) {
      console.log(`    🔍 Noms similaires dans l'API: ${similar.join(', ')}`);
    }
  }

  private getAllEquipmentNames(): string[] {
    const names = new Set<string>();
    const startingEquipment = this.getStartingEquipment();

    startingEquipment.forEach((choice) => {
      const allChoices = [
        ...(choice.fixed || []),
        ...(choice.choiceA || []),
        ...(choice.choiceB || []),
        ...(choice.choiceC || []),
      ];

      allChoices.forEach((item) => {
        const cleanName = this.extractItemName(item);
        names.add(cleanName);
      });
    });

    return Array.from(names);
  }

  private extractItemName(itemString: string): string {
    // Gérer les formats comme "Javeline x5" ou "Flèches (20)"
    const quantityMatch = itemString.match(/^(.+?)\s*(?:x\d+|\(\d+\))$/i);
    return quantityMatch ? quantityMatch[1].trim() : itemString.trim();
  }

  private extractQuantity(itemString: string): number {
    const match = itemString.match(/x(\d+)|\((\d+)\)/i);
    if (match) {
      return parseInt(match[1] || match[2], 10);
    }
    return 1;
  }

  private getEquipmentDetail(name: string): Equipment | null {
    const cleanName = this.extractItemName(name);
    const normalizedName = this.normalizeName(cleanName);

    // Essayer le match exact
    let detail = this.equipmentCache.get(normalizedName);
    if (detail) return detail;

    // Essayer de trouver un match partiel
    for (const [cachedName, cachedDetail] of this.equipmentCache.entries()) {
      if (cachedName.includes(normalizedName) || normalizedName.includes(cachedName)) {
        return cachedDetail;
      }
    }

    return null;
  }

  getStartingEquipment(): EquipmentChoice[] {
    return this.creationService.character().startingEquipment ?? [];
  }

  isFixedChoice(choice: EquipmentChoice): boolean {
    return choice.fixed !== null && choice.fixed.length > 0;
  }

  hasChoice(choice: EquipmentChoice, option: 'A' | 'B' | 'C'): boolean {
    const key = `choice${option}` as keyof EquipmentChoice;
    const value = choice[key];
    return value !== null && Array.isArray(value) && value.length > 0;
  }

  getChoiceItems(choice: EquipmentChoice, option: 'A' | 'B' | 'C'): string[] {
    const key = `choice${option}` as keyof EquipmentChoice;
    const value = choice[key];
    return (value as string[]) ?? [];
  }

  selectChoice(choiceIndex: number, option: 'A' | 'B' | 'C'): void {
    this.selectedChoices[choiceIndex] = option;
    this.updateSelectedEquipment();
  }

  isChoiceSelected(choiceIndex: number, option: 'A' | 'B' | 'C'): boolean {
    return this.selectedChoices[choiceIndex] === option;
  }

  private updateSelectedEquipment(): void {
    const equipment: EquipmentItem[] = [];
    const startingEquipment = this.getStartingEquipment();

    startingEquipment.forEach((choice, index) => {
      if (this.isFixedChoice(choice)) {
        (choice.fixed ?? []).forEach((itemName) => {
          const item = this.createEquipmentItem(itemName);
          equipment.push(item);
        });
      } else {
        const selectedOption = this.selectedChoices[index];
        if (selectedOption) {
          const items = this.getChoiceItems(choice, selectedOption as 'A' | 'B' | 'C');
          items.forEach((itemName) => {
            const item = this.createEquipmentItem(itemName);
            equipment.push(item);
          });
        }
      }
    });

    console.log('🎒 Équipement final sélectionné:', equipment);
    this.creationService.setEquipmentChoice(equipment);
  }

  private createEquipmentItem(itemString: string): EquipmentItem {
    const name = this.extractItemName(itemString);
    const quantity = this.extractQuantity(itemString);
    const detail = this.getEquipmentDetail(name);

    const item: EquipmentItem = {
      name,
      quantity,
    };

    if (detail) {
      console.log(`  ✅ Détail trouvé pour "${name}":`, detail);
      item.weight = detail.weightKg;
      item.type = detail.type;
      item.subtype = detail.subtype;

      // Si c'est une arme, ajouter les données de combat
      if (detail.type === 'Weapon' && detail.data) {
        const weaponData = detail.data as WeaponData;
        item.damage = weaponData.damage_dice;
        item.damageType = weaponData.damage_type;
        item.properties = weaponData.properties;
        console.log(`    ⚔️ Arme: ${weaponData.damage_dice} ${weaponData.damage_type}`);
      }

      // Si c'est une armure, ajouter les données de défense
      if (detail.type === 'Armor' && detail.data) {
        const armorData = detail.data as ArmorData;
        item.baseAC = armorData.ac_base;
        item.addDexMod = armorData.add_dex_mod;
        item.maxDexBonus = armorData.max_dex_bonus;
        console.log(`    🛡️ Armure: CA ${armorData.ac_base}`);
      }
    } else {
      console.warn(`  ❌ Pas de détail trouvé pour "${name}"`);
    }

    return item;
  }

  getSelectedEquipmentList(): string[] {
    return this.creationService.character().selectedEquipment.map((e) => e.name);
  }

  isAllChoicesMade(): boolean {
    const startingEquipment = this.getStartingEquipment();
    let choiceCount = 0;
    let selectedCount = 0;

    startingEquipment.forEach((choice, index) => {
      if (!this.isFixedChoice(choice)) {
        choiceCount++;
        if (this.selectedChoices[index]) {
          selectedCount++;
        }
      }
    });

    return choiceCount === selectedCount;
  }

  getChoiceIcon(option: 'A' | 'B' | 'C'): string {
    const icons: Record<string, string> = { A: '🅰️', B: '🅱️', C: '©️' };
    return icons[option] ?? '📦';
  }

  getItemInfo(itemName: string): string {
    const detail = this.getEquipmentDetail(itemName);
    if (!detail) return '';

    if (detail.type === 'Weapon' && detail.data) {
      const weaponData = detail.data as WeaponData;
      return `${weaponData.damage_dice} ${weaponData.damage_type}`;
    }

    if (detail.type === 'Armor' && detail.data) {
      const armorData = detail.data as ArmorData;
      if (armorData.ac_base) {
        return `CA ${armorData.ac_base}`;
      }
    }

    return '';
  }
}
