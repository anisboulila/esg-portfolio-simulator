# Préparation d’entretien Angular — ESG Portfolio Simulator

> Périmètre analysé : implémentation présente jusqu’à TASK-018 inclus, à partir des SDD et du code du workspace. Les tâches postérieures à TASK-018 ne sont pas décrites comme implémentées.

## État du projet en bref

- Application Angular 22 standalone, démarrée avec `bootstrapApplication`.
- Dashboard, Portfolio et Simulation Result ont des arbres de routes lazy-loaded.
- Les portfolios sont encore des fixtures locales, fournies par `PortfolioService`.
- La recherche combine Signals et RxJS, mais son délai est simulé localement par `timer`; ce n’est pas une recherche HTTP.
- Le formulaire utilise Reactive Forms et les validators intégrés.
- `SimulationApiService` expose les contrats typés au formulaire et à la page résultat. En développement, il cible un serveur mock HTTP Node distinct; en production, l’URL configurée pointe vers Spring Boot.
- Angular affiche le `globalScore` reçu. Aucun calcul ESG officiel n’est implémenté côté client.
- Les tests présents couvrent shell, Dashboard, projection, service Portfolio, liste/carte et navigation. Aucun test ne couvre encore le formulaire, l’API HTTP, le mock HTTP ou la page résultat.
- Le dépôt ne contient pas de registre séparé de tickets; `docs/tasks.md` est la source disponible.

# A. Utilisé dans ce projet

## Bootstrap et composants standalone

**Où :** `src/main.ts`, `src/app/app.ts`, ainsi que les composants de `src/app/features/` et `src/app/shared/`.

**Rôle et choix :** `bootstrapApplication(App, appConfig)` démarre l’application sans NgModule. Chaque composant déclare ses dépendances de template dans `imports`, ce qui garde ses dépendances visibles et locales. En Angular 22, les composants sont standalone par défaut; le code n’écrit donc pas `standalone: true`.

**Question probable :** Comment l’application démarre-t-elle ?

**Réponse orale :** « `main.ts` appelle `bootstrapApplication` avec le composant racine et sa configuration. Le Router et les providers globaux sont configurés dans `app.config.ts`. »

**Question avancée :** Que perdrait-on en revenant à un NgModule ?

**À comprendre :** Les imports standalone documentent les dépendances du template au niveau du composant; les providers d’application restent configurés à la racine.

## Templates, composition et sémantique HTML

**Où :** `app.html`, `dashboard.html`, `portfolio-list.html`, `portfolio-card.html`, le formulaire et la page résultat.

**Rôle et choix :** Le shell conserve header, navigation, main, `router-outlet` et footer. Les pages composent les éléments de feature; la liste compose `PortfolioCard`. Le code emploie le contrôle de flux moderne `@for`, `@if`, `@else if` et `@let`.

**Question probable :** Comment Angular rend-il une collection de portfolios ?

**Réponse orale :** « `PortfolioList` transmet les portfolios à `@for`, qui crée une carte par élément et suit chaque élément avec son identifiant stable. »

**Question avancée :** Pourquoi fournir une expression `track` ?

**À comprendre :** Le tracking aide Angular à associer les éléments rendus aux objets de la collection et à éviter des remplacements DOM inutiles lorsque la collection évolue.

## Parent/enfant : signal input et output

**Où :** `portfolio-card.ts` et `portfolio-list.html`.

**Rôle et choix :** La carte reçoit `portfolio` par `input.required<Portfolio>()`. Elle émet `viewDetails` avec l’ID; le parent écoute l’événement et utilise Router pour naviguer. La carte ne connaît ni les routes ni l’API.

**Question probable :** Comment la carte informe-t-elle la liste qu’on demande le détail ?

**Réponse orale :** « Le parent fournit les données via un signal input requis. Au clic, l’enfant émet l’ID par un output; la liste décide ensuite de la navigation. »

**Question avancée :** Pourquoi l’enfant n’injecte-t-il pas Router ?

**À comprendre :** L’output garde la carte réutilisable et laisse la décision de navigation au composant qui possède le contexte de la page.

## Projection de contenu

**Où :** `shared/components/detail-section/` et `dashboard.html`.

**Rôle et choix :** `DetailSection` prend un titre scalar par `input.required<string>()` et projette un corps caller-defined avec `<ng-content />`. Le Dashboard le réutilise pour deux contenus différents : les métriques de portefeuille et le score ESG.

**Question probable :** Quand choisir `ng-content` plutôt qu’un input ?

**Réponse orale :** « Un input convient à une valeur comme le titre. La projection convient au markup fourni par le parent, parce que chaque usage peut avoir une structure différente. »

**Question avancée :** Qui possède les nœuds projetés et leur contexte Angular ?

**À comprendre :** Le parent déclare le contenu projeté; le composant conteneur fournit la structure commune autour de ce contenu.

## Signals et état dérivé

**Où :** `dashboard.ts`, `portfolio-list.ts`, le formulaire et `simulation-result.ts`.

**Rôle et choix :** `signal()` porte un état modifiable local, comme le terme de recherche ou l’état de soumission. `computed()` dérive la liste filtrée de la collection Portfolio et du terme de recherche. Les résultats asynchrones sont convertis avec `toSignal()` pour que le template lise l’état courant.

**Question probable :** Pourquoi `filteredPortfolios` est-il un `computed()` ?

**Réponse orale :** « La liste filtrée dépend de la collection et du terme. `computed()` recalcule automatiquement cette vue quand une dépendance change et évite un deuxième état à synchroniser manuellement. »

**Question avancée :** Quand ne faudrait-il pas remplacer un Observable par un Signal ?

**À comprendre :** Les Signals représentent commodément un état courant de vue; RxJS gère les flux asynchrones, opérateurs, délais et annulations.

## RxJS, Observables et interop Signals

**Où :** `portfolio-list.ts`, `portfolio-detail.ts`, `simulation-api.service.ts`.

**Rôle et choix :** La recherche adapte `searchTerm` avec `toObservable()`, applique `debounceTime(300)`, puis `switchMap()` vers un `timer(250)` local. `switchMap` désabonne le timer précédent lorsqu’une nouvelle valeur débouncée arrive. `catchError` transforme l’échec simulé en état applicatif, puis `toSignal()` expose le résultat au template. `toSignal()` est également utilisé pour le `paramMap` du détail. Les appels HttpClient retournent des Observables consommés par abonnement dans les composants.

**Question probable :** Que fait `switchMap` dans la recherche ?

**Réponse orale :** « Il remplace l’opération interne associée à la recherche précédente par la plus récente. Ici l’opération est un délai local simulé, pas une requête HTTP. »

**Question avancée :** À quel moment l’opération précédente est-elle annulée avec ce pipeline ?

**À comprendre :** La nouvelle valeur traverse d’abord `debounceTime`; `switchMap` reçoit ensuite cette valeur et désabonne le précédent Observable interne. L’implémentation n’annule donc pas au premier caractère saisi, mais après la période de debounce.

## Routing et lazy loading

**Où :** `app.routes.ts`, `dashboard.routes.ts`, `portfolios.routes.ts`, `simulations.routes.ts`, `app.html`.

**Rôle et choix :** Le root route table compose les features par `loadChildren`; chaque feature garde ses routes. `router-outlet` affiche la route active, `routerLink` gère les liens, et `Router.navigate()` sert au clic de détail et au POST réussi. Les chemins incluent `/`, `/portfolios`, `/portfolios/:id`, `/portfolios/:id/simulate` et `/simulations/:id`.

**Question probable :** Que signifie `loadChildren` ici ?

**Réponse orale :** « Le routeur charge dynamiquement le fichier de routes de la feature quand son préfixe est visité. Le routage racine compose les features; les routes détaillées restent dans chaque feature. »

**Question avancée :** Quelle différence avec `loadComponent` ?

**À comprendre :** `loadChildren` charge un arbre de routes; `loadComponent` charge directement un composant pour une route. Ce projet charge des arbres de features.

## Route parameters et cycle de vie

**Où :** `portfolio-detail.ts`, `esg-simulation-form.ts`, `simulation-result.ts`.

**Rôle et choix :** Le détail observe `ActivatedRoute.paramMap` et l’adapte en Signal; le formulaire lit l’ID du portfolio depuis le snapshot; la page résultat lit l’ID de simulation dans `ngOnInit()` avant son GET. Ce dernier chemin rend le chargement direct et le refresh possibles.

**Question probable :** Comment `/simulations/:id` charge-t-il un résultat après refresh ?

**Réponse orale :** « Le composant lit `id` depuis `ActivatedRoute`, puis demande le résultat à `SimulationApiService`. Il ne dépend donc pas d’un résultat conservé uniquement en mémoire après le POST. »

**Question avancée :** Quelle limite a `snapshot` par rapport à `paramMap` réactif ?

**À comprendre :** Le snapshot convient à une lecture ponctuelle à la création. Si le même composant doit réagir à un changement de paramètre sans être recréé, il faut consommer le flux `paramMap`.

## Services et Dependency Injection

**Où :** `portfolio.service.ts`, `simulation-api.service.ts`, `app.config.ts`.

**Rôle et choix :** `PortfolioService` expose les fixtures locales via `getPortfolios()` et `getPortfolioById()`. `SimulationApiService` encapsule les appels HTTP. Tous deux sont décorés `@Service()` et utilisent `inject()`; les composants ne créent pas directement leurs dépendances.

**Question probable :** Pourquoi `PortfolioList` n’embarque-t-il pas les données ?

**Réponse orale :** « Le service possède l’accès aux données Portfolio; le composant reste responsable de la présentation et des interactions. Cela évite de dupliquer les fixtures entre liste et détail. »

**Question avancée :** Quel est le rôle d’un provider racine et quand choisir une portée plus locale ?

**À comprendre :** Le conteneur DI résout les dépendances et leur portée. Ici les services sont stateless et partagés; une portée feature ne serait utile que si l’instance devait être isolée à cette feature.

## Reactive Forms et validation

**Où :** `esg-simulation-form.ts` et `esg-simulation-form.html`.

**Rôle et choix :** Le `FormGroup` typé regroupe cinq `FormControl`; la page importe `ReactiveFormsModule`. Les validators intégrés sont `required`, `pattern`, `min` et `max`. `showError()` montre une erreur après interaction (`touched`) ou tentative de soumission; le template associe le message au champ par `aria-describedby`.

**Question probable :** Quelle différence entre `touched`, `dirty` et `invalid` ?

**Réponse orale :** « `touched` signifie que le champ a été visité puis quitté; `dirty` signifie que sa valeur a changé; `invalid` signifie qu’au moins une règle échoue. Le code attend une interaction ou une soumission avant d’afficher l’erreur. »

**Question avancée :** Pourquoi utiliser `Validators.pattern` pour le portfolio ID ?

**À comprendre :** `required` vérifie qu’une chaîne n’est pas vide, mais accepte les espaces seuls. `pattern(/\S/)` impose au moins un caractère non blanc; les nombres utilisent `min` et `max`, sans validator custom.

## HttpClient, API typée et mock HTTP

**Où :** `app.config.ts`, `core/config/api.config.ts`, `simulation-api.service.ts`, `tools/simulation-mock-server.mjs`.

**Rôle et choix :** `provideHttpClient()` rend `HttpClient` injectable au niveau standalone global. `API_BASE_URL` est un InjectionToken choisi par `isDevMode()`. `SimulationApiService` expose `POST /api/v1/esg/simulations` et `GET /api/v1/esg/simulations/:id`, tous deux typés `SimulationRequest`/`SimulationResult`. En développement, `npm run mock:api` lance le serveur Node intégré, qui retourne un JSON par HTTP, conserve le résultat en mémoire, et renvoie 404 pour un ID inconnu.

**Question probable :** Que garantit `http.post<SimulationResult>()` ?

**Réponse orale :** « Le type aide TypeScript à vérifier l’usage de la réponse dans le code. Il ne valide pas à l’exécution que le JSON distant correspond réellement à l’interface. »

**Question avancée :** Pourquoi le mock Node est-il différent de `of(mockResult)` ?

**À comprendre :** `of()` émet une valeur à l’intérieur du processus Angular et ne traverse pas le transport HTTP. Le serveur mock distinct reçoit une vraie requête, répond avec un statut et du JSON, et permet de vérifier CORS, URL, méthode et contrat HTTP sans Spring Boot.

## Gestion des erreurs HTTP

**Où :** `SimulationApiService.mapError()`, le formulaire et `SimulationResultPage`.

**Rôle et choix :** Le service convertit un `HttpErrorResponse` 404 en `SimulationNotFoundError`, et les autres erreurs en `SimulationApiError`. Le formulaire masque le détail d’un échec POST; la page résultat distingue not-found et erreur générique. Aucun interceptor n’est présent.

**Question probable :** Pourquoi ne pas afficher `HttpErrorResponse.message` ?

**Réponse orale :** « Il s’agit d’un détail de transport qui peut révéler des informations techniques. La feature affiche un message utile et le service ne transmet qu’une erreur applicative connue. »

**Question avancée :** Quand un interceptor serait-il justifié ?

**À comprendre :** Quand une préoccupation commune s’applique réellement à plusieurs appels/services, par exemple des en-têtes ou une normalisation transport uniforme. Les messages not-found et UX spécifiques restent dans la feature.

## Tests réellement présents

**Où :** fichiers `*.spec.ts` sous `src/app/` et Vitest via le builder `@angular/build:unit-test`.

**Couverture observée :** 13 tests dans 6 fichiers : shell (2), Dashboard (1), projection (1), portfolio list/card (2), `PortfolioService` (3), navigation/routing portefeuille (4). Les tests utilisent `TestBed`, fixtures, DOM queries et `vi.spyOn`.

**Question probable :** Que teste votre suite actuellement ?

**Réponse orale :** « Elle couvre le shell, le rendu Dashboard, la projection, les fixtures Portfolio et le routage jusqu’au détail. Les tests du formulaire, des requêtes HTTP, du mock et du résultat restent à écrire dans les tasks de testing prévues. »

**Question avancée :** Pourquoi `http.post<SimulationResult>()` seul n’est-il pas une preuve que le backend respecte le contrat ?

**À comprendre :** Le generic TypeScript n’effectue pas de validation runtime. Il faudra des tests HTTP et/ou une validation du contrat au point d’entrée; cette couverture n’est pas présente à ce stade.

## Accessibilité et HTML sémantique

**Où :** shell, formulaires et états de recherche/résultat.

**Rôle et choix :** Les formulaires ont des labels, erreurs liées avec `aria-describedby`, `aria-invalid`, `role="alert"`; les états asynchrones emploient `role="status"`; les liens et boutons sont natifs et des styles `:focus-visible` existent.

**Question probable :** Pourquoi associer un message à un contrôle avec `aria-describedby` ?

**Réponse orale :** « Cela permet aux technologies d’assistance d’annoncer l’erreur avec le champ concerné. Le texte explique aussi l’erreur, donc la couleur n’est pas le seul indicateur. »

**Question avancée :** Quelle vérification d’accessibilité manque encore ?

**À comprendre :** Les attributs et tests de rendu ne remplacent pas un contrôle axe/WCAG et clavier dans les parcours réels. Aucun résultat axe n’a été relevé dans cette analyse.

# B. Présent indirectement / à comprendre

- **Configuration TypeScript :** `tsconfig.json` active plusieurs contrôles (`noImplicitReturns`, `noImplicitOverride`, etc.), mais ne déclare pas `strict: true`; `strictTemplates` n’apparaît pas non plus dans `angularCompilerOptions`. Ne présente donc pas le projet comme entièrement strict sans vérifier ces options. Angular active séparément `strictInjectionParameters` et `strictInputAccessModifiers`.
- **Typage HTTP :** `SimulationRequest` et `SimulationResult` structurent le contrat côté compilation. Les réponses JSON ne sont pas validées runtime par ces interfaces.
- **CORS et développement :** le mock ajoute `Access-Control-Allow-Origin: *` pour permettre au serveur Angular sur un autre port de l’appeler. Le mock n’est qu’un outil local.
- **État du mock :** le serveur utilise une `Map` en mémoire et un ID fixe `mock-simulation-001`; plusieurs POST remplacent la même entrée, et redémarrer le serveur efface les données.
- **Environnements :** `API_BASE_URL` est injecté et le composant ignore les URLs. Le choix dev/prod est néanmoins codé dans `app.config.ts` (`isDevMode()` et deux valeurs locales), pas dans des fichiers d’environnement spécifiques.
- **Résultat officiel :** la page affiche `globalScore` directement. Les valeurs 72/81/76/76.3 du mock sont des données statiques de démonstration, pas une règle ou un calcul Angular.
- **Recherche :** la source de portfolios est locale. Le `timer(250)` simule une latence; cela apprend debounce/cancellation mais n’est ni HTTP ni backend.
- **RxJS interop :** `toObservable` et `toSignal` connectent les modèles Signals et les flux. La recherche utilise `subscribe` indirectement par `toSignal`; formulaire/résultat s’abonnent manuellement aux Observables HttpClient, qui émettent une réponse ou une erreur.
- **Lifecycle :** seul le hook `OnInit` est utilisé par `SimulationResultPage`; aucun `OnDestroy` ou hook avancé n’est présent.
- **État de validation :** le formulaire utilise `touched` et un drapeau de soumission dans sa condition d’affichage. `dirty` est expliqué dans les commentaires, mais n’est pas une condition utilisée par `showError()`.
- **Limites de présentation visibles :** `src/index.html` annonce `lang="en"` alors que l’interface est surtout en français. Le commentaire racine de `app.routes.ts` affirmant que Simulations n’a pas d’arbre de routes est obsolète. Des règles `.prepared-request` subsistent dans le CSS du formulaire alors que ce bloc a été remplacé par la soumission API.

# C. À connaître pour l’entretien, mais non utilisé ici

## Guards de routing

Le projet n’a pas de `CanActivate`, `CanMatch` ou autre guard. Un guard contrôle l’accès ou la disponibilité d’une route avant son activation; on l’ajouterait pour une vraie politique d’accès ou une condition de navigation, pas pour remplacer une vérification métier backend.

## HTTP Interceptors

Aucun interceptor n’est défini. Un interceptor fonctionnel peut traiter une préoccupation transversale de transport pour plusieurs requêtes; une erreur de simulation spécifique reste dans `SimulationApiService`/la feature. Le SDD TASK-019 dit de ne l’ajouter que si ce besoin commun est démontré.

## Subject et BehaviorSubject

Aucun des deux n’est construit dans le projet. Un `Subject` permet de publier explicitement des événements à plusieurs observateurs; un `BehaviorSubject` conserve une valeur courante pour les nouveaux abonnés. Ne pas les confondre avec les Observables retournés par HttpClient ou les Signals.

## Async pipe

Le template n’utilise pas `| async`. Ici les Observables sont convertis avec `toSignal()` ou consommés par `subscribe()`. L’async pipe serait une autre façon de s’abonner dans le template et de gérer le désabonnement à la destruction de la vue.

## `effect()` et Signals avancés

`effect()`, `linkedSignal()`, signal queries et state management global ne sont pas utilisés. `computed()` sert aux valeurs dérivées; un effect ne doit pas remplacer un calcul dérivé ni déclencher des appels de service arbitraires.

## Directives et pipes personnalisés

Aucune directive ni pipe personnalisés n’existent. Le projet utilise le contrôle de flux intégré `@if`, `@for`, `@switch`/liaisons ordinaires. Un pipe ne se justifie que par une transformation d’affichage réutilisable; une directive par un comportement DOM réutilisable.

## Change detection et rendu

Aucun `ChangeDetectionStrategy` n’est déclaré explicitement. Angular 22 utilise le comportement moderne par défaut. Connaître OnPush, zoneless et les mécanismes de rendu reste utile en entretien; il ne faut pas prétendre qu’une migration zoneless ou une optimisation mesurée a été faite ici.

## FormBuilder, Signal Forms et validation custom

Le formulaire utilise `new FormGroup`/`new FormControl`, pas `FormBuilder` ni Signal Forms. Aucun validator custom n’est présent : `required`, `pattern`, `min`, `max` couvrent les règles représentées.

## Resolvers, SSR et NgRx

Aucun resolver, SSR/hydration ou NgRx n’est présent. Le chargement du résultat est orchestré par la page après lecture du paramètre, et l’état reste local au plus petit scope concerné.

# Questions d’entretien basées sur les tasks (001–018)

Chaque réponse est formulée pour être dite à l’oral; adapte-la à ton expérience et ne présente pas une tâche planifiée comme une réalisation.

## TASK-001 — Initialisation Angular

**Besoin :** créer l’application Angular moderne et comprendre son démarrage. **Fichiers :** `src/main.ts`, `src/app/app.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`.

1. **Q : Comment Angular démarre-t-il ?** **R :** « `main.ts` appelle `bootstrapApplication` avec le composant racine `App` et sa configuration. Angular construit alors l’arbre standalone. »
2. **Q : Où configurer les providers globaux ?** **R :** « Dans `app.config.ts`, fourni à `bootstrapApplication`; ici il configure le Router, les listeners d’erreurs globaux et HttpClient. »
3. **Q : Pourquoi standalone ?** **R :** « Les composants déclarent leurs imports directement, sans NgModule intermédiaire. C’est la composition utilisée par Angular moderne et par ce projet. »

## TASK-002 — Application Shell

**Besoin :** conserver header, navigation, contenu et footer entre les routes. **Fichiers :** `app.ts`, `app.html`, `app.css`.

1. **Q : À quoi sert `router-outlet` ?** **R :** « C’est l’emplacement où Angular Router installe le composant associé à l’URL. Le shell reste affiché autour. »
2. **Q : Comment la navigation reste-t-elle accessible ?** **R :** « Les liens sont des ancres avec `routerLink`, le nav a un nom accessible et le CSS prévoit `:focus-visible`. »
3. **Q : Comment vérifier le shell ?** **R :** « Le test `app.spec.ts` vérifie header, nav, main/router-outlet et footer; il ne remplace pas un audit complet clavier/axe. »

## TASK-003 — Dashboard et Signals

**Besoin :** afficher un résumé local et apprendre `signal()`/`computed()`. **Fichiers :** `dashboard.ts`, `dashboard.html`, `dashboard.spec.ts`.

1. **Q : Pourquoi un Signal pour le compte ?** **R :** « C’est un état local réactif que le template peut lire; Angular suit cette dépendance. »
2. **Q : Pourquoi `computed()` ?** **R :** « Le résumé est dérivé des valeurs sources. Angular le recalcule quand une dépendance lue change, sans copie à synchroniser. »
3. **Q : Les données du Dashboard viennent-elles du backend ?** **R :** « Non, ce sont des valeurs locales de démonstration; aucun service ou appel réseau n’alimente ce résumé. »

## TASK-004 — Portfolio List

**Besoin :** afficher une collection typée. **Fichiers :** `portfolio-list.ts/html/css`, `models/portfolio.ts`, `data/portfolios.ts`.

1. **Q : Pourquoi `@for` avec `track portfolio.id` ?** **R :** « `@for` rend une carte par portfolio; l’ID stable aide Angular à associer les éléments DOM aux éléments de données. »
2. **Q : Où sont les fixtures ?** **R :** « Dans `data/portfolios.ts`, puis elles sont exposées par `PortfolioService`; la page n’en détient pas une copie. »
3. **Q : La recherche est-elle une requête backend ?** **R :** « Non. Elle filtre la collection locale fournie par le service. »

## TASK-005 — Portfolio Card

**Besoin :** réutiliser l’affichage d’un portfolio. **Fichiers :** `components/portfolio-card/portfolio-card.ts/html/css`.

1. **Q : Comment la carte reçoit-elle son portfolio ?** **R :** « Avec le signal input requis `input.required<Portfolio>()`; le template lit `portfolio()`. »
2. **Q : Pourquoi séparer la carte de la liste ?** **R :** « La liste gère la collection; la carte rend un élément unique. Chaque composant garde une responsabilité claire. »
3. **Q : La carte réalise-t-elle des appels HTTP ?** **R :** « Non, elle reçoit ses données par input et émet une intention de détail. »

## TASK-006 — Communication Parent/Enfant

**Besoin :** transmettre les données et signaler l’action de détail. **Fichiers :** carte et liste, `portfolio-list.spec.ts`.

1. **Q : Comment l’enfant signale-t-il le clic ?** **R :** « Avec `output<string>()`; le composant émet l’ID du portfolio courant. »
2. **Q : Qui navigue ?** **R :** « La liste écoute l’output et appelle Router; la carte reste découplée du routing. »
3. **Q : Quel test couvre ce flux ?** **R :** « Le test clique le bouton et vérifie que le parent reçoit l’ID `p1`. »

## TASK-007 — Content Projection

**Besoin :** partager une structure tout en laissant le parent fournir le corps. **Fichiers :** `shared/components/detail-section/*`, Dashboard.

1. **Q : Quand utiliser la projection plutôt qu’un input ?** **R :** « Le titre est une valeur simple, donc input; les métriques et leur markup diffèrent selon la section, donc `ng-content`. »
2. **Q : Comment la réutilisation est-elle démontrée ?** **R :** « Le Dashboard utilise deux `DetailSection` avec des contenus différents. »
3. **Q : Qui possède le contenu projeté ?** **R :** « Le parent écrit le contenu; l’enfant fournit le conteneur et rend le titre. »

## TASK-008 — Routing

**Besoin :** naviguer sans rechargement complet. **Fichiers :** `app.routes.ts`, routes des features, `app.html`, tests routing.

1. **Q : `routerLink` ou `Router.navigate()` ?** **R :** « `routerLink` convient aux liens déclaratifs; `Router.navigate()` est employé après l’output de la carte. »
2. **Q : Quelle responsabilité a la racine ?** **R :** « Elle compose les arbres de routes et redirige les chemins inconnus; les features possèdent leurs routes internes. »
3. **Q : Comment vérifier la navigation ?** **R :** « La spec routing monte `App`, navigue vers des URLs et vérifie l’URL et le contenu rendu. »

## TASK-009 — Portfolio Detail

**Besoin :** identifier un portfolio par paramètre. **Fichiers :** `pages/portfolio-detail/*`, `PortfolioService`, routes Portfolio.

1. **Q : Comment la page obtient-elle l’ID ?** **R :** « Elle lit `ActivatedRoute.paramMap`, l’adapte en Signal, puis cherche par ID dans le service. »
2. **Q : Comment un ID inconnu est-il géré ?** **R :** « Le service retourne `undefined`, et la page affiche un état introuvable. »
3. **Q : Pourquoi le détail ne copie-t-il pas les fixtures ?** **R :** « Liste et détail interrogent le même `PortfolioService`, qui centralise l’accès aux données locales. »

## TASK-010 — Lazy Loading

**Besoin :** créer des frontières de features différées. **Fichiers :** `app.routes.ts`, `dashboard.routes.ts`, `portfolios.routes.ts`, `simulations.routes.ts`.

1. **Q : Que fait `loadChildren` ?** **R :** « Il charge dynamiquement un arbre de routes de feature quand son préfixe est visité. »
2. **Q : Quelles features sont lazy ?** **R :** « Dashboard, Portfolio et Simulations ont chacune un arbre de routes chargé depuis la racine. »
3. **Q : Comment le constater ?** **R :** « Le build produit des chunks nommés par feature; les specs vérifient aussi que la navigation fonctionne. »

## TASK-011 — Portfolio Service

**Besoin :** retirer l’accès aux fixtures des composants. **Fichiers :** `services/portfolio.service.ts`, `data/portfolios.ts`, spec du service.

1. **Q : Quel est le contrat du service ?** **R :** « Il expose la collection et une recherche par ID; un ID absent retourne `undefined`. »
2. **Q : Quel est le rôle de `@Service()` et `inject()` ?** **R :** « `@Service()` rend l’instance disponible au conteneur Angular; `inject()` la demande dans un contexte d’injection. »
3. **Q : Le service appelle-t-il déjà le backend ?** **R :** « Non, il encapsule uniquement les données locales. »

## TASK-012 — Portfolio Search

**Besoin :** rechercher par nom sans doubler la source de données. **Fichiers :** `portfolio-list.ts/html/css`.

1. **Q : Quel est l’état source ?** **R :** « `searchTerm` est un Signal modifiable mis à jour par l’événement input. »
2. **Q : Pourquoi `filteredPortfolios` est-il dérivé ?** **R :** « Le `computed()` lit le terme et filtre la collection du service; le template consomme cette vue, sans maintenir un second tableau mutable. »
3. **Q : Quelles règles de recherche ?** **R :** « Le code normalise espaces et casse et cherche uniquement dans `portfolio.name`, comme REQ-004 le demande. »

## TASK-013 — Asynchronous Search with RxJS

**Besoin :** ajouter debounce et annulation au state de TASK-012. **Fichiers :** `portfolio-list.ts/html`.

1. **Q : Pourquoi RxJS ici ?** **R :** « RxJS modélise les événements et le travail asynchrone; le résultat d’état revient au template via `toSignal()`. »
2. **Q : Que font `debounceTime` et `switchMap` ?** **R :** « Le premier attend une pause de saisie; le second remplace l’opération interne précédente quand une nouvelle recherche débouncée arrive. »
3. **Q : La recherche appelle-t-elle un endpoint ?** **R :** « Non. `timer(250)` simule une latence locale; HttpClient est utilisé seulement pour les simulations. »

## TASK-014 — Loading / Empty / Error States

**Besoin :** présenter des états exclusifs. **Fichiers :** `portfolio-list.ts/html`.

1. **Q : Comment les états sont-ils représentés ?** **R :** « Un type discriminé `loading | success | empty | error` est exposé au template via Signal. »
2. **Q : Pourquoi pas plusieurs booléens ?** **R :** « Un seul `status` empêche des combinaisons incohérentes comme loading et error simultanés. »
3. **Q : Comment chaque état est-il rendu ?** **R :** « Le template utilise `@if`/`@else if`; le message error reste générique. »

## TASK-015 — ESG Simulation Form

**Besoin :** saisir le contrat Request en Reactive Forms. **Fichiers :** `pages/esg-simulation-form/*`, `models/simulation-request.ts`, route Portfolio.

1. **Q : Pourquoi Reactive Forms ?** **R :** « C’est le choix pédagogique SDD pour apprendre FormGroup, FormControl, validators et leur état. »
2. **Q : Quelle est la responsabilité du composant ?** **R :** « Il lit l’ID de route, orchestre le formulaire et prépare l’objet typé; il ne possédait pas de calcul ESG. »
3. **Q : La soumission de TASK-015 appelait-elle un backend ?** **R :** « Non, elle préparait localement le contrat; TASK-017 a ensuite connecté le service API. »

## TASK-016 — Advanced Validation

**Besoin :** appliquer les bornes REQ-007 et présenter les erreurs. **Fichiers :** `esg-simulation-form.ts/html`.

1. **Q : Quels validators sont utilisés ?** **R :** « `required`, `pattern`, `min` et `max`; aucune fonction validator custom. »
2. **Q : Pourquoi `pattern` sur l’ID ?** **R :** « `required` accepte des espaces seuls; `pattern(/\S/)` impose au moins un caractère non blanc. »
3. **Q : Comment une erreur est-elle accessible ?** **R :** « Le message est affiché après interaction/tentative, associé au champ par `aria-describedby`, et signalé par `aria-invalid` et du texte explicite. »

## TASK-017 — Simulation API

**Besoin :** faire POST un Request typé et gérer les erreurs. **Fichiers :** `app.config.ts`, `core/config/api.config.ts`, `simulation-api.service.ts`, modèles, `tools/simulation-mock-server.mjs`.

1. **Q : Pourquoi `provideHttpClient()` à la racine ?** **R :** « Il configure le provider standalone; les services peuvent ensuite injecter `HttpClient` sans NgModule ni configuration locale. »
2. **Q : Pourquoi un API service ?** **R :** « Il encapsule URL, HTTP et normalisation d’erreur; le composant garde l’orchestration de l’interface. »
3. **Q : Le mock calcule-t-il ESG ?** **R :** « Non. Le serveur retourne une fixture statique typée; seul le backend est la source de vérité des scores. »

## TASK-017A — ESG Calculation Contract

**Besoin :** afficher le contrat `SimulationResult` sans calcul client. **Fichiers :** `simulation-result.ts`, service API, mock serveur.

1. **Q : Angular calcule-t-il `globalScore` ?** **R :** « Non, le champ est rendu tel que fourni par le backend ou la fixture HTTP. »
2. **Q : Pourquoi `Portfolio` est imbriqué dans `SimulationResult` ?** **R :** « Le contrat résultat inclut l’identité et l’information du portfolio correspondant à la simulation. »
3. **Q : Que prouve le type TypeScript ?** **R :** « Il vérifie l’usage du contrat à la compilation, mais ne valide pas le JSON distant à l’exécution. »

## TASK-018 — Simulation Result

**Besoin :** charger et afficher un résultat par ID, même en accès direct. **Fichiers :** `simulations.routes.ts`, `simulation-result.*`, `SimulationApiService`.

1. **Q : Pourquoi un GET après le POST ?** **R :** « Le POST retourne un ID pour naviguer; le GET permet à une URL directe ou rafraîchie de recharger le résultat officiel. »
2. **Q : Quels états la page distingue-t-elle ?** **R :** « Loading, success, not-found et error, modélisés par un Signal à union discriminée. »
3. **Q : Comment le score global est-il rendu ?** **R :** « La page affiche directement `result.globalScore` sous le libellé officiel, sans formule Angular. »

# TOP 30 — Questions que le recruteur peut me poser

Classées du plus probable au moins probable pour une discussion centrée sur ce projet.

1. **Question :** Comment l’application démarre-t-elle ? **Réponse :** « `main.ts` appelle `bootstrapApplication` avec `App` et `appConfig`. Les providers globaux et le routeur sont définis dans cette configuration. » **Niveau :** débutant. **Référence :** `src/main.ts`, `src/app/app.config.ts`.
2. **Question :** Comment naviguer entre Dashboard et Portfolio ? **Réponse :** « Les liens utilisent `routerLink`, les URLs sont définies par Angular Router et `router-outlet` rend la route active dans le shell. La navigation reste une navigation SPA, sans rechargement complet du document. » **Niveau :** débutant. **Référence :** `app.html`, `app.routes.ts`.
3. **Question :** Que font les routes lazy-loaded ? **Réponse :** « `loadChildren` importe l’arbre de routes d’une feature à sa première navigation, ce qui crée une frontière de chargement par feature. Le code de la feature n’est donc pas dans le chunk initial du routage. » **Niveau :** intermédiaire. **Référence :** `app.routes.ts`, `*.routes.ts`.
4. **Question :** Comment le Portfolio ID atteint-il la page détail ? **Réponse :** « La carte émet son ID par output; la liste appelle `Router.navigate()`. La page détail lit ensuite le paramètre de route et interroge le service local. » **Niveau :** intermédiaire. **Référence :** `portfolio-card.ts`, `portfolio-list.ts`, `portfolio-detail.ts`.
5. **Question :** Pourquoi utiliser `signal()` et `computed()` pour la recherche ? **Réponse :** « Le terme est un état modifiable; la liste filtrée en dépend. Le `computed()` suit automatiquement le Signal et évite de synchroniser deux listes. » **Niveau :** intermédiaire. **Référence :** `portfolio-list.ts`.
6. **Question :** Comment RxJS intervient-il dans la recherche ? **Réponse :** « `toObservable` adapte le terme, `debounceTime` attend une pause, puis `switchMap` remplace le timer interne précédent. Le délai est simulé localement, sans HTTP. » **Niveau :** intermédiaire. **Référence :** `portfolio-list.ts`.
7. **Question :** À quoi sert `switchMap` ici ? **Réponse :** « Il se désabonne du travail asynchrone précédent quand une nouvelle recherche débouncée arrive, afin que l’opération récente prenne le dessus. Dans cette feature, l’opération interne est le délai local simulé, pas une requête HTTP. » **Niveau :** avancé. **Référence :** `portfolio-list.ts`.
8. **Question :** Comment exposez-vous les états de recherche ? **Réponse :** « Une union discriminée porte loading, success, empty et error; `toSignal()` expose sa valeur courante et `@if` rend la branche correspondante. `@let` capture le snapshot utilisé par les branches. » **Niveau :** intermédiaire. **Référence :** `portfolio-list.ts/html`.
9. **Question :** Comment la carte reçoit-elle ses données ? **Réponse :** « Le parent fournit un `Portfolio` par `input.required<Portfolio>()`, qui est lu comme signal dans le template. Le caractère `required` rend l’input obligatoire au contrat du composant. » **Niveau :** débutant. **Référence :** `portfolio-card.ts/html`.
10. **Question :** Pourquoi la carte n’injecte-t-elle pas Router ? **Réponse :** « Elle exprime une intention par output; le parent décide de la navigation. Cette séparation préserve la réutilisabilité de la carte. » **Niveau :** intermédiaire. **Référence :** Portfolio list/card.
11. **Question :** Pourquoi `ng-content` dans `DetailSection` ? **Réponse :** « Le titre est un input simple; le corps a des structures différentes fournies par Dashboard. La projection évite de rigidifier le conteneur. » **Niveau :** intermédiaire. **Référence :** `shared/components/detail-section/`.
12. **Question :** Quel rôle joue `PortfolioService` ? **Réponse :** « Il centralise l’accès aux fixtures locales pour la liste et le détail. Les composants se concentrent sur le rendu et l’interaction. » **Niveau :** débutant. **Référence :** `services/portfolio.service.ts`.
13. **Question :** Que signifie `inject()` ? **Réponse :** « Il demande une dépendance au conteneur Angular dans un contexte d’injection, ici dans les champs des services et composants. Angular résout l’instance à partir des providers déclarés. » **Niveau :** intermédiaire. **Référence :** composants/services Portfolio et Simulation.
14. **Question :** Pourquoi `@Service()` ? **Réponse :** « Le projet Angular 22 utilise ce décorateur pour marquer les services et les rendre disponibles via DI à la racine. Les composants consomment ensuite ces instances avec `inject()`. » **Niveau :** intermédiaire. **Référence :** `portfolio.service.ts`, `simulation-api.service.ts`.
15. **Question :** Pourquoi Reactive Forms au lieu de Signal Forms ? **Réponse :** « Les SDD retiennent explicitement Reactive Forms comme objectif pédagogique pour les groupes, contrôles, validators et états de validation. Je garde donc le choix documenté et ne le remplace pas par Signal Forms. » **Niveau :** débutant. **Référence :** `esg-simulation-form.ts`.
16. **Question :** Quelle différence entre `touched`, `dirty` et `invalid` ? **Réponse :** « `touched` reflète une interaction suivie d’une perte de focus, `dirty` un changement de valeur, et `invalid` l’échec d’une règle. L’affichage attend interaction ou tentative d’envoi. » **Niveau :** intermédiaire. **Référence :** formulaire.
17. **Question :** Pourquoi `provideHttpClient()` ? **Réponse :** « Il fournit la configuration standalone globale nécessaire pour injecter `HttpClient`, sans NgModule. Les services peuvent ensuite recevoir le client via DI. » **Niveau :** débutant. **Référence :** `app.config.ts`.
18. **Question :** Pourquoi mettre les requêtes dans `SimulationApiService` ? **Réponse :** « Le service possède l’URL, les méthodes HTTP typées et la conversion d’erreurs; la page ne gère que l’interface. » **Niveau :** intermédiaire. **Référence :** `simulation-api.service.ts`.
19. **Question :** Qu’est-ce que retourne `HttpClient` ? **Réponse :** « Ses méthodes retournent des Observables froids; l’opération part à l’abonnement, et l’Observable HTTP émet puis complète ou échoue. Cela permet de composer le flux et de traiter succès et erreur séparément. » **Niveau :** intermédiaire. **Référence :** API service et composants.
20. **Question :** Le generic `<SimulationResult>` valide-t-il le JSON runtime ? **Réponse :** « Non. Il donne un type au code TypeScript, mais ne vérifie pas la forme effective du payload à l’exécution. Une validation runtime demanderait une étape dédiée au-delà du type générique. » **Niveau :** avancé. **Référence :** `simulation-api.service.ts`.
21. **Question :** Quelle différence entre `SimulationRequest` et `SimulationResult` ? **Réponse :** « Le premier est l’entrée du POST; le second est la réponse officielle avec ID, portfolio et scores retournés. Le GET de la page résultat recharge cette réponse à partir de son ID. » **Niveau :** débutant. **Référence :** `features/simulations/models/`.
22. **Question :** Où le score ESG est-il calculé ? **Réponse :** « Dans le backend. Angular se contente de rendre le champ `globalScore` retourné; il ne reproduit ni seuils, ni pondération, ni arrondi. » **Niveau :** intermédiaire. **Référence :** SDD, résultat, service.
23. **Question :** Pourquoi un mock HTTP séparé ? **Réponse :** « Il reçoit de vraies requêtes locales POST/GET sans serveur Spring Boot. C’est différent de `of(...)`, qui émet dans le processus Angular sans transport HTTP. » **Niveau :** intermédiaire. **Référence :** `tools/simulation-mock-server.mjs`.
24. **Question :** Comment le mock conserve-t-il un résultat ? **Réponse :** « Il place la réponse POST dans une `Map` indexée par ID et le GET retrouve la même entrée; un ID absent produit 404. La mémoire est perdue au redémarrage du processus mock. » **Niveau :** intermédiaire. **Référence :** serveur mock.
25. **Question :** Pourquoi convertir 404 en erreur dédiée ? **Réponse :** « `SimulationNotFoundError` permet à la page de distinguer une ressource absente d’une panne générique sans exposer `HttpErrorResponse`. Le composant transforme ensuite cette erreur en état UI not-found. » **Niveau :** intermédiaire. **Référence :** API service, résultat.
26. **Question :** Comment fonctionne le résultat en accès direct ? **Réponse :** « Le routeur charge la page lazy; elle lit `id` dans `ActivatedRoute`, appelle GET et rend loading, success, not-found ou error. Ainsi un refresh recharge les données au lieu de dépendre de l’état du formulaire. » **Niveau :** intermédiaire. **Référence :** feature Simulations.
27. **Question :** Quels tests sont présents ? **Réponse :** « 13 tests sur six specs couvrent shell, Dashboard, projection, portefeuille/service et routing. Les formulaires et API ne sont pas encore couverts. » **Niveau :** intermédiaire. **Référence :** `src/app/**/*.spec.ts`.
28. **Question :** Pourquoi pas d’interceptor ? **Réponse :** « Le mapping 404/générique est actuellement limité au service Simulation, qui gère ses deux endpoints. Aucun besoin commun à plusieurs services ne justifie une couche transverse aujourd’hui. » **Niveau :** avancé. **Référence :** TASK-019, `simulation-api.service.ts`.
29. **Question :** L’application utilise-t-elle des guards ou NgRx ? **Réponse :** « Non. Les routes n’ont pas de guards et l’état reste local dans services/composants Signals; il n’y a pas de store NgRx. » **Niveau :** débutant. **Référence :** recherche source et routing.
30. **Question :** Quel point amélioreriez-vous avant une production réelle ? **Réponse :** « Je renforcerais la configuration d’environnements et la validation runtime des réponses API, puis les tests HTTP et résultat. Je corrigerais aussi `lang="en"` alors que l’interface est française. » **Niveau :** avancé. **Référence :** `app.config.ts`, `index.html`, tâches de testing.
