import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import {
  Equipment,
  WeaponData,
  ArmorData,
  GearData,
  ToolData,
  MountData,
} from '../../../core/models/game-data.models';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './equipment-detail.component.html',
  styleUrl: './equipment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  equipment: Equipment | null = null;
  loading = true;

  private typeIcons: Record<string, string> = {
    Weapon: '⚔️',
    Armor: '🛡️',
    Gear: '🎒',
    Tool: '🔧',
    Mount: '🐴',
  };

  // NOUVEAU : Mapping pour les couleurs du header
  private typeThemes: Record<string, string> = {
    Weapon: 'theme-red',
    Armor: 'theme-blue',
    Gear: 'theme-gold',
    Tool: 'theme-gray',
    Mount: 'theme-green',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getEquipmentById(id).subscribe({
        next: (data) => {
          this.equipment = data;
          this.loading = false;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement équipement:', err);
          this.loading = false;
          this.cd.markForCheck();
        },
      });
    }
  }

  getTypeIcon(): string {
    return this.equipment ? this.typeIcons[this.equipment.type] ?? '📦' : '📦';
  }

  // Renvoie la classe CSS pour le thème (ex: 'theme-red')
  getTypeTheme(type: string): string {
    return this.typeThemes[type] ?? 'theme-default';
  }

  formatCost(): string {
    if (!this.equipment) return '';
    return `${this.equipment.cost.value} ${this.equipment.cost.unit}`;
  }

  // === Type checks ===
  isWeapon(): boolean {
    return this.equipment?.type === 'Weapon';
  }
  isArmor(): boolean {
    return this.equipment?.type === 'Armor';
  }
  isGear(): boolean {
    return this.equipment?.type === 'Gear';
  }
  isTool(): boolean {
    return this.equipment?.type === 'Tool';
  }
  isMount(): boolean {
    return this.equipment?.type === 'Mount';
  }

  // === Data getters (Type Guarding simplifiés) ===
  getWeaponData(): WeaponData | null {
    return this.isWeapon() ? (this.equipment?.data as WeaponData) : null;
  }
  getArmorData(): ArmorData | null {
    return this.isArmor() ? (this.equipment?.data as ArmorData) : null;
  }
  getGearData(): GearData | null {
    return this.isGear() ? (this.equipment?.data as GearData) : null;
  }
  getToolData(): ToolData | null {
    return this.isTool() ? (this.equipment?.data as ToolData) : null;
  }
  getMountData(): MountData | null {
    return this.isMount() ? (this.equipment?.data as MountData) : null;
  }

  // === Has data checks ===
  hasWeaponDamage(): boolean {
    return !!this.getWeaponData()?.damage_dice;
  }
  hasWeaponProperties(): boolean {
    return (this.getWeaponData()?.properties?.length ?? 0) > 0;
  }
  hasArmorData(): boolean {
    const a = this.getArmorData();
    return !!a && (!!a.ac_base || !!a.ac_bonus);
  }
  hasMountData(): boolean {
    const m = this.getMountData();
    return !!m && (!!m.speed || !!m.carry_capacity_kg);
  }
  hasGearDescription(): boolean {
    return !!this.getGearData()?.description;
  }
  hasToolDescription(): boolean {
    return !!this.getToolData()?.description;
  }

  // === Display helpers ===
  getArmorClassDisplay(): string {
    const armor = this.getArmorData();
    if (!armor) return '';

    if (armor.ac_bonus) return `+${armor.ac_bonus}`;
    if (!armor.ac_base) return '';

    let display = `${armor.ac_base}`;
    if (armor.add_dex_mod) {
      display +=
        armor.max_dex_bonus && armor.max_dex_bonus > 0
          ? ` + Dex (max ${armor.max_dex_bonus})`
          : ` + Dex`;
    }
    return display;
  }
}
