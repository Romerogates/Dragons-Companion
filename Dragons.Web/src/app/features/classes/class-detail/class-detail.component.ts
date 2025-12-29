// components/class-detail/class-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CharacterClass, LevelProgression } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss',
})
export class ClassDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  characterClass: CharacterClass | null = null;
  loading = true;
  selectedLevel = 1;

  private classIcons: Record<string, string> = {
    Barbare: '🪓',
    Barde: '🎵',
    Druide: '🌿',
    Ensorceleur: '✨',
    Guerrier: '⚔️',
    Lettré: '📚',
    Magicien: '🔮',
    Moine: '👊',
    Paladin: '🛡️',
    Prêtre: '✝️',
    Rôdeur: '🏹',
    Roublard: '🗡️',
    Sorcier: '👁️',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getClassById(id).subscribe({
        next: (data) => {
          this.characterClass = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement classe:', err);
          this.loading = false;
        },
      });
    }
  }

  getIcon(name: string): string {
    return this.classIcons[name] ?? '⚔️';
  }

  getCurrentProgression(): LevelProgression | undefined {
    // Conversion en number car ngModel avec select renvoie un string
    return this.characterClass?.progressionTable.find((p) => p.level === +this.selectedLevel);
  }

  getAvailableLevels(): number[] {
    return this.characterClass?.progressionTable.map((p) => p.level) ?? [];
  }

  hasSpellSlots(slots: number[] | undefined): boolean {
    return !!slots && slots.some((s) => s > 0);
  }

  formatResourceKey(key: string): string {
    const labels: Record<string, string> = {
      rages_count: 'Rages',
      rage_damage: 'Dégâts de rage',
      sorcery_points: 'Points de sorcellerie',
      cantrips_known: 'Sorts mineurs connus',
      spells_known: 'Sorts connus',
      ki_points: 'Points de ki',
      sneak_attack_dice: "Dés d'attaque sournoise",
      wild_shape_cr: 'FP forme sauvage',
    };
    return labels[key] ?? key.replace(/_/g, ' ');
  }

  formatSpellSlots(slots: number[]): string {
    return slots
      .map((count, index) => (count > 0 ? `Niv.${index + 1}: ${count}` : null))
      .filter(Boolean)
      .join(' | ');
  }
}
