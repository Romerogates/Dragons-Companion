// components/language-list/language-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { LanguageSummary } from '../../../core/models/data.model';

@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './language-list.component.html',
  styleUrl: './language-list.component.scss',
})
export class LanguageListComponent implements OnInit {
  private dataService = inject(DataService);

  languages: LanguageSummary[] = [];
  loading = true;

  private categoryIcons: Record<string, string> = {
    Base: '📜',
    Exotique: '✨',
    Secret: '🤫',
  };

  private categoryColors: Record<string, string> = {
    Base: 'base',
    Exotique: 'exotic',
    Secret: 'secret',
  };

  ngOnInit(): void {
    this.dataService.getLanguages().subscribe({
      next: (data) => {
        this.languages = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement langues:', err);
        this.loading = false;
      },
    });
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] ?? '📜';
  }

  getCategoryClass(category: string): string {
    return this.categoryColors[category] ?? 'base';
  }

  getLanguagesByCategory(category: string): LanguageSummary[] {
    return this.languages.filter((l) => l.category === category);
  }

  getCategories(): string[] {
    return ['Base', 'Exotique', 'Secret'];
  }
}
