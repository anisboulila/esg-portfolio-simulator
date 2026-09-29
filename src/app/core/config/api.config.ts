import { InjectionToken } from '@angular/core';

// Ces tokens séparent les valeurs d'environnement des composants et services.
// app.config.ts fournit explicitement l'URL du mock en développement ou du backend en production.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
