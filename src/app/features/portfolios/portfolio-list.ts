import { Component } from '@angular/core';
import { Portfolio } from './models/portfolio';
import { PortfolioCard } from './components/portfolio-card/portfolio-card';

@Component({
  selector: 'app-portfolio-list',
  imports: [PortfolioCard],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.css',
})
export class PortfolioList {
  protected readonly portfolios: Portfolio[] = [
    {
      id: 'p1',
      name: 'Portfolio Europe',
      description: 'Diversified investments across European markets.',
      assetCount: 24,
      currentValue: 1250000,
    },
    {
      id: 'p2',
      name: 'Portfolio Green',
      description: 'Investments focused on renewable energy and sustainability.',
      assetCount: 18,
      currentValue: 875000,
    },
    {
      id: 'p3',
      name: 'Portfolio Sustainable',
      description: 'Long-term investments screened for ESG performance.',
      assetCount: 31,
      currentValue: 1630000,
    },
  ];

  onViewDetails(portfolioId: string): void {
  console.log('Portfolio sélectionné :', portfolioId);
}
}