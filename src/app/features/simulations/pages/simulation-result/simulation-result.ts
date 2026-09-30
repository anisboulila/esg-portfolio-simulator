import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  SimulationApiService,
  SimulationNotFoundError,
} from '../../services/simulation-api.service';
import { SimulationResult } from '../../models/simulation-result';
import { EsgScorePresentationDirective } from '../../../../shared/directives/esg-score-presentation.directive';
import { EsgScorePipe } from '../../../../shared/pipes/esg-score.pipe';

type SimulationResultState =
  | { status: 'loading' }
  | { status: 'success'; result: SimulationResult }
  | { status: 'not-found' }
  | { status: 'error' };

@Component({
  selector: 'app-simulation-result',
  imports: [RouterLink, EsgScorePipe, EsgScorePresentationDirective],
  templateUrl: './simulation-result.html',
  styleUrl: './simulation-result.css',
})
export class SimulationResultPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly simulationApi = inject(SimulationApiService);

  // Le Signal contient un seul état d'écran à la fois. Le template peut donc rendre
  // loading, succès, absence ou erreur sans mélanger plusieurs booléens indépendants.
  protected readonly resultState = signal<SimulationResultState>({ status: 'loading' });

  // Lire l'id depuis la route rend le GET compatible avec une navigation directe et
  // un refresh : l'écran recharge alors le résultat officiel auprès de l'API.
  ngOnInit(): void {
    const simulationId = this.route.snapshot.paramMap.get('id');

    if (!simulationId) {
      this.resultState.set({ status: 'not-found' });
      return;
    }

    this.simulationApi.getSimulation(simulationId).subscribe({
      next: (result) => this.resultState.set({ status: 'success', result }),
      error: (error: unknown) => {
        this.resultState.set(
          error instanceof SimulationNotFoundError
            ? { status: 'not-found' }
            : { status: 'error' },
        );
      },
    });
  }
}