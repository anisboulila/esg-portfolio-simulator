import { Directive, input } from '@angular/core';

export type EsgScorePresentation = 'official' | 'indicator';

@Directive({
  selector: '[esgScorePresentation]',
  host: {
    '[class.esg-score-presentation]': 'true',
    '[class.esg-score-presentation--official]':
      "esgScorePresentation() === 'official'",
    '[class.esg-score-presentation--indicator]':
      "esgScorePresentation() === 'indicator'",
  },
})
export class EsgScorePresentationDirective {
  // L'input décrit le rôle visuel choisi par le template, pas un niveau calculé
  // depuis le score : la directive ajoute les classes correspondantes à son hôte.
  readonly esgScorePresentation = input.required<EsgScorePresentation>();
}