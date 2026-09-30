import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Portfolio } from '../../models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';

type PortfolioDetailState =
  | { status: 'loading' }
  | { status: 'success'; portfolio: Portfolio }
  | { status: 'not-found' }
  | { status: 'error' };

@Component({
  selector: 'app-portfolio-detail',
  imports: [RouterLink],
  templateUrl: './portfolio-detail.html',
  styleUrl: './portfolio-detail.css',
})
export class PortfolioDetail {
  // Angular injects the current route so this page can react to its :id parameter.
  private readonly route = inject(ActivatedRoute);
  // The same DI-managed service used by the list resolves the requested portfolio.
  private readonly portfolioService = inject(PortfolioService);

  protected readonly portfolioState = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const portfolioId = params.get('id');
        if (!portfolioId) {
          return of({ status: 'not-found' as const });
        }

        return this.portfolioService.getPortfolioById(portfolioId).pipe(
          map((portfolio) =>
            portfolio
              ? { status: 'success' as const, portfolio }
              : { status: 'not-found' as const },
          ),
          startWith({ status: 'loading' as const }),
          catchError(() => of({ status: 'error' as const })),
        );
      }),
    ),
    { initialValue: { status: 'loading' as const } },
  );
}