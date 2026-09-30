import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/config/api.config';
import { httpErrorNormalizationInterceptor } from './core/http/http-error-normalization.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // HttpClient est fourni au niveau racine pour être injectable dans les services
    // sans NgModule et sans configuration HTTP dispersée dans les composants.
    // L'interceptor est enregistré au niveau racine pour voir toutes les requêtes
    // HttpClient des features, sans que celles-ci dépendent de l'infrastructure.
    provideHttpClient(withInterceptors([httpErrorNormalizationInterceptor])),
    // Un provider indique à l'injecteur comment fournir un token. useFactory construit
    // API_BASE_URL depuis le mode d'exécution; cette décision d'infrastructure est
    // globale, car les API services de plusieurs features consomment la même configuration.
    {
      provide: API_BASE_URL,
      useFactory: () =>
        isDevMode() ? 'http://127.0.0.1:3001' : 'http://localhost:8080',
    },
    // Les services partagés n'ont pas de provider de route ou de composant : aucun état
    // ne demande une instance isolée. Un provider local créerait une portée plus limitée,
    // mais aucune feature actuelle ne justifie cette complexité.
  ]
};
