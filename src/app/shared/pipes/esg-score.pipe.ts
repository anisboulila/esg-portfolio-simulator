import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'esgScore',
})
export class EsgScorePipe implements PipeTransform {
  // Cette pipe transforme uniquement le nombre reçu en texte à deux décimales.
  // Elle ne calcule ni ne modifie le score officiel fourni par le backend.
  transform(score: number): string {
    return score.toFixed(2);
  }
}