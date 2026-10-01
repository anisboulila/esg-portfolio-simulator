import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EsgScorePresentationDirective } from './esg-score-presentation.directive';

@Component({
  imports: [EsgScorePresentationDirective],
  template: `
    <div [esgScorePresentation]="presentation()">76.30</div>
  `,
})
class EsgScorePresentationHost {
  readonly presentation = signal<'official' | 'indicator'>('indicator');
}

// Le host rend la directive dans une vraie vue; TestBed/Fixture permettent de tester
// le résultat des bindings sans appeler les détails d'implémentation de la directive.
describe('EsgScorePresentationDirective', () => {
  it('should apply the class for the supplied presentation level', async () => {
    await TestBed.configureTestingModule({
      imports: [EsgScorePresentationHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(EsgScorePresentationHost);
    fixture.detectChanges();

    // nativeElement ouvre le DOM rendu; les classes sont le contrat de présentation observable.
    const score = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(score?.classList.contains('esg-score-presentation--indicator')).toBe(true);
    expect(score?.classList.contains('esg-score-presentation--official')).toBe(false);
  });

  it('should update its presentation class when the input changes', async () => {
    await TestBed.configureTestingModule({
      imports: [EsgScorePresentationHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(EsgScorePresentationHost);
    fixture.detectChanges();

    // Ici le Signal du host change comme une nouvelle valeur d'input; detectChanges met
    // à jour la vue avant qu'on vérifie les classes effectivement affichées.
    fixture.componentInstance.presentation.set('official');
    fixture.detectChanges();

    const score = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(score?.classList.contains('esg-score-presentation--official')).toBe(true);
    expect(score?.classList.contains('esg-score-presentation--indicator')).toBe(false);
  });
});