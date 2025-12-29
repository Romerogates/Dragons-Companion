// features/equipment/equipment-list/equipment-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { EquipmentSummary } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './equipments-list.component.html',
  styleUrl: './equipments-list.component.scss',
})
export class EquipmentListComponent implements OnInit {
  private dataService = inject(DataService);

  allEquipment: EquipmentSummary[] = [];
  weapons: EquipmentSummary[] = [];
  armors: EquipmentSummary[] = [];
  gear: EquipmentSummary[] = [];
  tools: EquipmentSummary[] = [];
  mounts: EquipmentSummary[] = [];
  loading = true;

  private typeIcons: Record<string, string> = {
    Weapon: '⚔️',
    Armor: '🛡️',
    Gear: '🎒',
    Tool: '🔧',
    Mount: '🐴',
  };

  private subtypeIcons: Record<string, string> = {
    // Armes
    'Simple Melee': '🗡️',
    'Simple Ranged': '🏹',
    'Martial Melee': '⚔️',
    'Martial Ranged': '🎯',
    // Armures
    Light: '👕',
    Medium: '🥋',
    Heavy: '🦺',
    Shield: '🛡️',
    // Gear
    Adventuring: '🧗',
    Container: '🎒',
    Food: '🍖',
    'Light Source': '🔦',
    Potion: '🧪',
    Tool: '🔧',
    // Tools
    Artisan: '🔨',
    Gaming: '🎲',
    Instrument: '🎵',
    Thief: '🔓',
    // Mounts
    Animal: '🐴',
  };

  ngOnInit(): void {
    this.dataService.getEquipment().subscribe({
      next: (data) => {
        this.allEquipment = data;
        this.weapons = data.filter((e) => e.type === 'Weapon');
        this.armors = data.filter((e) => e.type === 'Armor');
        this.gear = data.filter((e) => e.type === 'Gear');
        this.tools = data.filter((e) => e.type === 'Tool');
        this.mounts = data.filter((e) => e.type === 'Mount');
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipement:', err);
        this.loading = false;
      },
    });
  }

  getTypeIcon(type: string): string {
    return this.typeIcons[type] ?? '📦';
  }

  getSubtypeIcon(subtype: string): string {
    return this.subtypeIcons[subtype] ?? '📦';
  }

  formatCost(cost: { value: number; unit: string }): string {
    return `${cost.value} ${cost.unit}`;
  }
}
