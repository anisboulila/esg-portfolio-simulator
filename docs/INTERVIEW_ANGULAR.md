# Fiche entretien Angular — ESG Portfolio Simulator

## 1. Projet en 30 secondes

« Je développe une application Angular 22 standalone pour consulter des portfolios et préparer des simulations ESG. Elle est organisée par features — Dashboard, Portfolios et Simulations — avec un shell commun et des routes lazy-loaded. Les composants délèguent les données et HTTP aux services; en développement, un mock HTTP Node permet d’exercer POST/GET sans Spring Boot. Angular valide le formulaire et affiche le résultat, mais le backend reste la source de vérité des scores ESG. »

## 2. Architecture à retenir

```text
bootstrapApplication → App / shell → Router → feature lazy-loaded
                                          ↓
                                  page → service → API
                                          ↓          ↓
                                   Signals/UI    HttpClient
```

- Standalone : composants et providers configurés sans NgModule; `main.ts` appelle `bootstrapApplication`.
- Features : Dashboard (`/`), Portfolios (`/portfolios`, `/:id`, `/:id/simulate`), Simulations (`/:id`).
- Root routes compose les arbres; chaque feature déclare son propre fichier `*.routes.ts` et est chargée par `loadChildren`.
- Ownership : PortfolioService possède l’accès aux fixtures; SimulationApiService possède l’accès HTTP; les pages possèdent la présentation et l’état local.
- Frontière métier : Angular envoie les champs validés et rend `SimulationResult`; il ne recalcule aucun score ESG.
- TASK-001–018 : bootstrap/shell; Dashboard; liste/carte/communication; projection; routing/détail/lazy loading; service Portfolio; recherche Signals/RxJS/états; formulaire/validation; API, contrat résultat et page résultat.

## 3. Les notions Angular réellement utilisées

| Notion | Ce que je dois savoir dire | Où dans le projet |
|---|---|---|
| Standalone / bootstrap | Démarrage sans NgModule via `bootstrapApplication`. | `src/main.ts`, `app.ts` |
| Components / templates | Les pages composent le shell, les sections et cartes. | `src/app/features/**`, `app.html` |
| Signals | État courant lisible par le template. | Dashboard, PortfolioList, formulaire, résultat |
| `signal()` | État modifiable local, par exemple recherche ou état de soumission. | `dashboard.ts`, `portfolio-list.ts`, formulaire, résultat |
| `computed()` | Valeur dérivée recalculée depuis les Signals lus. | `dashboard.ts`, `portfolio-list.ts`, détail |
| `@if` / `@for` | Contrôle de flux et rendu des listes/états. | templates Dashboard, portfolios, résultat |
| Inputs | Donnée parent → enfant avec signal input requis. | `portfolio-card.ts` |
| Outputs | Événement enfant → parent portant l’ID. | carte et `portfolio-list.html` |
| Content projection | Le conteneur reçoit le corps du parent avec `ng-content`. | `shared/components/detail-section/` |
| Routing | `routerLink`, `Router.navigate`, `router-outlet`. | `app.routes.ts`, routes features, shell |
| Route parameters | Lecture d’ID Portfolio/Simulation depuis `ActivatedRoute`. | pages détail, formulaire, résultat |
| Lazy loading | Les arbres de routes sont importés à la navigation. | `app.routes.ts`, `*.routes.ts` |
| Dependency Injection | Angular résout les services et tokens via ses providers. | `app.config.ts`, services |
| `inject()` | Demande une dépendance au conteneur Angular. | composants et services |
| Services | Accès aux fixtures ou orchestration de l’API hors des composants. | `PortfolioService`, `SimulationApiService` |
| Search state | `searchTerm` est la source de saisie; la liste filtrée est dérivée. | `portfolio-list.ts/html` |
| Observable | Flux asynchrone retourné par RxJS/HttpClient. | recherche, détail, `SimulationApiService` |
| `debounceTime` | Attend une pause de saisie avant le travail local simulé. | `portfolio-list.ts` |
| `switchMap` | Remplace l’Observable interne précédent à la recherche débouncée suivante. | `portfolio-list.ts` |
| Cancellation | Désabonnement du timer de recherche précédent; pas d’annulation de requête HTTP ici. | `portfolio-list.ts` |
| Signals vs RxJS | RxJS gère le flux; Signals exposent l’état courant à la vue. | `portfolio-list.ts`, pages |
| Reactive Forms | Choix pédagogique explicite; pas de Signal Forms. | formulaire ESG |
| FormGroup / FormControl | Groupe global et contrôles individuels typés. | `esg-simulation-form.ts` |
| Validators | Validators intégrés `required`, `pattern`, `min`, `max`. | formulaire ESG |
| HttpClient | POST/GET typés dans le service API, jamais dans les pages. | `simulation-api.service.ts` |
| `provideHttpClient()` | Provider standalone racine rendant HttpClient injectable. | `app.config.ts` |
| Contrats API typés | Request et Result guident l’usage TS; pas de validation runtime du JSON. | `features/simulations/models/` |
| Gestion erreurs HTTP | 404 devient `SimulationNotFoundError`, autres erreurs `SimulationApiError`; textes UX dans les pages. | service API, formulaire, résultat |
| Vitest / TestBed | Tests composants et services emploient TestBed et fixtures. | `src/app/**/*.spec.ts` |
| Tests composant/service/HTTP/routing | Composant, service Portfolio et routing sont couverts; tests HTTP absents. | 6 specs existantes; voir section Tests |

## 4. Les 15 questions les plus probables

1. **Q : Comment l’application démarre-t-elle ?** **R :** « `main.ts` appelle `bootstrapApplication` avec `App` et `appConfig`. La configuration racine fournit Router et HttpClient. »
2. **Q : Pourquoi des composants standalone ?** **R :** « Chaque composant déclare ses imports directement. Cela supprime le NgModule d’assemblage et rend les dépendances locales visibles. »
3. **Q : Quelle différence entre `signal()` et `computed()` ?** **R :** « `signal()` contient un état modifiable. `computed()` dérive une valeur des Signals qu’il lit, comme les portfolios filtrés. »
4. **Q : Pourquoi Signals et RxJS coexistent-ils ?** **R :** « RxJS organise les événements, délais et annulations. Le Signal expose ensuite l’état courant que le template doit afficher. »
5. **Q : Pourquoi `debounceTime` et `switchMap` dans la recherche ?** **R :** « Le debounce évite de lancer le travail à chaque caractère. `switchMap` désabonne l’ancien timer quand arrive le prochain terme stabilisé. »
6. **Q : Comment fonctionnent Inputs et Outputs ?** **R :** « La carte reçoit un Portfolio par input requis; elle émet l’ID au clic. Le parent choisit la navigation, ce qui garde la carte réutilisable. »
7. **Q : Pourquoi utiliser `ng-content` ?** **R :** « Le titre de DetailSection est une valeur simple passée par input. Son corps varie selon le parent, donc la projection est plus adaptée qu’un input de texte. »
8. **Q : Pourquoi un PortfolioService ?** **R :** « Il centralise l’accès aux fixtures utilisées par liste et détail. Les composants restent centrés sur rendu et interactions. »
9. **Q : Que fait `inject()` ?** **R :** « Il demande une dépendance au conteneur DI depuis un contexte Angular. Ici il fournit Router, services et tokens sans constructeur. »
10. **Q : Pourquoi lazy-load les features ?** **R :** « La racine charge les routes de feature à la navigation avec `loadChildren`. Cela sépare les features et évite de charger leur code dans le premier chunk de routes. »
11. **Q : Pourquoi Reactive Forms ?** **R :** « C’est le choix pédagogique des SDD pour apprendre FormGroup, FormControl, validators et état de validation. Le projet ne remplace pas ce choix par Signal Forms. »
12. **Q : Comment distinguer `touched`, `dirty` et `invalid` ?** **R :** « `touched` indique une interaction suivie d’une sortie du champ; `dirty`, une valeur modifiée; `invalid`, un échec de règle. Le template attend interaction ou tentative d’envoi. »
13. **Q : Pourquoi le composant n’appelle-t-il pas HttpClient ?** **R :** « SimulationApiService encapsule URL, POST/GET et traduction d’erreurs. La page construit le Request et orchestre l’état de l’interface. »
14. **Q : Le type `http.post<SimulationResult>()` valide-t-il la réponse reçue ?** **R :** « Non, le generic sécurise l’usage à la compilation seulement. Il ne vérifie pas la forme du JSON à l’exécution. »
15. **Q : Pourquoi Angular ne calcule-t-il pas `globalScore` ?** **R :** « Le backend est la source de vérité ESG. Angular affiche directement la valeur reçue, ce qui évite une règle concurrente et des écarts d’arrondi. »

## 5. 10 relances pièges

1. **Pourquoi ne pas utiliser RxJS partout ?** → RxJS décrit les flux asynchrones; Signals exposent simplement un état courant au template.
2. **Pourquoi ne pas rendre tout l’état global ?** → Le projet garde l’état au scope qui en a besoin; la recherche et le formulaire sont locaux.
3. **Que fait réellement `switchMap` ici ?** → Il remplace le timer simulé précédent après le debounce; la recherche actuelle n’est pas HTTP.
4. **Que se passe-t-il au refresh de `/simulations/:id` ?** → La page relit l’ID et fait un GET pour récupérer le résultat depuis le serveur.
5. **Le generic TypeScript valide-t-il un JSON mal formé ?** → Non; une validation runtime n’est pas présente dans cette implémentation.
6. **Le mock calcule-t-il les scores ?** → Non; il renvoie des valeurs de fixture statiques et ne représente pas la règle métier.
7. **Où doit vivre un message d’erreur métier ?** → Dans la feature qui connaît le contexte; le service transforme l’erreur transport en type applicatif.
8. **Pourquoi pas d’interceptor ?** → Le mapping actuel appartient à un seul service API; aucun besoin transverse partagé n’a été démontré.
9. **Route parameter ou query parameter ?** → `:id` identifie la ressource et appartient au chemin; un query parameter est plutôt un filtre ou une option de vue.
10. **Que manque-t-il avant production ?** → Tests HTTP/form/résultat, validation runtime éventuelle des contrats, configuration d’environnement robuste et vérification accessibilité automatisée.

## 6. Ce que je n’ai PAS utilisé

- HTTP interceptor — aucun besoin transversal partagé démontré jusqu’à TASK-018.
- Route guards/resolvers — le projet n’en déclare pas.
- NgRx/store global — l’état reste local.
- `Subject` / `BehaviorSubject` — absents; les Observables HTTP et interop sont utilisés.
- `AsyncPipe` — les flux sont consommés avec `toSignal()` ou `subscribe()`.
- Directives/pipes personnalisés — absents; le contrôle de flux Angular intégré est utilisé.
- SSR/hydration, zoneless et `@defer` — non implémentés.

## 7. Réponse finale de 60 secondes

« Je suis développeur Java/fullstack et j’ai construit ce projet pour apprendre Angular moderne sur un cas concret. L’application est standalone, organisée par features et route lazy-loaded; les composants délèguent données et HTTP aux services. J’ai utilisé Signals pour l’état local et RxJS pour le flux de recherche avec debounce et cancellation, puis Reactive Forms pour saisir les indicateurs. Le formulaire passe par un API service typé, et un mock HTTP Node permet de pratiquer POST/GET sans Spring Boot. Je ne recalcule pas l’ESG dans Angular : le backend reste autoritaire. J’ai aussi commencé les tests avec Vitest/TestBed pour le shell, les composants, le service Portfolio et le routing; les tests HTTP et formulaire restent à faire dans les tasks prévues. »
