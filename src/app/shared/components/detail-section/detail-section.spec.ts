import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DetailSection } from './detail-section';

@Component({
  imports: [DetailSection],
  template: `
    <app-detail-section title="Informations">
      <p class="portfolio-name">Portfolio Europe</p>
    </app-detail-section>
    <app-detail-section title="Indicateurs ESG">
      <dl>
        <dt>Score social</dt>
        <dd>82</dd>
      </dl>
    </app-detail-section>
  `,
})
class DetailSectionTestHost {}

// Un composant hôte fournit ici le contenu projeté comme le ferait un parent réel.
describe('DetailSection', () => {
  it('should render its title and caller-provided content', async () => {
    // TestBed importe le host standalone et son enfant; compileComponents prépare
    // les templates utilisés dans ce test.
    await TestBed.configureTestingModule({
      imports: [DetailSectionTestHost],
    }).compileComponents();

    // La fixture contient le host et l'ensemble des enfants rendus par son template.
    const fixture = TestBed.createComponent(DetailSectionTestHost);
    fixture.detectChanges();

    // Les requêtes DOM valident les titres et la projection visible, pas l'implémentation
    // interne du composant DetailSection.
    const sections = (
      fixture.nativeElement as HTMLElement
    ).querySelectorAll('app-detail-section');

    expect(sections).toHaveLength(2);
    expect(sections[0]?.querySelector('h2')?.textContent).toContain('Informations');
    expect(sections[0]?.querySelector('.portfolio-name')?.textContent).toContain(
      'Portfolio Europe',
    );
    expect(sections[1]?.querySelector('h2')?.textContent).toContain(
      'Indicateurs ESG',
    );
    expect(sections[1]?.querySelector('dt')?.textContent).toContain('Score social');
    expect(sections[1]?.querySelector('dd')?.textContent).toContain('82');
  });
});