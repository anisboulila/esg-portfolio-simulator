import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    service = TestBed.inject(PortfolioService);
  });

  it('should return the local portfolio collection', () => {
    const portfolios = service.getPortfolios();

    expect(portfolios).toHaveLength(3);
    expect(portfolios[0]?.id).toBe('p1');
  });

  it('should return a portfolio matching its ID', () => {
    expect(service.getPortfolioById('p2')).toEqual(
      expect.objectContaining({
        id: 'p2',
        name: 'Portfolio Green',
      }),
    );
  });

  it('should return undefined when the portfolio ID is unknown', () => {
    expect(service.getPortfolioById('missing')).toBeUndefined();
  });
});