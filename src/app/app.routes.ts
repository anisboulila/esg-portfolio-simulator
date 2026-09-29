import { Routes } from '@angular/router';

// This file composes feature route trees; each feature owns its own route details.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // Angular evaluates this dynamic import only when the dashboard route is visited,
    // keeping the dashboard feature out of the initial application bundle.
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (feature) => feature.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'portfolios',
    // The list and detail routes are loaded together as one portfolio feature boundary.
    loadChildren: () =>
      import('./features/portfolios/portfolios.routes').then(
        (feature) => feature.PORTFOLIO_ROUTES,
      ),
  },
  {
    path: 'simulations',
    // La feature Simulations est chargée seulement lors de sa première visite.
    loadChildren: () =>
      import('./features/simulations/simulations.routes').then(
        (feature) => feature.SIMULATIONS_ROUTES,
      ),
  },
  // Simulations has no implemented route tree yet, so no empty lazy feature is registered.
  { path: '**', redirectTo: '' },
];