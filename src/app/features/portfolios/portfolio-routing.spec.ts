import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { App } from '../../app';
import { routes } from '../../app.routes';
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

// La suite teste les URLs et le contenu rendu lors d'une vraie navigation Angular,
// plutôt que d'appeler directement les méthodes internes du Router ou des pages.
describe('Portfolio routing', () => {
  beforeEach(async () => {
    // TestBed assemble App et Router; useValue fournit un service déterministe pour
    // que la navigation reste indépendante du serveur Portfolio.
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        // Le provider useValue isole les tests de routing du serveur HTTP Portfolio.
        {
          provide: PortfolioService,
          useValue: {
            getPortfolios: () => of(portfolioFixtures),
            getPortfolioById: (id: string) =>
              of(portfolioFixtures.find((portfolio) => portfolio.id === id)),
          },
        },
      ],
    }).compileComponents();
  });

  async function createAppAt(url: string) {
    // Une ComponentFixture crée le shell et contrôle sa vue. La première détection
    // installe les bindings avant la navigation; whenStable attend les tâches Router.
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();

    if (url === '/portfolios') {
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(
          (fixture.nativeElement as HTMLElement).querySelector('app-portfolio-card button'),
        ).toBeTruthy();
      }, { timeout: 2000 });
    }

    return { fixture, router };
  }

  it('should navigate from the dashboard to the lazy-loaded portfolio list', async () => {
    const { fixture, router } = await createAppAt('/');
    // querySelector récupère le lien réellement rendu; click déclenche le même événement
    // DOM que l'action attendue d'un utilisateur sur ce lien.
    const portfolioLink = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLAnchorElement>('nav a[routerLink="/portfolios"]');

    portfolioLink?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    // L'URL et le titre sont des effets observables de navigation, pas des détails privés.
    expect(router.url).toBe('/portfolios');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent,
    ).toContain('Portfolios');
  });

  it('should navigate from a portfolio card to that portfolio detail', async () => {
    const { fixture, router } = await createAppAt('/portfolios');
    const viewDetailsButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('app-portfolio-card button');

    viewDetailsButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/portfolios/p1');
    const detail = (fixture.nativeElement as HTMLElement).querySelector(
      'app-portfolio-detail',
    );
    expect(detail?.textContent).toContain('Portfolio Europe');
    expect(detail?.textContent).toContain('1250000');
  });

  it('should display the portfolio identified by the route parameter', async () => {
    const { fixture } = await createAppAt('/portfolios/p2');
    const detail = (fixture.nativeElement as HTMLElement).querySelector(
      'app-portfolio-detail',
    );

    expect(detail?.querySelector('h1')?.textContent).toContain('Portfolio Green');
    expect(detail?.textContent).toContain('p2');
    expect(detail?.textContent).toContain(
      'Investments focused on renewable energy and sustainability.',
    );
    expect(detail?.textContent).toContain('18');
    expect(detail?.textContent).toContain('875000');
    expect(
      detail?.querySelector('a[routerLink="/portfolios"]')?.textContent,
    ).toContain('Retour à la liste');
  });

  it('should show a not-found state for an unknown portfolio ID', async () => {
    const { fixture } = await createAppAt('/portfolios/unknown');
    const detail = (fixture.nativeElement as HTMLElement).querySelector(
      'app-portfolio-detail',
    );

    expect(detail?.querySelector('h1')?.textContent).toContain(
      'Portfolio introuvable',
    );
    expect(detail?.querySelector('[role="status"]')?.textContent).toContain(
      "Le portfolio demandé n'existe pas.",
    );
  });
});