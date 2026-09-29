import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SimulationRequest } from '../../../simulations/models/simulation-request';
import { SimulationApiService } from '../../../simulations/services/simulation-api.service';

type SimulationFormControls = {
  portfolioId: FormControl<string>;
  carbonEmission: FormControl<number | null>;
  greenInvestmentPercentage: FormControl<number | null>;
  socialScore: FormControl<number | null>;
  governanceScore: FormControl<number | null>;
};

@Component({
  selector: 'app-esg-simulation-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './esg-simulation-form.html',
  styleUrl: './esg-simulation-form.css',
})
export class EsgSimulationForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  // Le composant injecte le service pour orchestrer l'action; il ne construit pas
  // d'URL et ne fait aucun appel HTTP directement.
  private readonly simulationApi = inject(SimulationApiService);
  protected readonly portfolioId = this.route.snapshot.paramMap.get('id') ?? '';

  // FormGroup représente le formulaire global : il regroupe les contrôles et expose
  // leur validité commune. Cette page garde ainsi toute la saisie au même endroit.
  // Les règles numériques documentées sont exprimables avec required, min et max;
  // les validators intégrés évitent d'ajouter une fonction maison inutile.
  protected readonly simulationForm = new FormGroup<SimulationFormControls>({
    // FormControl représente la valeur et l'état d'un champ précis. L'identifiant
    // vient de la route, reste visible mais non modifiable, et demeure requis. required
      // seul accepte les espaces; pattern impose un caractère non blanc.
    portfolioId: new FormControl(this.portfolioId, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    carbonEmission: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    greenInvestmentPercentage: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    socialScore: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    governanceScore: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
  });

  protected submissionAttempted = false;
  protected readonly submissionStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly submissionError = signal<string | null>(null);

  // La valeur est la donnée saisie; valid/invalid indique si elle respecte les règles.
  // touched passe à vrai après interaction puis perte de focus, tandis que dirty indique
  // que la valeur a changé. On n'affiche l'erreur qu'après interaction ou tentative d'envoi.
  // Les validators expriment les contraintes documentées près des contrôles. Angular
  // recalcule valid/invalid à chaque changement, sans mélanger la valeur du champ avec
  // son interaction (touched) ou son édition (dirty).
  protected showError(control: FormControl<string | number | null>): boolean {
    return control.invalid && (control.touched || this.submissionAttempted);
  }

  protected errorMessage(control: FormControl<string | number | null>): string {
    if (control.hasError('required')) {
      return 'Ce champ est obligatoire.';
    }
    if (control.hasError('pattern')) {
      return 'Saisissez un identifiant contenant au moins un caractère non blanc.';
    }
    if (control.hasError('min')) {
      return 'La valeur doit être supérieure ou égale à 0.';
    }
    if (control.hasError('max')) {
      return 'La valeur doit être inférieure ou égale à 100.';
    }
    return 'Vérifiez la valeur saisie.';
  }

  // La soumission commence par vérifier le FormGroup entier. En cas d'invalidité,
  // markAllAsTouched() rend les erreurs visibles et aucun appel API n'est lancé.
  onSubmit(): void {
    this.submissionAttempted = true;
    this.submissionError.set(null);

    if (this.simulationForm.invalid) {
      this.simulationForm.markAllAsTouched();
      this.submissionStatus.set('idle');
      return;
    }

    const values = this.simulationForm.getRawValue();

    // Les validators requis garantissent normalement des nombres, mais TypeScript ne
    // déduit pas cette garantie depuis l'état runtime du formulaire : ce garde-fou
    // protège le contrat typé avant de préparer les données, sans appel HTTP.
    if (
      values.carbonEmission === null ||
      values.greenInvestmentPercentage === null ||
      values.socialScore === null ||
      values.governanceScore === null
    ) {
      return;
    }

    const request: SimulationRequest = {
      portfolioId: values.portfolioId,
      carbonEmission: values.carbonEmission,
      greenInvestmentPercentage: values.greenInvestmentPercentage,
      socialScore: values.socialScore,
      governanceScore: values.governanceScore,
    };

    // L'Observable ne lance l'opération que lorsqu'on s'y abonne. HttpClient et le
    // mock contrôlé terminent chacun ce flux par une réponse ou une erreur.
    this.submissionStatus.set('loading');
    this.simulationApi.createSimulation(request).subscribe({
      next: (result) => {
        // L'identifiant retourné par l'API permet au Router d'ouvrir la page de résultat.
        // La page chargera ensuite le même résultat par GET, y compris après un refresh.
        void this.router.navigate(['/simulations', result.id]);
      },
      error: () => {
        // Ne jamais transmettre l'erreur réseau brute au template : elle peut contenir
        // des détails techniques. La page n'expose qu'un message compréhensible.
        this.submissionError.set('La simulation n’a pas pu être envoyée. Veuillez réessayer.');
        this.submissionStatus.set('error');
      },
    });
  }
}