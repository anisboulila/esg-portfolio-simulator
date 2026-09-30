import { InjectionToken } from '@angular/core';

// Une URL est une valeur primitive, pas une classe à instancier : InjectionToken fournit
// un identifiant typé que l'injecteur peut relier à la configuration de l'application.
// Les services API reçoivent ainsi l'adresse sans la coder eux-mêmes.
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
