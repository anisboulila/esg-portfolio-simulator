import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Portfolio } from '../models/portfolio';

// @Service() rend cet adaptateur HTTP disponible au système DI Angular.
@Service()
export class PortfolioApiService {
  // Angular résout HttpClient depuis sa configuration HTTP globale et API_BASE_URL
  // depuis son provider. Cet adaptateur ne crée donc ni le client ni sa configuration.
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