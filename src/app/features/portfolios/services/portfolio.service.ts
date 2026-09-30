import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { HttpTransportError } from '../../../core/errors/http-transport-error';
import { PortfolioApiService } from '../api/portfolio-api.service';
import { Portfolio } from '../models/portfolio';

// @Service marks this class for Angular DI and provides the stateless service at root.
// Components can share one data-access contract without owning or copying the fixtures.
@Service()
export class PortfolioService {
  private readonly portfolioApi = inject(PortfolioApiService);

  // Le service de feature fournit un accès métier stable aux pages; l'API service
  // s'occupe du transport HTTP. L'Observable laisse l'appelant composer le chargement.
  getPortfolios(): Observable<readonly Portfolio[]> {
    return this.portfolioApi.getPortfolios();
  }

  // L'interceptor a normalisé le statut HTTP; la feature décide qu'un 404 Portfolio
  // signifie « absent ». Les autres erreurs remontent pour alimenter l'état de la page.
  getPortfolioById(id: string): Observable<Portfolio | undefined> {
    return this.portfolioApi.getPortfolioById(id).pipe(
      catchError((error: unknown) => {
        const status =
          error instanceof HttpTransportError || error instanceof HttpErrorResponse
            ? error.status
            : undefined;
        if (status === 404) {
          return of(undefined);
        }

        return throwError(() => error);
      }),
    );
  }
}