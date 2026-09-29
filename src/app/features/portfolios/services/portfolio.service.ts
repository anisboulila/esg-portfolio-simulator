import { Service } from '@angular/core';
import { PORTFOLIOS } from '../data/portfolios';
import { Portfolio } from '../models/portfolio';

// @Service marks this class for Angular DI and provides the stateless service at root.
// Components can share one data-access contract without owning or copying the fixtures.
@Service()
export class PortfolioService {
  // The local fixture remains the data source until a later task introduces an API boundary.
  getPortfolios(): readonly Portfolio[] {
    return PORTFOLIOS;
  }

  // Returning undefined for an unknown ID lets the detail page render its not-found state.
  getPortfolioById(id: string): Portfolio | undefined {
    return this.getPortfolios().find((portfolio) => portfolio.id === id);
  }
}