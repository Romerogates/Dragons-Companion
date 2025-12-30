import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CharacterClass, LevelProgression } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // KeyValuePipe est dans CommonModule
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss',
  // PERFORMANCE : OnPush pour éviter les rendus inutiles
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  characterClass: CharacterClass | null = null;
  loading = true;
  selectedLevel = 1;

  // Liste complète des icônes (Dragons + D&D standard)
  private classIcons: Record<string, string> = {
    Barbare: '🪓',
    Barde: '🎵',
    Clerc: '✝️', // D&D Std
    Prêtre: '✝️', // Alt
    Druide: '🌿',
    Ensorceleur: '✨',
    Guerrier: '⚔️',
    Lettré: '📚', // Spécifique Dragons
    Magicien: '🔮',
    Moine: '👊',
    Paladin: '🛡️',
    Rôdeur: '🏹',
    Roublard: '🗡️',
    Sorcier: '👁️',
  };

  // Mapping des couleurs pour le header (SCSS themes)
  private classThemes: Record<string, string> = {
    Barbare: 'theme-red',
    Guerrier: 'theme-red',
    Paladin: 'theme-gold',
    Clerc: 'theme-gold',
    Prêtre: 'theme-gold',
    Magicien: 'theme-blue',
    Ensorceleur: 'theme-blue',
    Lettré: 'theme-blue',
    Sorcier: 'theme-purple',
    Druide: 'theme-green',
    Rôdeur: 'theme-green',
    Roublard: 'theme-gray',
    Moine: 'theme-blue-light',
    Barde: 'theme-pink',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getClassById(id).subscribe({
        next: (data) => {
          this.characterClass = data;
          this.loading = false;
          this.cd.markForCheck(); // Mise à jour UI
        },
        error: (err) => {
          console.error('Erreur chargement classe:', err);
          this.loading = false;
          this.cd.markForCheck();
        },
      });
    }
  }

  // --- HELPERS D'AFFICHAGE ---

  getIcon(name: string): string {
    // Recherche exacte ou partielle
    if (this.classIcons[name]) return this.classIcons[name];
    const key = Object.keys(this.classIcons).find((k) => name.includes(k));
    return key ? this.classIcons[key] : '⚔️';
  }

  getClassColorClass(className: string): string {
    // Recherche exacte ou partielle
    if (this.classThemes[className]) return this.classThemes[className];
    const key = Object.keys(this.classThemes).find((k) => className.includes(k));
    return key ? this.classThemes[key] : 'theme-default';
  }

  // --- LOGIQUE MÉTIER ---

  getCurrentProgression(): LevelProgression | undefined {
    // +this.selectedLevel assure la conversion en nombre
    return this.characterClass?.progressionTable.find((p) => p.level === +this.selectedLevel);
  }

  getAvailableLevels(): number[] {
    return this.characterClass?.progressionTable.map((p) => p.level) ?? [];
  }

  hasSpellSlots(slots: number[] | undefined): boolean {
    return !!slots && slots.some((s) => s > 0);
  }

  // Formattage des clés de ressources (ex: "rage_damage" -> "Dégâts de rage")
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
      martial_arts_dice: 'Dés arts martiaux',
      invocations_known: 'Invocations connues',
      bardic_inspiration_die: "Dé d'inspiration bardique",
    };
    // Fallback : remplace les underscores par des espaces
    return labels[key] ?? key.replace(/_/g, ' ');
  }

  // Formattage des emplacements de sorts pour l'affichage textuel (si besoin)
  // Note: Le template HTML utilise maintenant une grille visuelle, mais on garde ça au cas où.
  formatSpellSlots(slots: number[]): string {
    return slots
      .map((count, index) => (count > 0 ? `Niv.${index + 1}: ${count}` : null))
      .filter(Boolean)
      .join(' | ');
  }
}
