// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/species', pathMatch: 'full' },

  // Species
  {
    path: 'species',
    loadComponent: () =>
      import('../app/features/species/species-list/species-list.component').then(
        (m) => m.SpeciesListComponent
      ),
  },
  {
    path: 'species/:id',
    loadComponent: () =>
      import('../app/features/species//species-detail/species-detail.component').then(
        (m) => m.SpeciesDetailComponent
      ),
  },

  // Classes
  {
    path: 'classes',
    loadComponent: () =>
      import('../app/features/classes/class-list/class-list.component').then(
        (m) => m.ClassListComponent
      ),
  },
  {
    path: 'classes/:id',
    loadComponent: () =>
      import('../app/features/classes/class-detail/class-detail.component').then(
        (m) => m.ClassDetailComponent
      ),
  },

  // Civilizations
  {
    path: 'civilizations',
    loadComponent: () =>
      import('../app/features/civilizations/civilization-list/civilization-list.component').then(
        (m) => m.CivilizationListComponent
      ),
  },
  {
    path: 'civilizations/:id',
    loadComponent: () =>
      import(
        '../app/features/civilizations/civilization-detail/civilization-detail.component'
      ).then((m) => m.CivilizationDetailComponent),
  },

  // Languages
  {
    path: 'languages',
    loadComponent: () =>
      import('../app/features/languages/language-list/language-list.component').then(
        (m) => m.LanguageListComponent
      ),
  },
  {
    path: 'languages/:id',
    loadComponent: () =>
      import('../app/features/languages/language-detail/language-detail.component').then(
        (m) => m.LanguageDetailComponent
      ),
  },

  // Fallback
  { path: '**', redirectTo: '/species' },
];
