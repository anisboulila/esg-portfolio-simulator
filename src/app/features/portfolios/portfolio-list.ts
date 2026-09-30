import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  map,
  of,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { PortfolioCard } from './components/portfolio-card/portfolio-card';
import { Portfolio } from './models/portfolio';
import { PortfolioService } from './services/portfolio.service';

// Ces variantes représentent des états mutuellement exclusifs : une recherche ne peut
// pas être simultanément en chargement, en erreur et vide. Un seul statut évite les
// combinaisons incohérentes que plusieurs booléens indépendants pourraient autoriser.
type PortfolioSearchState =
  | { status: 'loading'; portfolios: readonly Portfolio[] }
  | { status: 'success'; portfolios: readonly Portfolio[] }
  | { status: 'empty'; portfolios: readonly Portfolio[] }
  | { status: 'error'; portfolios: readonly Portfolio[]; message: string };

type PortfolioDataState =
  | { status: 'loading' }
  | { status: 'success'; portfolios: readonly Portfolio[] }
  | { status: 'error' };

@Component({
  selector: 'app-portfolio-list',
  imports: [PortfolioCard],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.css',
})
export class PortfolioList {
  // inject() demande au conteneur DI Angular le service partagé d'accès aux données.
  // La page garde la présentation et les interactions; le service reste propriétaire des portfolios.
  private readonly portfolioService = inject(PortfolioService);
  private readonly router = inject(Router);

  // Le terme de recherche est un état modifiable de l'interface : le signal permet
  // à Angular d'en suivre les changements. Lire searchTerm() enregistre ses consommateurs.
  protected readonly searchTerm = signal('');

  // Le GET de la collection est lancé une seule fois par cette page. Le Signal conserve
  // son état de chargement/réussite/échec et permet au computed de lire les données reçues.
  private readonly portfolioData = toSignal(
    this.portfolioService.getPortfolios().pipe(
      map((portfolios) => ({ status: 'success' as const, portfolios })),
      startWith({ status: 'loading' as const }),
      catchError(() => of({ status: 'error' as const })),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  private readonly debouncedSearchTerm = toSignal(
    toObservable(this.searchTerm).pipe(debounceTime(300)),
    { initialValue: '' },
  );

  // La liste filtrée dépend de la collection du service et du terme de recherche.
  // computed() évite de stocker une deuxième liste qu'il faudrait synchroniser à la main.
  // Angular suit le signal lu ici et recalcule cette valeur quand le terme change.
  protected readonly filteredPortfolios = computed(() => {
    const dataState = this.portfolioData();
    if (dataState.status !== 'success') {
      return [];
    }

    return this.filterPortfolios(dataState.portfolios, this.debouncedSearchTerm());
  });

  // RxJS coordonne les changements du terme stabilisé et l'arrivée HTTP de la liste.
  // Le timer préserve le flux pédagogique de TASK-013; switchMap annule le timer obsolète.
  private readonly searchState$ = combineLatest([
    toObservable(this.debouncedSearchTerm),
    toObservable(this.portfolioData),
  ]).pipe(
    switchMap(() => {
      const dataState = this.portfolioData();

      if (dataState.status === 'loading') {
        return of({ status: 'loading' as const, portfolios: [] as readonly Portfolio[] });
      }
      if (dataState.status === 'error') {
        return of({
          status: 'error' as const,
          portfolios: [] as readonly Portfolio[],
          message: 'Les portfolios n’ont pas pu être chargés. Veuillez réessayer.',
        });
      }

      return timer(250).pipe(
        map(() => {
          const portfolios = this.filteredPortfolios();
          return portfolios.length > 0
            ? { status: 'success' as const, portfolios }
            : { status: 'empty' as const, portfolios };
        }),
        startWith({ status: 'loading' as const, portfolios: [] as readonly Portfolio[] }),
        catchError(() =>
          of({
            status: 'error' as const,
            portfolios: [] as readonly Portfolio[],
            message: 'La recherche est momentanément indisponible.',
          }),
        ),
      );
    }),
  );

  // toSignal() relie le flux RxJS au modèle de rendu Angular : le template lit l'état
  // courant avec searchState(), puis @if choisit une seule présentation selon status.
  // RxJS garde la responsabilité du flux et de son annulation; le Signal expose son état.
  protected readonly searchState = toSignal(this.searchState$, {
    initialValue: {
      status: 'loading' as const,
      portfolios: [] as readonly Portfolio[],
    },
  });

  // L'événement natif fournit le texte; set() met à jour le signal source.
  // Angular invalide alors filteredPortfolios et publie le changement dans l'Observable.
  onSearchInput(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.searchTerm.set(target.value);
    }
  }

  private filterPortfolios(
    portfolios: readonly Portfolio[],
    searchTerm: string,
  ): readonly Portfolio[] {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return normalizedSearchTerm
      ? portfolios.filter((portfolio) =>
          portfolio.name.toLowerCase().includes(normalizedSearchTerm),
        )
      : portfolios;
  }

  // Le binding de l'output transmet seulement l'ID à ce parent. PortfolioList peut
  // naviguer sans conserver ni manipuler directement l'instance PortfolioCard.
  onViewDetails(portfolioId: string): void {
    void this.router.navigate(['/portfolios', portfolioId]);
  }
}