import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, of, startWith, switchMap, timer } from 'rxjs';
import { PortfolioCard } from './components/portfolio-card/portfolio-card';
import { Portfolio } from './models/portfolio';
import { PortfolioService } from './services/portfolio.service';

type PortfolioSearchState =
  | { status: 'loading'; portfolios: readonly Portfolio[] }
  | { status: 'success'; portfolios: readonly Portfolio[] }
  | { status: 'empty'; portfolios: readonly Portfolio[] }
  | { status: 'error'; portfolios: readonly Portfolio[]; message: string };

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
  protected readonly portfolios = this.portfolioService.getPortfolios();

  // Le terme de recherche est un état modifiable de l'interface : le signal permet
  // à Angular d'en suivre les changements. Lire searchTerm() enregistre ses consommateurs.
  protected readonly searchTerm = signal('');

  // La liste filtrée dépend de la collection du service et du terme de recherche.
  // computed() évite de stocker une deuxième liste qu'il faudrait synchroniser à la main.
  // Angular suit le signal lu ici et recalcule cette valeur quand le terme change.
  protected readonly filteredPortfolios = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return this.portfolios;
    }

    return this.portfolios.filter((portfolio) =>
      portfolio.name.toLowerCase().includes(normalizedSearchTerm),
    );
  });

  // toObservable() adapte le signal en Observable : RxJS peut alors traiter chaque
  // changement comme un événement dans un flux, plutôt que comme un état instantané.
  private readonly searchState$ = toObservable(this.searchTerm).pipe(
    // debounceTime attend une pause de saisie avant de lancer le travail asynchrone.
    // Cela évite de démarrer une recherche simulée pour chaque caractère tapé.
    debounceTime(300),
    // Cette source locale n'a pas encore de backend : timer() simule simplement une
    // courte latence asynchrone, tout en laissant les portfolios dans leur service.
    switchMap(() =>
      timer(250).pipe(
        map(() => {
          const portfolios = this.filteredPortfolios();

          return portfolios.length > 0
            ? { status: 'success' as const, portfolios }
            : { status: 'empty' as const, portfolios };
        }),
        // switchMap désabonne le timer précédent dès qu'un nouveau terme débouncé arrive.
        // Ainsi, un ancien résultat en attente ne peut pas remplacer celui de la saisie récente.
        startWith({ status: 'loading' as const, portfolios: [] as readonly Portfolio[] }),
        // L'erreur est convertie en état de présentation et le flux reste disponible
        // pour les prochaines saisies, sans exposer de détail technique au template.
        catchError(() =>
          of({
            status: 'error' as const,
            portfolios: [] as readonly Portfolio[],
            message: 'La recherche est momentanément indisponible.',
          }),
        ),
      ),
    ),
  );

  // toSignal() relie le flux RxJS au modèle de rendu Angular : le template lit un
  // instantané réactif avec searchState(), tandis que debounce et cancellation restent
  // gérés par RxJS. L'état initial évite une valeur absente avant la première émission.
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

  onViewDetails(portfolioId: string): void {
    void this.router.navigate(['/portfolios', portfolioId]);
  }
}