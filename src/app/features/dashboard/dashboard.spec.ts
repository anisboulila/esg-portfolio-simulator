import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { PortfolioService } from '../portfolios/services/portfolio.service';

const portfolioFixtures = [
  { id: 'p1', name: 'Portfolio Europe', description: 'Europe', assetCount: 24, currentValue: 1250000 },
  { id: 'p2', name: 'Portfolio Green', description: 'Green', assetCount: 18, currentValue: 875000 },
  { id: 'p3', name: 'Portfolio Sustainable', description: 'Sustainable', assetCount: 31, currentValue: 1630000 },
];

describe('Dashboard', () => {
  it('should render the computed portfolio summary', async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        {
          provide: PortfolioService,
          useValue: { getPortfolios: () => of(portfolioFixtures) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const summary = fixture.nativeElement as HTMLElement;
    expect(summary.querySelector('h1')?.textContent).toContain('Dashboard');
    const sections = summary.querySelectorAll('app-detail-section');
    expect(sections).toHaveLength(2);
    expect(sections[0]?.textContent).toContain('3');
    expect(sections[0]?.textContent).toContain('3755000');
    expect(sections[1]?.textContent).toContain('78 / 100');
  });
});