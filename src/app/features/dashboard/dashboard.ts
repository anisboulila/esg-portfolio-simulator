import { Component, computed, signal } from '@angular/core';
import { DetailSection } from '../../shared/components/detail-section/detail-section';

@Component({
  selector: 'app-dashboard',
  imports: [DetailSection],
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