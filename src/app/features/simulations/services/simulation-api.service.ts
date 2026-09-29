import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { SimulationRequest } from '../models/simulation-request';
import { SimulationResult } from '../models/simulation-result';

export class SimulationNotFoundError extends Error {}
export class SimulationApiError extends Error {}

// Le service centralise l'accès à l'API : le formulaire ne connaît ni HttpClient,
// ni URL, ni détails de transport. Angular fournit HttpClient grâce à app.config.ts.
@Service()
export class SimulationApiService {
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

  // La couche API convertit le statut HTTP connu en erreur applicative typée.
  // Les pages peuvent distinguer 404 sans exposer la réponse brute du serveur.
  private mapError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return throwError(() => new SimulationNotFoundError());
    }

    return throwError(() => new SimulationApiError());
  }
}