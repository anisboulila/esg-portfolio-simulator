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

describe('App', () => {
  beforeEach(async () => {
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
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')).toBeTruthy();
    expect(compiled.querySelector('nav')).toBeTruthy();
    expect(compiled.querySelector('main router-outlet')).toBeTruthy();
    expect(compiled.querySelector('footer')).toBeTruthy();
  });
});
