// shared/components/selection-card/selection-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selection-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-card.component.html',
  styleUrl: './selection-card.component.scss',
})
export class SelectionCardComponent {
  @Input() icon: string = '❓';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() details: string[] = [];
  @Input() selected: boolean = false;
  @Input() disabled: boolean = false;

  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.cardClick.emit();
    }
  }
}
