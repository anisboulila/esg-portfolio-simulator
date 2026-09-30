import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Portfolio } from '../models/portfolio';

// Cette couche traduit les opérations Portfolio en requêtes HTTP typées.
// Elle ne possède ni fixtures ni présentation : le service de feature coordonne l'accès.
@Service()
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getPortfolios(): Observable<readonly Portfolio[]> {
    return this.http.get<readonly Portfolio[]>(this.endpoint('/api/v1/portfolios'));
  }

  getPortfolioById(id: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(
      this.endpoint(`/api/v1/portfolios/${encodeURIComponent(id)}`),
    );
  }

  private endpoint(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}${path}`;
  }
}