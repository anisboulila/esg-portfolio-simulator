import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
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
  // Cette valeur volontairement différente du score pondéré des indicateurs permet
  // de prouver que la page affiche la réponse backend, sans recalcul frontend.
  globalScore: 82.35,
  greenInvestmentPercentage: 35,
};

// Le faux API service isole l'écran du transport; ce test vérifie ce qu'un utilisateur
// voit et conserve le déclenchement manuel du bloc @defer fourni par Angular 22.
describe('SimulationResultPage', () => {
  it('renders the official result immediately and secondary context on defer completion', async () => {
    // TestBed configure la route, le Router et useValue pour contrôler la réponse
    // SimulationResult sans remplacer le composant testé.
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

    // La fixture relie SimulationResultPage à son DOM; detectChanges puis whenStable
    // attendent le rendu du résultat asynchrone fourni par le faux service.
    const fixture = TestBed.createComponent(SimulationResultPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Le score rendu doit correspondre exactement à la donnée backend 82.35; cette
    // valeur diffère du calcul pondéré local, donc l'assertion détecte tout recalcul.
    const initialContent = fixture.nativeElement as HTMLElement;
    expect(initialContent.textContent).toContain('Score ESG global officiel');
    expect(initialContent.querySelector('.official-score p')?.textContent?.trim()).toBe('82.35');
    expect(initialContent.querySelector('app-simulation-context')).toBeNull();
    expect(initialContent.textContent).toContain('détails complémentaires');

    // getDeferBlocks expose l'outil de test Angular pour choisir explicitement l'état
    // terminal; cette commande n'est pas une interaction utilisateur de production.
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