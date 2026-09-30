import { Component, input } from '@angular/core';
import { SimulationResult } from '../../models/simulation-result';

@Component({
  selector: 'app-simulation-context',
  templateUrl: './simulation-context.html',
})
export class SimulationContext {
  // Le composant affiche uniquement des métadonnées déjà renvoyées par le backend.
  // Il n'infère ni ne recalcule de règle ESG, et son input requis le rend autonome.
  readonly result = input.required<SimulationResult>();
}