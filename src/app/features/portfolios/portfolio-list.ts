import { Component, computed, inject, signal } from '@angular/core';
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

  // The search term is mutable UI state, so a signal gives Angular a reactive value
  // to track. Reading searchTerm() registers this component's derived view as a consumer.
  protected readonly searchTerm = signal('');

  // The filtered list is derived from the service-owned collection and searchTerm.
  // Keeping it computed avoids storing a second list that would need manual syncing.
  // Angular tracks the signal read below and recalculates this value when the term changes.
  protected readonly filteredPortfolios = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return this.portfolios;
    }

    return this.portfolios.filter((portfolio) =>
      portfolio.name.toLowerCase().includes(normalizedSearchTerm),
    );
  });

  // The input event provides the latest text; set() updates the signal, which marks
  // the computed list and template for refresh without another service call.
  onSearchInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.searchTerm.set(target.value);
    }
  }

  onViewDetails(portfolioId: string): void {
    void this.router.navigate(['/portfolios', portfolioId]);
  }
}