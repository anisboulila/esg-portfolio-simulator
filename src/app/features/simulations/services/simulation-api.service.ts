import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpTransportError } from '../../../core/errors/http-transport-error';
import { SimulationRequest } from '../models/simulation-request';
import { SimulationResult } from '../models/simulation-result';

export class SimulationNotFoundError extends Error {}
export class SimulationApiError extends Error {}

// @Service() rend cet API service disponible au système DI Angular.
@Service()
export class SimulationApiService {
  // Angular résout HttpClient et API_BASE_URL depuis les providers configurés;
  // l'API service consomme ces dépendances sans fabriquer lui-même leur instance.
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // HttpClient transforme le POST en Observable typé : le serveur réel ou mock
  // fournit la réponse JSON, sans transport simulé dans le code Angular.
  createSimulation(request: SimulationRequest): Observable<SimulationResult> {
    return this.http
      .post<SimulationResult>(this.endpoint('/api/v1/esg/simulations'), request)
      .pipe(catchError((error: unknown) => this.mapError(error)));
  }

  // GET charge le résultat officiel pour les accès directs et les refreshs de la route.
  getSimulation(id: string): Observable<SimulationResult> {
    return this.http
      .get<SimulationResult>(
        this.endpoint(`/api/v1/esg/simulations/${encodeURIComponent(id)}`),
      )
      .pipe(catchError((error: unknown) => this.mapError(error)));
  }

  private endpoint(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}${path}`;
  }

  // L'interceptor préserve le statut dans une erreur transport commune; cette API
  // le traduit en erreur de simulation afin que la page garde un état not-found dédié.
  private mapError(error: unknown): Observable<never> {
    const status =
      error instanceof HttpTransportError || error instanceof HttpErrorResponse
        ? error.status
        : undefined;
    if (status === 404) {
      return throwError(() => new SimulationNotFoundError());
    }

    return throwError(() => new SimulationApiError());
  }
}