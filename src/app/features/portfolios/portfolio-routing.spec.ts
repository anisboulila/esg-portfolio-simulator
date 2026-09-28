import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { routes } from '../../app.routes';

describe('Portfolio routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  async function createAppAt(url: string) {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, router };
  }

  it('should navigate from the dashboard to the portfolio list', async () => {
    const { fixture, router } = await createAppAt('/');
    const portfolioLink = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLAnchorElement>('nav a[routerLink="/portfolios"]');

    portfolioLink?.click();
    await fixture.whenStable();
    fixture.detectChanges();

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
    expect(detail?.querySelector('a')?.getAttribute('routerLink')).toBe(
      '/portfolios',
    );
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