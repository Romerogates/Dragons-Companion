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
import { Language } from '../../../core/models/game-data.models';

@Component({
  selector: 'app-language-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './language-detail.component.html',
  styleUrl: './language-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  language: Language | null = null;
  loading = true;

  private categoryIcons: Record<string, string> = {
    Base: '📜',
    Exotique: '✨',
    Secret: '🤫',
  };

  private themeClasses: Record<string, string> = {
    Base: 'theme-green',
    Exotique: 'theme-purple',
    Secret: 'theme-red',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getLanguageById(id).subscribe({
        next: (data) => {
          this.language = data;
          this.loading = false;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement langue:', err);
          this.loading = false;
          this.cd.markForCheck();
        },
      });
    }
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] ?? '📜';
  }

  getThemeClass(category: string): string {
    return this.themeClasses[category] ?? 'theme-default';
  }
}
