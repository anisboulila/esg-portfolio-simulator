import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PortfolioCard } from './components/portfolio-card/portfolio-card';
import { PORTFOLIOS } from './data/portfolios';

@Component({
  selector: 'app-portfolio-list',
  imports: [PortfolioCard],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.css',
})
export class PortfolioList {
  private readonly router = inject(Router);
  protected readonly portfolios = PORTFOLIOS;

  onViewDetails(portfolioId: string): void {
    void this.router.navigate(['/portfolios', portfolioId]);
  }
}