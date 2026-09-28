import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { PortfolioDetail } from './features/portfolios/pages/portfolio-detail/portfolio-detail';
import { PortfolioList } from './features/portfolios/portfolio-list';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Dashboard,
  },
  {
    path: 'portfolios',
    pathMatch: 'full',
    component: PortfolioList,
  },
  {
    path: 'portfolios/:id',
    component: PortfolioDetail,
  },
];