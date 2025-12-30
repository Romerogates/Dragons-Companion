// features/compendium/compendium.routes.ts
import { Routes } from '@angular/router';

export const COMPENDIUM_ROUTES: Routes = [
  // === SPECIES ===
  {
    path: 'species',
    loadComponent: () =>
      import('../species/species-list/species-list.component').then((m) => m.SpeciesListComponent),
  },
  {
    path: 'species/:id',
    loadComponent: () =>
      import('../species/species-detail/species-detail.component').then(
        (m) => m.SpeciesDetailComponent
      ),
  },

  // === CLASSES ===
  {
    path: 'classes',
    loadComponent: () =>
      import('../classes/class-list/class-list.component').then((m) => m.ClassListComponent),
  },
  {
    path: 'classes/:id',
    loadComponent: () =>
      import('../classes/class-detail/class-detail.component').then((m) => m.ClassDetailComponent),
  },

  // === CIVILIZATIONS ===
  {
    path: 'civilizations',
    loadComponent: () =>
      import('../civilizations/civilization-list/civilization-list.component').then(
        (m) => m.CivilizationListComponent
      ),
  },
  {
    path: 'civilizations/:id',
    loadComponent: () =>
      import('../civilizations/civilization-detail/civilization-detail.component').then(
        (m) => m.CivilizationDetailComponent
      ),
  },

  // === LANGUAGES ===
  {
    path: 'languages',
    loadComponent: () =>
      import('../languages/language-list/language-list.component').then(
        (m) => m.LanguageListComponent
      ),
  },
  {
    path: 'languages/:id',
    loadComponent: () =>
      import('../languages/language-detail/language-detail.component').then(
        (m) => m.LanguageDetailComponent
      ),
  },

  // === EQUIPMENT ===
  {
    path: 'equipment',
    loadComponent: () =>
      import('../equipments/equipments-list/equipments-list.component').then(
        (m) => m.EquipmentListComponent
      ),
  },
  {
    path: 'equipment/:id',
    loadComponent: () =>
      import('../equipments/equipment-detail/equipment-detail.component').then(
        (m) => m.EquipmentDetailComponent
      ),
  },

  // Route par défaut si on tape juste /compendium
  { path: '', redirectTo: 'species', pathMatch: 'full' },
];
