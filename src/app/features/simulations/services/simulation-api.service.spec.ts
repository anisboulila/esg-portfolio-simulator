import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Portfolio } from '../../portfolios/models/portfolio';
import { SimulationRequest } from '../models/simulation-request';
import { SimulationResult } from '../models/simulation-result';
import {
  SimulationApiError,
  SimulationApiService,
  SimulationNotFoundError,
} from './simulation-api.service';

describe('SimulationApiService', () => {
  let service: SimulationApiService;
  let httpTesting: HttpTestingController;

  const portfolio: Portfolio = {
    id: 'p1',
    name: 'Portfolio Europe',
    description: 'Diversified investments across European markets.',
    assetCount: 24,
    currentValue: 1250000,
  };

  const simulationRequest: SimulationRequest = {
    portfolioId: portfolio.id,
    carbonEmission: 120,
    greenInvestmentPercentage: 35,
    socialScore: 82,
    governanceScore: 91,
  };

  const simulationResult: SimulationResult = {
    id: 'simulation-1',
    portfolio,
    environmentalScore: 70,
    socialScore: 82,
    governanceScore: 91,
    globalScore: 80.5,
    greenInvestmentPercentage: 35,
  };

  beforeEach(() => {
    // TestBed compose l'injecteur du test : HttpClient est configuré, puis son backend est remplacé
    // par le backend de test, dont HttpTestingController permet d'observer les requêtes.
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: 'http://mock.test',
        },
      ],
    });

    service = TestBed.inject(SimulationApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // verify signale toute requête oubliée ou non traitée à la fin de chaque test.
  afterEach(() => httpTesting.verify());

  it('should load a typed simulation result by ID', async () => {
    // S'abonner déclenche HttpClient; expectOne récupère la requête simulée correspondante.
    const response = firstValueFrom(service.getSimulation(simulationResult.id));
    const request = httpTesting.expectOne(
      'http://mock.test/api/v1/esg/simulations/simulation-1',
    );

    expect(request.request.method).toBe('GET');
    // flush fournit le payload au backend de test et le renvoie dans l'Observable du service.
    request.flush(simulationResult);

    expect(await response).toEqual(simulationResult);
  });

  it('should submit a typed request and return the typed simulation result', async () => {
    // Le backend est simulé par HttpTestingController : aucun serveur réel n'est appelé.
    const response = firstValueFrom(service.createSimulation(simulationRequest));
    const request = httpTesting.expectOne('http://mock.test/api/v1/esg/simulations');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(simulationRequest);
    request.flush(simulationResult);

    expect(await response).toEqual(simulationResult);
  });

  it('should map a GET 404 response to SimulationNotFoundError', async () => {
    const response = firstValueFrom(service.getSimulation('missing'));
    const request = httpTesting.expectOne('http://mock.test/api/v1/esg/simulations/missing');

    request.flush(null, { status: 404, statusText: 'Not Found' });

    await expect(response).rejects.toBeInstanceOf(SimulationNotFoundError);
  });

  it('should map a GET 500 response to SimulationApiError', async () => {
    const response = firstValueFrom(service.getSimulation(simulationResult.id));
    const request = httpTesting.expectOne(
      'http://mock.test/api/v1/esg/simulations/simulation-1',
    );

    request.flush(null, { status: 500, statusText: 'Server Error' });

    await expect(response).rejects.toBeInstanceOf(SimulationApiError);
  });

  it('should map a POST 500 response to SimulationApiError', async () => {
    const response = firstValueFrom(service.createSimulation(simulationRequest));
    const request = httpTesting.expectOne('http://mock.test/api/v1/esg/simulations');

    request.flush(null, { status: 500, statusText: 'Server Error' });

    await expect(response).rejects.toBeInstanceOf(SimulationApiError);
  });
});