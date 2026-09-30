import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HttpTransportError } from '../errors/http-transport-error';

// Un interceptor est un middleware d'infrastructure exécuté pour les requêtes HttpClient.
// Il normalise seulement l'enveloppe transport; les services de feature gardent le sens métier.
export const httpErrorNormalizationInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // HttpRequest est immuable : une modification demanderait request.clone(...).
  // Cette règle n'ajoute aucun en-tête; next(request) transmet donc la requête telle quelle.
  return next(request).pipe(
    // next() retourne le flux réponse/erreur de la chaîne HTTP. catchError observe
    // l'erreur transport, mais throwError la renvoie au service au lieu de l'avaler.
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Le statut est conservé pour que chaque feature puisse encore interpréter son 404.
        return throwError(() => new HttpTransportError(error.status));
      }

      return throwError(() => error);
    }),
  );
};