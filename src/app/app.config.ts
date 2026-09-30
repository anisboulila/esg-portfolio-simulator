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
    // Le mode Angular sélectionne la cible HTTP: le serveur Node local en développement,
    // ou le backend Spring Boot pour une build de production.
    {
      provide: API_BASE_URL,
      useFactory: () =>
        isDevMode() ? 'http://127.0.0.1:3001' : 'http://localhost:8080',
    },
  ]
};
