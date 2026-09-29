import { Routes } from '@angular/router';
import { PortfolioDetail } from './pages/portfolio-detail/portfolio-detail';
import { EsgSimulationForm } from './pages/esg-simulation-form/esg-simulation-form';
import { PortfolioList } from './portfolio-list';

// The portfolio feature owns both its list URL and its parameterized detail URL.
export const PORTFOLIO_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PortfolioList,
  },
  {
    path: ':id/simulate',
    component: EsgSimulationForm,
  },
  {
    path: ':id',
    component: PortfolioDetail,
  },
];