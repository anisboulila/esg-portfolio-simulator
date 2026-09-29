import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL, SIMULATION_API_MODE } from './core/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // HttpClient est fourni au niveau racine pour être injectable dans les services
    // sans NgModule et sans configuration HTTP dispersée dans les composants.
    provideHttpClient(),
    // La base URL est une configuration applicative modifiable en un seul endroit.
    { provide: API_BASE_URL, useValue: 'http://localhost:8080' },
    // Le mock est explicitement actif en développement; les builds de production
    // utilisent le même service avec le transport HTTP réel.
    {
      provide: SIMULATION_API_MODE,
      useFactory: () => (isDevMode() ? 'mock' : 'http'),
    },
  ]
};
