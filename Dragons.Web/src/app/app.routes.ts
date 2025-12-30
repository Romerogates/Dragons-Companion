// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // === HOME ===
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  // === APP PRINCIPALE (Création & Gestion) ===
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

  // === ENCYCLOPÉDIE (Lazy Loading groupé) ===
  // On charge toutes les routes de l'encyclopédie sous le préfixe 'compendium'
  // Exemple d'URL : /compendium/species, /compendium/classes
  {
    path: 'compendium',
    loadChildren: () =>
      import('./features/compendium/compendium.routes').then((m) => m.COMPENDIUM_ROUTES),
  },

  // === FALLBACK ===
  { path: '**', redirectTo: '' },
];
