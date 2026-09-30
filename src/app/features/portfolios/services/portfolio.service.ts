import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { HttpTransportError } from '../../../core/errors/http-transport-error';
import { PortfolioApiService } from '../api/portfolio-api.service';
import { Portfolio } from '../models/portfolio';

// @Service() marque cette classe comme service et la rend automatiquement disponible
// au système DI Angular, conformément au décorateur de la version utilisée par le projet.
@Service()
export class PortfolioService {
  // inject() demande PortfolioApiService à l'injecteur Angular; le service ne construit
  // pas lui-même sa dépendance. La chaîne continue vers HttpClient et API_BASE_URL.
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