import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.Dashboard),
  },
  {
    path: 'portfolios',
    loadComponent: () =>
      import('./features/portfolios/portfolio-list').then(
        m => m.PortfolioList
      ),
  },
];