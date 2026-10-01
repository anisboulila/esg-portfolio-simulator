import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { SimulationRequest } from '../../../simulations/models/simulation-request';
import { SimulationResult } from '../../../simulations/models/simulation-result';
import { SimulationApiService } from '../../../simulations/services/simulation-api.service';
import { EsgSimulationForm } from './esg-simulation-form';

const simulationResult: SimulationResult = {
  id: 'simulation-1',
  portfolio: {
    id: 'p1',
    name: 'Portfolio Europe',
    description: 'Diversified investments across European markets.',
    assetCount: 24,
    currentValue: 1250000,
  },
  environmentalScore: 72,
  socialScore: 81,
  governanceScore: 76,
  globalScore: 76.3,
  greenInvestmentPercentage: 35,
};

async function createFormFixture(portfolioId = 'p1') {
  const createSimulation = vi.fn((_request: SimulationRequest) => of(simulationResult));

  await TestBed.configureTestingModule({
    imports: [EsgSimulationForm],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: (name: string) => name === 'id' ? portfolioId : null },
          },
        },
      },
      {
        provide: SimulationApiService,
        useValue: { createSimulation },
      },
    ],
  }).compileComponents();

  // ComponentFixture relie la vraie page Angular à son DOM de test; le service HTTP
  // est remplacé par un faux observable afin que le test reste local et déterministe.
  const fixture = TestBed.createComponent(EsgSimulationForm);
  fixture.detectChanges();

  return {
    fixture,
    createSimulation,
    router: TestBed.inject(Router),
  };
}

function enterValue(element: HTMLElement, controlId: string, value: string): void {
  const input = element.querySelector<HTMLInputElement>(`#${controlId}`);
  if (!input) {
    throw new Error(`Expected form control #${controlId} to exist.`);
  }

  // Affecter la valeur puis émettre l'événement input reproduit la saisie vue par
  // Reactive Forms, sans lire ni modifier directement l'état interne du FormGroup.
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('EsgSimulationForm', () => {
  it('presents the main labeled fields and a submit action', async () => {
    const { fixture } = await createFormFixture();
    const element = fixture.nativeElement as HTMLElement;
    const requiredLabels = [
      'Identifiant du portfolio',
      'Émissions de carbone',
      'Investissement vert (%)',
      'Score social',
      'Score de gouvernance',
    ];

    for (const labelText of requiredLabels) {
      const label = Array.from(element.querySelectorAll('label')).find(
        (candidate) => candidate.textContent?.trim() === labelText,
      );

      expect(label).toBeTruthy();
      expect(element.querySelector(`#${label?.htmlFor}`)).toBeTruthy();
    }
    expect(element.querySelector('button[type="submit"]')?.textContent).toContain(
      'Envoyer la simulation',
    );
  });

  it('shows required-field validation and does not submit an empty form', async () => {
    const { fixture, createSimulation } = await createFormFixture();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    fixture.detectChanges();

    // Les assertions portent sur les messages et attributs accessibles rendus,
    // et vérifient que l'action invalide n'atteint pas le service de simulation.
    expect(element.querySelectorAll('[role="alert"]')).toHaveLength(4);
    expect(element.textContent).toContain('Ce champ est obligatoire.');
    expect(element.querySelector('#carbonEmission')?.getAttribute('aria-invalid')).toBe('true');
    expect(createSimulation).not.toHaveBeenCalled();
  });

  it('requires a portfolio ID from the route before submitting', async () => {
    const { fixture, createSimulation } = await createFormFixture('');
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    fixture.detectChanges();

    expect(element.querySelector('#portfolioId')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#portfolioId-error')?.textContent).toContain(
      'Ce champ est obligatoire.',
    );
    expect(createSimulation).not.toHaveBeenCalled();
  });

  it('shows range validation for out-of-range values and blocks submission', async () => {
    const { fixture, createSimulation } = await createFormFixture();
    const element = fixture.nativeElement as HTMLElement;

    enterValue(element, 'carbonEmission', '-1');
    enterValue(element, 'greenInvestmentPercentage', '101');
    enterValue(element, 'socialScore', '81');
    enterValue(element, 'governanceScore', '76');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('La valeur doit être supérieure ou égale à 0.');
    expect(element.textContent).toContain('La valeur doit être inférieure ou égale à 100.');
    expect(createSimulation).not.toHaveBeenCalled();
  });

  it('submits valid user-entered values and navigates after the response', async () => {
    const { fixture, createSimulation, router } = await createFormFixture();
    const pendingResult = new Subject<SimulationResult>();
    createSimulation.mockReturnValue(pendingResult.asObservable());

    enterValue(fixture.nativeElement as HTMLElement, 'carbonEmission', '100');
    enterValue(fixture.nativeElement as HTMLElement, 'greenInvestmentPercentage', '35');
    enterValue(fixture.nativeElement as HTMLElement, 'socialScore', '81');
    enterValue(fixture.nativeElement as HTMLElement, 'governanceScore', '76');

    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const submitButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    submitButton?.click();
    fixture.detectChanges();

    expect(createSimulation).toHaveBeenCalledWith({
      portfolioId: 'p1',
      carbonEmission: 100,
      greenInvestmentPercentage: 35,
      socialScore: 81,
      governanceScore: 76,
    });
    expect(submitButton?.disabled).toBe(true);

    pendingResult.next(simulationResult);
    pendingResult.complete();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/simulations', 'simulation-1']);
  });
});