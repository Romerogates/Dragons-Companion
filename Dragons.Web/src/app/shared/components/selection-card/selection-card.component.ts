import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selection-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-card.component.html',
  styleUrl: './selection-card.component.scss',
  // OPTIMISATION : OnPush est crucial pour les perfs des listes de cartes
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionCardComponent {
  // Le titre est obligatoire pour que la carte ait du sens
  @Input({ required: true }) title!: string;

  @Input() icon: string = '❓';
  @Input() subtitle: string = '';
  @Input() details: string[] = [];
  @Input() selected: boolean = false;
  @Input() disabled: boolean = false;

  @Output() cardClick = new EventEmitter<void>();

  /**
   * Gère le clic et les interactions clavier (Entrée / Espace)
   * @param event L'événement DOM (optionnel)
   */
  onClick(event?: Event): void {
    // Si désactivé, on arrête tout immédiatement
    if (this.disabled) {
      event?.stopPropagation();
      event?.preventDefault();
      return;
    }

    // Si l'interaction vient de la barre d'espace, on empêche le scroll de la page
    if (event instanceof KeyboardEvent && event.key === ' ') {
      event.preventDefault();
    }

    this.cardClick.emit();
  }
}
