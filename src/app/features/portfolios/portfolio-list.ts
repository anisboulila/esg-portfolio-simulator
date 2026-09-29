import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PortfolioCard } from './components/portfolio-card/portfolio-card';
import { PortfolioService } from './services/portfolio.service';

@Component({
  selector: 'app-portfolio-list',
  imports: [PortfolioCard],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.css',
})
export class PortfolioList {
  // inject() asks Angular's DI container for the shared portfolio data-access service.
  // The page now owns presentation and interaction, while the service owns data access.
  private readonly portfolioService = inject(PortfolioService);
  private readonly router = inject(Router);
  protected readonly portfolios = this.portfolioService.getPortfolios();

  onViewDetails(portfolioId: string): void {
    void this.router.navigate(['/portfolios', portfolioId]);
  }
}