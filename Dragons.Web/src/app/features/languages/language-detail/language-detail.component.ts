// components/language-detail/language-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Language } from '../../../core/models/data.model';

@Component({
  selector: 'app-language-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './language-detail.component.html',
  styleUrl: './language-detail.component.scss',
})
export class LanguageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  language: Language | null = null;
  loading = true;

  private categoryIcons: Record<string, string> = {
    Base: '📜',
    Exotique: '✨',
    Secret: '🤫',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getLanguageById(id).subscribe({
        next: (data) => {
          this.language = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement langue:', err);
          this.loading = false;
        },
      });
    }
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] ?? '📜';
  }

  getCategoryClass(category: string): string {
    const classes: Record<string, string> = {
      Base: 'base',
      Exotique: 'exotic',
      Secret: 'secret',
    };
    return classes[category] ?? 'base';
  }
}
