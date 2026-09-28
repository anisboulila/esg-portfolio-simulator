import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly portfolioCount = signal(3);
  protected readonly totalPortfolioValue = signal(1250000);
  protected readonly averageEsgScore = signal(78);

  protected readonly portfolioSummary = computed(() => ({
    count: this.portfolioCount(),
    totalValue: this.totalPortfolioValue(),
    averageEsgScore: this.averageEsgScore(),
  }));
}