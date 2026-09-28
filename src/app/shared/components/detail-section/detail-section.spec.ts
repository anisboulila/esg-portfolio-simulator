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

describe('DetailSection', () => {
  it('should render its title and caller-provided content', async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSectionTestHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailSectionTestHost);
    fixture.detectChanges();

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