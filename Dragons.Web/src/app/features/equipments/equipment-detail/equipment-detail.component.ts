// features/equipment/equipment-detail/equipment-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
})
export class EquipmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  equipment: Equipment | null = null;
  loading = true;

  private typeIcons: Record<string, string> = {
    Weapon: '⚔️',
    Armor: '🛡️',
    Gear: '🎒',
    Tool: '🔧',
    Mount: '🐴',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getEquipmentById(id).subscribe({
        next: (data) => {
          this.equipment = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement équipement:', err);
          this.loading = false;
        },
      });
    }
  }

  getTypeIcon(): string {
    return this.equipment ? this.typeIcons[this.equipment.type] ?? '📦' : '📦';
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

  // === Data getters ===
  getWeaponData(): WeaponData | null {
    if (this.isWeapon() && this.equipment?.data) {
      return this.equipment.data as WeaponData;
    }
    return null;
  }

  getArmorData(): ArmorData | null {
    if (this.isArmor() && this.equipment?.data) {
      return this.equipment.data as ArmorData;
    }
    return null;
  }

  getGearData(): GearData | null {
    if (this.isGear() && this.equipment?.data) {
      return this.equipment.data as GearData;
    }
    return null;
  }

  getToolData(): ToolData | null {
    if (this.isTool() && this.equipment?.data) {
      return this.equipment.data as ToolData;
    }
    return null;
  }

  getMountData(): MountData | null {
    if (this.isMount() && this.equipment?.data) {
      return this.equipment.data as MountData;
    }
    return null;
  }

  // === Has data checks ===
  hasWeaponDamage(): boolean {
    const weapon = this.getWeaponData();
    return weapon !== null && !!weapon.damage_dice;
  }

  hasWeaponProperties(): boolean {
    const weapon = this.getWeaponData();
    return weapon !== null && weapon.properties && weapon.properties.length > 0;
  }

  hasArmorData(): boolean {
    const armor = this.getArmorData();
    return armor !== null && (!!armor.ac_base || !!armor.ac_bonus);
  }

  hasMountData(): boolean {
    const mount = this.getMountData();
    return mount !== null && (!!mount.speed || !!mount.carry_capacity_kg);
  }

  hasGearDescription(): boolean {
    const gear = this.getGearData();
    return gear !== null && !!gear.description;
  }

  hasToolDescription(): boolean {
    const tool = this.getToolData();
    return tool !== null && !!tool.description;
  }

  // === Display helpers ===
  getArmorClassDisplay(): string {
    const armor = this.getArmorData();
    if (!armor) return '';

    if (armor.ac_bonus) {
      return `+${armor.ac_bonus}`;
    }

    if (!armor.ac_base) return '';

    let display = `${armor.ac_base}`;
    if (armor.add_dex_mod) {
      if (armor.max_dex_bonus && armor.max_dex_bonus > 0) {
        display += ` + Dex (max ${armor.max_dex_bonus})`;
      } else {
        display += ` + Dex`;
      }
    }
    return display;
  }
}
