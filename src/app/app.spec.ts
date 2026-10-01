import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { PortfolioService } from './features/portfolios/services/portfolio.service';

const portfolioFixture = {
  id: 'p1',
  name: 'Portfolio Europe',
  description: 'Europe',
  assetCount: 24,
  currentValue: 1250000,
};

// describe regroupe les comportements du shell; chaque test démarre avec un TestBed
// neuf afin que Router et les providers ne partagent pas d'état entre les scénarios.
describe('App', () => {
  beforeEach(async () => {
    // TestBed prépare l'injecteur Angular du test. providers permet ici de fournir le
    // Router requis par le shell et useValue remplace le service réseau par une fixture.
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        // useValue fournit un faux PortfolioService à l'injecteur de test, sans remplacer
        // le provider de production ni déclencher les vrais appels HTTP.
        {
          provide: PortfolioService,
          useValue: {
            getPortfolios: () => of([portfolioFixture]),
            getPortfolioById: () => of(portfolioFixture),
          },
        },
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    // createComponent construit le composant et sa vue de test; componentInstance est
    // l'objet TypeScript, ce qui permet ici de vérifier simplement qu'il a été créé.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // whenStable attend les tâches Angular en cours, comme l'initialisation du Router;
    // nativeElement donne ensuite la racine DOM dont le test vérifie la structure réelle.
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')).toBeTruthy();
    expect(compiled.querySelector('nav[aria-label="Navigation principale"]')).toBeTruthy();
    expect(compiled.querySelector('main router-outlet')).toBeTruthy();
    expect(compiled.querySelector('footer')).toBeTruthy();
  });
});
