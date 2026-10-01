import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { PortfolioList } from './portfolio-list';
import { Portfolio } from './models/portfolio';
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

async function createPortfolioListFixture(
  portfolioService: Pick<PortfolioService, 'getPortfolios'> = portfolioServiceStub,
) {
  await TestBed.configureTestingModule({
    imports: [PortfolioList],
    providers: [
      provideRouter([]),
      { provide: PortfolioService, useValue: portfolioService },
    ],
  }).compileComponents();

  // La fixture associe le composant réel à une vue Angular isolée; chaque test peut
  // fournir un Observable différent sans remplacer le comportement de production.
  const fixture = TestBed.createComponent(PortfolioList);
  fixture.detectChanges();
  return fixture;
}

// describe regroupe les comportements observables de cette page; TestBed configure
// Angular et le faux service empêche les tests de rendu d'appeler le serveur HTTP.
describe('PortfolioList', () => {
  it('should render each portfolio through its card', async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioList],
      providers: [
        provideRouter([]),
        { provide: PortfolioService, useValue: portfolioServiceStub },
      ],
    }).compileComponents();

    // createComponent retourne la ComponentFixture, puis detectChanges rend la première vue.
    const fixture = TestBed.createComponent(PortfolioList);
    fixture.detectChanges();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('app-portfolio-card article'),
      ).toHaveLength(3);
    }, { timeout: 2000 });

    // nativeElement est la racine DOM de la fixture; ces assertions contrôlent le contenu vu.
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

    // Le spy observe la réaction du parent; le clic ci-dessous part du bouton rendu,
    // ce qui teste le contrat utilisateur plutôt qu'un appel direct à la méthode.
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

  it('should show a loading message while portfolios are still being requested', async () => {
    const pendingPortfolios = new Subject<readonly Portfolio[]>();
    const fixture = await createPortfolioListFixture({
      getPortfolios: () => pendingPortfolios.asObservable(),
    });

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent,
    ).toContain('Recherche des portfolios...');
  });

  it('should show the empty state after the user searches for a non-matching name', async () => {
    const fixture = await createPortfolioListFixture();
    const element = fixture.nativeElement as HTMLElement;
    const search = element.querySelector<HTMLInputElement>('#portfolio-search');

    if (!search) {
      throw new Error('Expected the portfolio search input to exist.');
    }

    // L'événement input suit la même voie que la saisie utilisateur et laisse debounceTime
    // et le rendu Angular dérouler leur flux normal avant l'assertion sur le DOM.
    search.value = 'No matching portfolio';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(
        element.querySelector('[role="status"]')?.textContent,
      ).toContain('Aucun portfolio ne correspond à cette recherche.');
    }, { timeout: 2000 });
  });

  it('should show a user-friendly error when the portfolio request fails', async () => {
    const fixture = await createPortfolioListFixture({
      getPortfolios: () => throwError(() => new Error('Private transport details')),
    });

    await vi.waitFor(() => {
      fixture.detectChanges();
      const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
      expect(alert?.textContent).toContain(
        'Les portfolios n’ont pas pu être chargés. Veuillez réessayer.',
      );
      expect(alert?.textContent).not.toContain('Private transport details');
    }, { timeout: 2000 });
  });
});