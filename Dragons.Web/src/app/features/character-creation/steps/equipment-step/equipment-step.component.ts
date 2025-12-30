import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentStepComponent implements OnInit, AfterViewChecked {
  creationService = inject(CharacterCreationService);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  @ViewChildren('choiceContainer') choiceContainers!: QueryList<ElementRef>;

  selectedChoices: Record<number, string> = {};
  private equipmentCache = new Map<string, Equipment>();
  private equipmentNameToId = new Map<string, string>();
  private allEquipments: EquipmentSummary[] = [];

  isLoading = true;
  currentStepIndex = 0;
  private shouldScroll = false;

  ngOnInit(): void {
    this.loadEquipmentData();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToLastItem();
      this.shouldScroll = false;
    }
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private loadEquipmentData(): void {
    this.dataService
      .getEquipment()
      .pipe(
        finalize(() => {
          // Fin de chargement globale gérée dans le subscribe
        })
      )
      .subscribe({
        next: (equipments: EquipmentSummary[]) => {
          this.allEquipments = equipments;
          equipments.forEach((eq) => {
            this.equipmentNameToId.set(this.normalizeName(eq.name), eq.id);
          });

          const allItemNames = this.getAllEquipmentNames();
          const itemsToLoad: { name: string; id: string }[] = [];

          allItemNames.forEach((name) => {
            const id = this.findEquipmentId(name);
            if (id) itemsToLoad.push({ name, id });
          });

          if (itemsToLoad.length === 0) {
            this.finishLoading();
            return;
          }

          const detailRequests = itemsToLoad.map((item) =>
            this.dataService.getEquipmentById(item.id).pipe(catchError(() => of(null)))
          );

          forkJoin(detailRequests).subscribe({
            next: (details) => {
              details.forEach((detail) => {
                if (detail) {
                  this.equipmentCache.set(this.normalizeName(detail.name), detail);
                }
              });
              this.finishLoading();
            },
          });
        },
        error: (err) => {
          console.error('Erreur chargement équipement:', err);
          this.isLoading = false;
          this.cd.markForCheck();
        },
      });
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.updateSelectedEquipment(); // Restaure les sélections si existantes
    this.updateVisibleStep(); // Calcule où l'utilisateur en est
    this.cd.markForCheck();
  }

  private findEquipmentId(name: string): string | null {
    const cleanName = this.extractItemName(name);
    const normalizedName = this.normalizeName(cleanName);

    let id = this.equipmentNameToId.get(normalizedName);
    if (id) return id;

    for (const [apiName, apiId] of this.equipmentNameToId.entries()) {
      if (apiName.includes(normalizedName) || normalizedName.includes(apiName)) {
        return apiId;
      }
    }

    const withoutParens = normalizedName.replace(/\s*\([^)]*\)/g, '').trim();
    return this.equipmentNameToId.get(withoutParens) || null;
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
      allChoices.forEach((item) => names.add(this.extractItemName(item)));
    });
    return Array.from(names);
  }

  private extractItemName(itemString: string): string {
    const quantityMatch = itemString.match(/^(.+?)\s*(?:x\d+|\(\d+\))$/i);
    return quantityMatch ? quantityMatch[1].trim() : itemString.trim();
  }

  private extractQuantity(itemString: string): number {
    const match = itemString.match(/x(\d+)|\((\d+)\)/i);
    return match ? parseInt(match[1] || match[2], 10) : 1;
  }

  private getEquipmentDetail(name: string): Equipment | null {
    const normalizedName = this.normalizeName(this.extractItemName(name));
    if (this.equipmentCache.has(normalizedName)) return this.equipmentCache.get(normalizedName)!;
    for (const [cachedName, cachedDetail] of this.equipmentCache.entries()) {
      if (cachedName.includes(normalizedName) || normalizedName.includes(cachedName))
        return cachedDetail;
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
    return (choice[key] as string[]) ?? [];
  }

  selectChoice(choiceIndex: number, option: 'A' | 'B' | 'C'): void {
    this.selectedChoices[choiceIndex] = option;
    this.updateSelectedEquipment();
    this.updateVisibleStep();
    this.cd.markForCheck();
  }

  isChoiceSelected(choiceIndex: number, option: 'A' | 'B' | 'C'): boolean {
    return this.selectedChoices[choiceIndex] === option;
  }

  // Logique séquentielle
  private updateVisibleStep(): void {
    const equipmentList = this.getStartingEquipment();
    let nextIndex = 0;

    for (let i = 0; i < equipmentList.length; i++) {
      const choice = equipmentList[i];
      // Si fixe ou déjà choisi, on passe au suivant
      if (this.isFixedChoice(choice) || this.selectedChoices[i]) {
        nextIndex = i + 1;
      } else {
        // Bloque ici
        nextIndex = i;
        break;
      }
    }

    // On déclenche le scroll seulement si on a avancé
    if (nextIndex > this.currentStepIndex) {
      this.shouldScroll = true;
    }
    this.currentStepIndex = nextIndex;
  }

  private scrollToLastItem(): void {
    try {
      if (this.choiceContainers && this.choiceContainers.last) {
        this.choiceContainers.last.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } catch (err) {
      console.warn('Scroll error', err);
    }
  }

  private updateSelectedEquipment(): void {
    const equipment: EquipmentItem[] = [];
    const startingEquipment = this.getStartingEquipment();

    startingEquipment.forEach((choice, index) => {
      if (this.isFixedChoice(choice)) {
        (choice.fixed ?? []).forEach((itemName) => {
          equipment.push(this.createEquipmentItem(itemName));
        });
      } else {
        const selectedOption = this.selectedChoices[index];
        if (selectedOption) {
          const items = this.getChoiceItems(choice, selectedOption as 'A' | 'B' | 'C');
          items.forEach((itemName) => {
            equipment.push(this.createEquipmentItem(itemName));
          });
        }
      }
    });
    this.creationService.setEquipmentChoice(equipment);
  }

  private createEquipmentItem(itemString: string): EquipmentItem {
    const name = this.extractItemName(itemString);
    const quantity = this.extractQuantity(itemString);
    const detail = this.getEquipmentDetail(name);
    const item: EquipmentItem = { name, quantity };

    if (detail) {
      item.weight = detail.weightKg;
      item.type = detail.type;
      item.subtype = detail.subtype;
      if (detail.type === 'Weapon' && detail.data) {
        const d = detail.data as WeaponData;
        item.damage = d.damage_dice;
        item.damageType = d.damage_type;
        item.properties = d.properties;
      }
      if (detail.type === 'Armor' && detail.data) {
        const d = detail.data as ArmorData;
        item.baseAC = d.ac_base;
        item.addDexMod = d.add_dex_mod;
        item.maxDexBonus = d.max_dex_bonus;
      }
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
        if (this.selectedChoices[index]) selectedCount++;
      }
    });
    return choiceCount === selectedCount;
  }

  getItemInfo(itemName: string): string {
    const detail = this.getEquipmentDetail(itemName);
    if (!detail) return '';
    if (detail.type === 'Weapon' && detail.data) {
      const d = detail.data as WeaponData;
      return `${d.damage_dice} ${d.damage_type}`;
    }
    if (detail.type === 'Armor' && detail.data) {
      const d = detail.data as ArmorData;
      return d.ac_base ? `CA ${d.ac_base}` : '';
    }
    return '';
  }
}
