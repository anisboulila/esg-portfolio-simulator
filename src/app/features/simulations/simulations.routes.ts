import { Routes } from '@angular/router';
import { SimulationResultPage } from './pages/simulation-result/simulation-result';

// Cette feature possède la route du résultat; le chargement racine reste lazy.
export const SIMULATIONS_ROUTES: Routes = [
  {
    path: ':id',
    component: SimulationResultPage,
  },
];