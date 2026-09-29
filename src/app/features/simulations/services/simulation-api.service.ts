import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { API_BASE_URL, SIMULATION_API_MODE } from '../../../core/config/api.config';
import { Portfolio } from '../../portfolios/models/portfolio';
import { SimulationRequest } from '../models/simulation-request';
import { SimulationResult } from '../models/simulation-result';

const DEVELOPMENT_MOCK_PORTFOLIO: Portfolio = {
  id: '',
  name: 'Portfolio de démonstration',
  description: 'Portfolio retourné par le mock de développement.',
  assetCount: 0,
  currentValue: 0,
};

const DEVELOPMENT_MOCK_RESULT: SimulationResult = {
  id: 'dev-simulation-001',
  portfolio: DEVELOPMENT_MOCK_PORTFOLIO,
  environmentalScore: 70,
  socialScore: 70,
  governanceScore: 70,
  globalScore: 70,
  greenInvestmentPercentage: 0,
};

// Le service centralise l'accès à l'API : le formulaire ne connaît ni HttpClient,
// ni URL, ni détails de transport. Angular fournit HttpClient grâce à app.config.ts.
@Service()
export class SimulationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiMode = inject(SIMULATION_API_MODE);

  // Un Observable représente la réponse asynchrone. Le mode mock retourne le même
  // contrat typé sans réseau; le mode HTTP délègue le POST à HttpClient.
  createSimulation(request: SimulationRequest): Observable<SimulationResult> {
    if (this.apiMode === 'mock') {
      // Ce résultat fixe illustre le contrat sans recalculer de score métier côté Angular.
      return of({
        ...DEVELOPMENT_MOCK_RESULT,
        portfolio: {
          ...DEVELOPMENT_MOCK_PORTFOLIO,
          id: request.portfolioId,
        },
        greenInvestmentPercentage: request.greenInvestmentPercentage,
      });
    }

    // La base vient de l'injection de configuration plutôt que du composant.
    // Le type générique décrit la réponse attendue et le backend reste autoritaire.
    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, '');
    return this.http.post<SimulationResult>(
      `${normalizedBaseUrl}/api/v1/esg/simulations`,
      request,
    );
  }
}