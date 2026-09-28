import { TestBed } from '@angular/core/testing';
import { PortfolioList } from './portfolio-list';

describe('PortfolioList', () => {
  it('should render each portfolio through its card', async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioList],
    }).compileComponents();

    const fixture = TestBed.createComponent(PortfolioList);
    fixture.detectChanges();

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
});