import { InjectionToken } from '@angular/core';

export type SimulationApiMode = 'mock' | 'http';

// Ces tokens séparent les valeurs d'environnement des composants et services.
// app.config.ts fournit une URL et sélectionne explicitement le mode de développement.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
export const SIMULATION_API_MODE = new InjectionToken<SimulationApiMode>(
  'SIMULATION_API_MODE',
);