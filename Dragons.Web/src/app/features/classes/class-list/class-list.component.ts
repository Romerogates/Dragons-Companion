// components/class-list/class-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
})
export class ClassListComponent implements OnInit {
  private dataService = inject(DataService);

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
    Rôdeur: '🏹',
    Roublard: '🗡️',
    Sorcier: '👁️',
  };

  ngOnInit(): void {
    this.dataService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement classes:', err);
        this.loading = false;
      },
    });
  }

  getIcon(name: string): string {
    return this.classIcons[name] ?? '⚔️';
  }

  getHitDieColor(hitDie: number): string {
    if (hitDie >= 12) return 'high';
    if (hitDie >= 10) return 'medium';
    if (hitDie >= 8) return 'low';
    return 'very-low';
  }
}
