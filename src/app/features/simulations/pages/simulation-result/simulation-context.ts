import { Component, input } from '@angular/core';
import { SimulationResult } from '../../models/simulation-result';

// SIMULATION TEMPORAIRE POUR L'APPRENTISSAGE : Angular compile ce composant comme
// une dépendance importée par le bloc @defer. Cette attente au niveau du module
// retarde la résolution du vrai import() dynamique, donc Angular reste en état
// @loading avant que le composant puisse être créé. Ce n'est pas un délai métier
// ni un délai autour de son affichage interne; retirer ce bloc après la démonstration.
await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 2_000));

@Component({
  selector: 'app-simulation-context',
  templateUrl: './simulation-context.html',
})
export class SimulationContext {
  // Le composant affiche uniquement des métadonnées déjà renvoyées par le backend.
  // Il n'infère ni ne recalcule de règle ESG, et son input requis le rend autonome.
  readonly result = input.required<SimulationResult>();
}