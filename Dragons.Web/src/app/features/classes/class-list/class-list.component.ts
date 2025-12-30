import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CharacterClassSummary } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassListComponent implements OnInit {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  classes: CharacterClassSummary[] = [];
  loading = true;

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
    Clerc: '✝️', // Au cas où
    Rôdeur: '🏹',
    Roublard: '🗡️',
    Sorcier: '👁️',
  };

  // Mapping des couleurs par classe
  private classThemes: Record<string, string> = {
    Barbare: 'theme-red',
    Guerrier: 'theme-red',
    Paladin: 'theme-gold',
    Prêtre: 'theme-gold',
    Clerc: 'theme-gold',
    Magicien: 'theme-blue',
    Ensorceleur: 'theme-blue',
    Lettré: 'theme-blue', // Ou Cyan
    Sorcier: 'theme-purple',
    Druide: 'theme-green',
    Rôdeur: 'theme-green',
    Roublard: 'theme-gray',
    Moine: 'theme-cyan',
    Barde: 'theme-pink',
  };

  ngOnInit(): void {
    this.dataService.getClasses().subscribe({
      next: (data) => {
        // Tri alphabétique
        this.classes = data.sort((a, b) => a.name.localeCompare(b.name));
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  getIcon(name: string): string {
    return this.classIcons[name] ?? '⚔️';
  }

  getThemeClass(name: string): string {
    return this.classThemes[name] ?? 'theme-default';
  }

  getHitDieColor(hitDie: number): string {
    if (hitDie >= 12) return 'high'; // Barbare
    if (hitDie >= 10) return 'medium'; // Guerrier, Paladin, Rôdeur
    if (hitDie >= 8) return 'low'; // Clerc, Roublard, etc.
    return 'very-low'; // Magicien, Ensorceleur
  }
}
