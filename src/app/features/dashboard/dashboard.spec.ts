import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { PortfolioService } from '../portfolios/services/portfolio.service';

const portfolioFixtures = [
  { id: 'p1', name: 'Portfolio Europe', description: 'Europe', assetCount: 24, currentValue: 1250000 },
  { id: 'p2', name: 'Portfolio Green', description: 'Green', assetCount: 18, currentValue: 875000 },
  { id: 'p3', name: 'Portfolio Sustainable', description: 'Sustainable', assetCount: 31, currentValue: 1630000 },
];

// Cette suite teste le résultat visible du résumé plutôt que la forme de son Signal interne.
describe('Dashboard', () => {
  it('should render the computed portfolio summary', async () => {
    // Le provider de test substitue le service partagé; Dashboard reste réel, mais ses
    // données déterministes n'ont pas besoin du serveur HTTP pour vérifier le DOM.
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        // useValue remplace PortfolioService dans l'injecteur de test par un faux accès local.
        {
          provide: PortfolioService,
          useValue: { getPortfolios: () => of(portfolioFixtures) },
        },
      ],
    }).compileComponents();

    // createComponent retourne la fixture qui relie l'instance Dashboard à sa vue rendue.
    const fixture = TestBed.createComponent(Dashboard);
    // Angular applique les bindings et les états Signals avant les assertions DOM.
    fixture.detectChanges();

    // nativeElement est le DOM créé pour cette fixture; les assertions portent sur
    // les métriques réellement présentées à l'utilisateur.
    const summary = fixture.nativeElement as HTMLElement;
    expect(summary.querySelector('h1')?.textContent).toContain('Dashboard');
    const sections = summary.querySelectorAll('app-detail-section');
    expect(sections).toHaveLength(2);
    expect(sections[0]?.textContent).toContain('3');
    expect(sections[0]?.textContent).toContain('3755000');
    expect(sections[1]?.textContent).toContain('78 / 100');
  });
});