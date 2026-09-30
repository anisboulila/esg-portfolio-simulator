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

describe('EsgScorePresentationDirective', () => {
  it('should apply the class for the supplied presentation level', async () => {
    await TestBed.configureTestingModule({
      imports: [EsgScorePresentationHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(EsgScorePresentationHost);
    fixture.detectChanges();

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

    fixture.componentInstance.presentation.set('official');
    fixture.detectChanges();

    const score = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(score?.classList.contains('esg-score-presentation--official')).toBe(true);
    expect(score?.classList.contains('esg-score-presentation--indicator')).toBe(false);
  });
});