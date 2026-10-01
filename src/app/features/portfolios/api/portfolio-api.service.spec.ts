import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Portfolio } from '../models/portfolio';
import { PortfolioApiService } from './portfolio-api.service';

// Ces tests vérifient le contrat transport du service API; contrairement aux tests
// de composants, ils n'ont ni ComponentFixture ni assertions sur le DOM.
describe('PortfolioApiService', () => {
  let service: PortfolioApiService;
  let httpTesting: HttpTestingController;

  const portfolio: Portfolio = {
    id: 'p1',
    name: 'Portfolio Europe',
    description: 'Diversified investments across European markets.',
    assetCount: 24,
    currentValue: 1250000,
  };

  beforeEach(() => {
    // TestBed configure HttpClient et son backend de test; HttpTestingController permet
    // d'observer la requête et de fournir une réponse sans serveur externe.
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // useValue remplace le token d'URL par une valeur stable fournie à l'injecteur de test.
        { provide: API_BASE_URL, useValue: 'http://mock.test' },
      ],
    });

    service = TestBed.inject(PortfolioApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // verify échoue s'il reste une requête inattendue, ce qui évite qu'un test masque un HTTP oublié.
  afterEach(() => httpTesting.verify());

  it('should load the typed portfolio collection from the API', async () => {
    // firstValueFrom s'abonne à l'Observable; expectOne observe le vrai chemin demandé.
    const response = firstValueFrom(service.getPortfolios());
    const request = httpTesting.expectOne('http://mock.test/api/v1/portfolios');

    // On vérifie d'abord la méthode, puis flush simule la réponse serveur consommée par le service.
    expect(request.request.method).toBe('GET');
    request.flush([portfolio]);

    expect(await response).toEqual([portfolio]);
  });

  it('should load one typed portfolio by ID from the API', async () => {
    const response = firstValueFrom(service.getPortfolioById('p1'));
    const request = httpTesting.expectOne('http://mock.test/api/v1/portfolios/p1');

    expect(request.request.method).toBe('GET');
    request.flush(portfolio);

    expect(await response).toEqual(portfolio);
  });
});