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
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://mock.test' },
      ],
    });

    service = TestBed.inject(PortfolioApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should load the typed portfolio collection from the API', async () => {
    const response = firstValueFrom(service.getPortfolios());
    const request = httpTesting.expectOne('http://mock.test/api/v1/portfolios');

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