// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // === HOME ===
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  // === CHARACTER CREATION ===
  {
    path: 'create',
    loadComponent: () =>
      import('./features/character-creation/character-creation.component').then(
        (m) => m.CharacterCreationComponent
      ),
  },
  {
    path: 'character-sheet',
    loadComponent: () =>
      import('./features/character-sheet/character-sheet.component').then(
        (m) => m.CharacterSheetComponent
      ),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('./features/characters/characters.component').then((m) => m.CharactersComponent),
  },

  // === SPECIES ===
  {
    path: 'species',
    loadComponent: () =>
      import('./features/species/species-list/species-list.component').then(
        (m) => m.SpeciesListComponent
      ),
  },
  {
    path: 'species/:id',
    loadComponent: () =>
      import('./features/species/species-detail/species-detail.component').then(
        (m) => m.SpeciesDetailComponent
      ),
  },

  // === CLASSES ===
  {
    path: 'classes',
    loadComponent: () =>
      import('./features/classes/class-list/class-list.component').then(
        (m) => m.ClassListComponent
      ),
  },
  {
    path: 'classes/:id',
    loadComponent: () =>
      import('./features/classes/class-detail/class-detail.component').then(
        (m) => m.ClassDetailComponent
      ),
  },

  // === CIVILIZATIONS ===
  {
    path: 'civilizations',
    loadComponent: () =>
      import('./features/civilizations/civilization-list/civilization-list.component').then(
        (m) => m.CivilizationListComponent
      ),
  },
  {
    path: 'civilizations/:id',
    loadComponent: () =>
      import('./features/civilizations/civilization-detail/civilization-detail.component').then(
        (m) => m.CivilizationDetailComponent
      ),
  },

  // === LANGUAGES ===
  {
    path: 'languages',
    loadComponent: () =>
      import('./features/languages/language-list/language-list.component').then(
        (m) => m.LanguageListComponent
      ),
  },
  {
    path: 'languages/:id',
    loadComponent: () =>
      import('./features/languages/language-detail/language-detail.component').then(
        (m) => m.LanguageDetailComponent
      ),
  },

  // === EQUIPMENT ===
  {
    path: 'equipment',
    loadComponent: () =>
      import('./features/equipments/equipments-list/equipments-list.component').then(
        (m) => m.EquipmentListComponent
      ),
  },
  {
    path: 'equipment/:id',
    loadComponent: () =>
      import('./features/equipments/equipment-detail/equipment-detail.component').then(
        (m) => m.EquipmentDetailComponent
      ),
  },

  // === FALLBACK ===
  { path: '**', redirectTo: '' },
];
