import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { PortfolioApiService } from '../api/portfolio-api.service';
import { Portfolio } from '../models/portfolio';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  const portfolioFixtures: readonly Portfolio[] = [
    {
      id: 'p1',
      name: 'Portfolio Europe',
      description: 'Diversified investments across European markets.',
      assetCount: 24,
      currentValue: 1250000,
    },
    {
      id: 'p2',
      name: 'Portfolio Green',
      description: 'Investments focused on renewable energy and sustainability.',
      assetCount: 18,
      currentValue: 875000,
    },
    {
      id: 'p3',
      name: 'Portfolio Sustainable',
      description: 'Long-term investments screened for ESG performance.',
      assetCount: 31,
      currentValue: 1630000,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PortfolioApiService,
          useValue: {
            getPortfolios: () => of(portfolioFixtures),
            getPortfolioById: (id: string) => {
              const portfolio = portfolioFixtures.find((item) => item.id === id);
              return portfolio
                ? of(portfolio)
                : throwError(() => new HttpErrorResponse({ status: 404 }));
            },
          },
        },
      ],
    });
    service = TestBed.inject(PortfolioService);
  });

  it('should return the portfolio collection from the API abstraction', async () => {
    const portfolios = await firstValueFrom(service.getPortfolios());

    expect(portfolios).toHaveLength(3);
    expect(portfolios[0]?.id).toBe('p1');
  });

  it('should return a portfolio matching its ID', async () => {
    expect(await firstValueFrom(service.getPortfolioById('p2'))).toEqual(
      expect.objectContaining({
        id: 'p2',
        name: 'Portfolio Green',
      }),
    );
  });

  it('should return undefined when the API reports an unknown portfolio ID', async () => {
    expect(await firstValueFrom(service.getPortfolioById('missing'))).toBeUndefined();
  });
});