import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of, Subject, throwError } from 'rxjs';
import { type Mock } from 'vitest';
import { PortfolioApiService } from '../api/portfolio-api.service';
import { Portfolio } from '../models/portfolio';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let getPortfolios: Mock<() => Observable<readonly Portfolio[]>>;
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
    getPortfolios = vi.fn(() => of(portfolioFixtures));
    TestBed.configureTestingModule({
      providers: [
        PortfolioService,
        // useValue fournit un faux adaptateur à TestBed pour isoler le service de feature
        // du transport HTTP pendant ce test.
        {
          provide: PortfolioApiService,
          useValue: {
            getPortfolios,
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
    expect(getPortfolios).toHaveBeenCalledOnce();
  });

  it('should serve later collection reads from the shared data cache', async () => {
    await firstValueFrom(service.getPortfolios());
    const cachedPortfolios = await firstValueFrom(service.getPortfolios());

    expect(cachedPortfolios).toEqual(portfolioFixtures);
    expect(service.cachedPortfolios()).toEqual(portfolioFixtures);
    expect(getPortfolios).toHaveBeenCalledOnce();
  });

  it('should fetch fresh data after an explicit refresh', async () => {
    const refreshedPortfolios = portfolioFixtures.slice(0, 2);
    getPortfolios
      .mockReturnValueOnce(of(portfolioFixtures))
      .mockReturnValueOnce(of(refreshedPortfolios));

    await firstValueFrom(service.getPortfolios());
    const result = await firstValueFrom(service.refreshPortfolios());

    expect(result).toEqual(refreshedPortfolios);
    expect(service.cachedPortfolios()).toEqual(refreshedPortfolios);
    expect(getPortfolios).toHaveBeenCalledTimes(2);
  });

  it('should fetch again after explicit invalidation', async () => {
    await firstValueFrom(service.getPortfolios());

    service.invalidatePortfolios();

    expect(service.cachedPortfolios()).toBeNull();
    expect(await firstValueFrom(service.getPortfolios())).toEqual(portfolioFixtures);
    expect(getPortfolios).toHaveBeenCalledTimes(2);
  });

  it('should not cache an HTTP error and should allow a later retry', async () => {
    getPortfolios.mockReturnValueOnce(
      throwError(() => new Error('Temporary network failure')),
    );

    await expect(firstValueFrom(service.getPortfolios())).rejects.toThrow(
      'Temporary network failure',
    );
    expect(service.cachedPortfolios()).toBeNull();
    expect(await firstValueFrom(service.getPortfolios())).toEqual(portfolioFixtures);
    expect(getPortfolios).toHaveBeenCalledTimes(2);
  });

  it('should share one pending HTTP request between simultaneous consumers', async () => {
    const pendingRequest = new Subject<readonly Portfolio[]>();
    getPortfolios.mockReturnValueOnce(pendingRequest.asObservable());

    const firstConsumer = firstValueFrom(service.getPortfolios());
    const secondConsumer = firstValueFrom(service.getPortfolios());

    expect(getPortfolios).toHaveBeenCalledOnce();
    pendingRequest.next(portfolioFixtures);
    pendingRequest.complete();

    expect(await Promise.all([firstConsumer, secondConsumer])).toEqual([
      portfolioFixtures,
      portfolioFixtures,
    ]);
  });

  it('should not let an invalidated request overwrite refreshed data', async () => {
    const pendingRequest = new Subject<readonly Portfolio[]>();
    const refreshedPortfolios = portfolioFixtures.slice(0, 1);
    getPortfolios
      .mockReturnValueOnce(pendingRequest.asObservable())
      .mockReturnValueOnce(of(refreshedPortfolios));

    const oldRequest = firstValueFrom(service.getPortfolios());
    const freshData = await firstValueFrom(service.refreshPortfolios());
    pendingRequest.next(portfolioFixtures);
    pendingRequest.complete();
    await oldRequest;

    expect(freshData).toEqual(refreshedPortfolios);
    expect(service.cachedPortfolios()).toEqual(refreshedPortfolios);
    expect(getPortfolios).toHaveBeenCalledTimes(2);
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