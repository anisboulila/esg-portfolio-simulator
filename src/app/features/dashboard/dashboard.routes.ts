import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

// Feature-local routes keep dashboard page ownership outside the root config.
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Dashboard,
  },
];