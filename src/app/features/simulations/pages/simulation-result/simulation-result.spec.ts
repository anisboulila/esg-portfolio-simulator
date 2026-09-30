import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { DeferBlockBehavior, DeferBlockState } from '@angular/core/testing';
import { of } from 'rxjs';
import { SimulationResult } from '../../models/simulation-result';
import { SimulationApiService } from '../../services/simulation-api.service';
import { SimulationResultPage } from './simulation-result';

const simulationResult: SimulationResult = {
  id: 'simulation-1',
  portfolio: {
    id: 'portfolio-1',
    name: 'Portfolio Green',
    description: 'Renewable energy investments.',
    assetCount: 18,
    currentValue: 875000,
  },
  environmentalScore: 70,
  socialScore: 82,
  governanceScore: 91,
  globalScore: 79.9,
  greenInvestmentPercentage: 35,
};

describe('SimulationResultPage', () => {
  it('renders the official result immediately and secondary context on defer completion', async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationResultPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => simulationResult.id } } },
        },
        {
          provide: SimulationApiService,
          useValue: { getSimulation: () => of(simulationResult) },
        },
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();

    const fixture = TestBed.createComponent(SimulationResultPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const initialContent = fixture.nativeElement as HTMLElement;
    expect(initialContent.textContent).toContain('Score ESG global officiel');
    expect(initialContent.querySelector('app-simulation-context')).toBeNull();
    expect(initialContent.textContent).toContain('détails complémentaires');

    const [deferBlock] = await fixture.getDeferBlocks();
    expect(deferBlock).toBeDefined();
    await deferBlock?.render(DeferBlockState.Complete);
    fixture.detectChanges();

    const completeContent = fixture.nativeElement as HTMLElement;
    expect(completeContent.querySelector('app-simulation-context')?.textContent).toContain(
      'simulation-1',
    );
    expect(completeContent.querySelector('app-simulation-context')?.textContent).toContain(
      '35',
    );
  });
});