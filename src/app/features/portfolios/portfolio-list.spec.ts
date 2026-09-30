import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PortfolioList } from './portfolio-list';
import { PortfolioService } from './services/portfolio.service';

const portfolioFixtures = [
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

// Ce faux service est injecté via useValue pour garder ces tests de rendu indépendants du HTTP.
const portfolioServiceStub = {
  getPortfolios: () => of(portfolioFixtures),
  getPortfolioById: (id: string) => of(portfolioFixtures.find(({ id: portfolioId }) => portfolioId === id)),
};

describe('PortfolioList', () => {
  it('should render each portfolio through its card', async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioList],
      providers: [
        provideRouter([]),
        { provide: PortfolioService, useValue: portfolioServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PortfolioList);
    fixture.detectChanges();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('app-portfolio-card article'),
      ).toHaveLength(3);
    }, { timeout: 2000 });

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('app-portfolio-card article');

    expect(cards).toHaveLength(3);
    expect(cards[0]?.textContent).toContain('Portfolio Europe');
    expect(cards[0]?.textContent).toContain('Identifiant : p1');
    expect(cards[0]?.textContent).toContain(
      'Diversified investments across European markets.',
    );
    expect(cards[0]?.textContent).toContain("Nombre d'actifs : 24");
    expect(cards[0]?.textContent).toContain('Valeur actuelle : 1250000');
  });

  it('should pass the selected portfolio ID to the parent when details are requested', async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioList],
      providers: [
        provideRouter([]),
        { provide: PortfolioService, useValue: portfolioServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PortfolioList);
    fixture.detectChanges();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('app-portfolio-card button'),
      ).toBeTruthy();
    }, { timeout: 2000 });

    const onViewDetails = vi
      .spyOn(fixture.componentInstance, 'onViewDetails')
      .mockImplementation(() => undefined);
    const viewDetailsButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('app-portfolio-card button');

    expect(viewDetailsButton?.textContent).toContain('Voir le détail');
    viewDetailsButton?.click();

    expect(onViewDetails).toHaveBeenCalledOnce();
    expect(onViewDetails).toHaveBeenCalledWith('p1');
  });
});