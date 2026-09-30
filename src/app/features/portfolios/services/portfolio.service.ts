import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { HttpTransportError } from '../../../core/errors/http-transport-error';
import { PortfolioApiService } from '../api/portfolio-api.service';
import { Portfolio } from '../models/portfolio';

// @Service() marque cette classe comme service et la rend automatiquement disponible
// au système DI Angular, conformément au décorateur de la version utilisée par le projet.
@Service()
export class PortfolioService {
  // inject() demande PortfolioApiService à l'injecteur Angular; le service ne construit
  // pas lui-même sa dépendance. La chaîne continue vers HttpClient et API_BASE_URL.
  private readonly portfolioApi = inject(PortfolioApiService);

  // Le cache appartient au service car Dashboard et PortfolioList partagent cette
  // instance DI. Le signal expose la donnée conservée, tandis que les composants
  // gardent leur propre état d'interface (chargement, erreur, filtre, etc.).
  // null signifie « jamais chargé ou invalidé »; [] reste une réponse valide et mise en cache.
  private readonly portfolioCacheState = signal<readonly Portfolio[] | null>(null);
  readonly cachedPortfolios = this.portfolioCacheState.asReadonly();

  // Un cache de données et une requête en cours sont deux choses différentes :
  // le premier sert les lectures futures, le second partage le même GET entre
  // plusieurs consommateurs qui arrivent avant sa réponse.
  private inFlightPortfolios: Observable<readonly Portfolio[]> | null = null;

  // Chaque invalidation crée une nouvelle génération. Une ancienne réponse qui
  // termine après un refresh ne peut ainsi pas remplacer les données plus récentes.
  private cacheGeneration = 0;

  // Première lecture : GET. Lectures ultérieures : valeur mémoire tant qu'elle n'a
  // pas été invalidée. Un cache en mémoire n'est pas une source de vérité métier;
  // le backend reste autoritaire et le consommateur peut demander un refresh.
  getPortfolios(): Observable<readonly Portfolio[]> {
    const cachedPortfolios = this.portfolioCacheState();
    if (cachedPortfolios !== null) {
      return of(cachedPortfolios);
    }

    if (this.inFlightPortfolios !== null) {
      return this.inFlightPortfolios;
    }

    return this.fetchPortfolios();
  }

  // Le refresh invalide la réponse précédente puis passe par le même chemin de
  // chargement partagé. Il force un nouveau GET même si un appel antérieur est
  // encore actif; les générations empêchent cet ancien appel d'écrire dans le cache.
  refreshPortfolios(): Observable<readonly Portfolio[]> {
    this.invalidatePortfolios();
    return this.getPortfolios();
  }

  // Les données ne doivent pas rester fraîches par hypothèse. Cette méthode permet
  // aussi aux futures opérations d'écriture de vider le cache après une mutation.
  // Les requêtes déjà abonnées peuvent finir, mais leur génération ne sera pas mémorisée.
  invalidatePortfolios(): void {
    this.cacheGeneration += 1;
    this.portfolioCacheState.set(null);
    this.inFlightPortfolios = null;
  }

  private fetchPortfolios(): Observable<readonly Portfolio[]> {
    const requestGeneration = this.cacheGeneration;
    let sharedRequest: Observable<readonly Portfolio[]>;

    // shareReplay partage une requête HTTP froide entre abonnés simultanés. Quand
    // elle réussit, tap remplit le cache pour les appels postérieurs; les erreurs
    // ne sont pas mémorisées et finalize libère toujours la référence en cours.
    sharedRequest = this.portfolioApi.getPortfolios().pipe(
      tap((portfolios) => {
        if (requestGeneration === this.cacheGeneration) {
          this.portfolioCacheState.set(portfolios);
        }
      }),
      finalize(() => {
        // Une ancienne requête invalidée ne doit pas effacer la référence du nouveau GET.
        if (this.inFlightPortfolios === sharedRequest) {
          this.inFlightPortfolios = null;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.inFlightPortfolios = sharedRequest;
    return sharedRequest;
  }

  // L'interceptor a normalisé le statut HTTP; la feature décide qu'un 404 Portfolio
  // signifie « absent ». Les autres erreurs remontent pour alimenter l'état de la page.
  getPortfolioById(id: string): Observable<Portfolio | undefined> {
    return this.portfolioApi.getPortfolioById(id).pipe(
      catchError((error: unknown) => {
        const status =
          error instanceof HttpTransportError || error instanceof HttpErrorResponse
            ? error.status
            : undefined;
        if (status === 404) {
          return of(undefined);
        }

        return throwError(() => error);
      }),
    );
  }
}