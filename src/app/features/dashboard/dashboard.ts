import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { DetailSection } from '../../shared/components/detail-section/detail-section';
import { PortfolioService } from '../portfolios/services/portfolio.service';

type DashboardPortfolioState =
  | { status: 'loading' }
  | { status: 'success'; portfolioCount: number; totalPortfolioValue: number }
  | { status: 'error' };

@Component({
  selector: 'app-dashboard',
  imports: [DetailSection],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly portfolioService = inject(PortfolioService);

  // Le nombre et la valeur agrègent les ressources Portfolio déjà exposées par l'API;
  // aucune route de résumé Dashboard supplémentaire n'est nécessaire.
  protected readonly portfolioState = toSignal(
    this.portfolioService.getPortfolios().pipe(
      map((portfolios) => ({
        status: 'success' as const,
        portfolioCount: portfolios.length,
        totalPortfolioValue: portfolios.reduce(
          (total, portfolio) => total + portfolio.currentValue,
          0,
        ),
      })),
      startWith({ status: 'loading' as const }),
      catchError(() => of({ status: 'error' as const })),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  protected readonly portfolioSummary = computed(() => this.portfolioState());

  // Le contrat Portfolio ne contient pas de score ESG et aucun endpoint de résumé
  // ESG n'est spécifié; cette valeur reste un exemple de présentation local.
  protected readonly averageEsgScore = signal(78);
}