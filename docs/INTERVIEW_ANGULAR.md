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
| DI TASK-020 | `@Service()`, `InjectionToken`, provider `useFactory`; `useValue` remplace des dépendances dans TestBed. | Services, `api.config.ts`, `app.config.ts`, specs |
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
| HTTP interceptor | `HttpInterceptorFn` normalise les erreurs de transport et conserve leur statut; aucun `clone()` car aucune requête n'est modifiée. | `core/http/http-error-normalization.interceptor.ts`, `app.config.ts` |
| Custom Pipe | `EsgScorePipe` formate les scores reçus à deux décimales sans les recalculer. | `shared/pipes/esg-score.pipe.ts`, résultat Simulation |
| Custom Directive | `EsgScorePresentationDirective` applique des classes selon le rôle UI fourni, sans seuil métier. | `shared/directives/esg-score-presentation.directive.ts`, résultat Simulation |
| Contrats API typés | Request et Result guident l’usage TS; pas de validation runtime du JSON. | `features/simulations/models/` |
| Gestion erreurs HTTP | L'interceptor produit `HttpTransportError`; les services conservent le mapping métier du 404 et les pages affichent l'UX. | interceptor, services API, pages |
| Vitest / TestBed | Tests composants et services emploient TestBed et fixtures. | `src/app/**/*.spec.ts` |
| Tests composant/service/HTTP/routing | Composant, service Portfolio et routing sont couverts; tests HTTP absents. | 6 specs existantes; voir section Tests |

## 4. Les 15 questions les plus probables

1. **Q : Comment l’application démarre-t-elle ?** **R :** « `main.ts` appelle `bootstrapApplication` avec `App` et `appConfig`. La configuration racine fournit Router et HttpClient. »
2. **Q : Pourquoi des composants standalone ?** **R :** « Chaque composant déclare ses imports directement. Cela supprime le NgModule d’assemblage et rend les dépendances locales visibles. »
3. **Q : Quelle différence entre `signal()` et `computed()` ?** **R :** « `signal()` contient un état modifiable. `computed()` dérive une valeur des Signals qu’il lit, comme les portfolios filtrés. »
4. **Q : Pourquoi Signals et RxJS coexistent-ils ?** **R :** « RxJS organise les événements, délais et annulations. Le Signal expose ensuite l’état courant que le template doit afficher. »
5. **Q : Pourquoi `debounceTime` et `switchMap` dans la recherche ?** **R :** « Le debounce évite de lancer le travail à chaque caractère. `switchMap` désabonne l’ancien timer quand arrive le prochain terme stabilisé. »
6. **Q : Comment fonctionnent Inputs et Outputs ?** **R :** « La carte reçoit un Portfolio par input requis; elle émet l’ID au clic. Le parent choisit la navigation, ce qui garde la carte réutilisable. »
7. **Q : Qu'est-ce qu'un HTTP interceptor Angular et à quoi sert-il ?** **R :** « `HttpInterceptorFn` est un middleware de la chaîne HttpClient qui peut traiter les requêtes et réponses de façon transverse. Ici il normalise les erreurs HTTP en conservant leur statut; les services gardent l'interprétation métier. »
8. **Q : Pourquoi un PortfolioService ?** **R :** « Il centralise l’accès aux fixtures utilisées par liste et détail. Les composants restent centrés sur rendu et interactions. »
9. **Q : Que fait `inject()` ?** **R :** « Il demande une dépendance au conteneur DI depuis un contexte Angular. Ici il fournit Router, services et tokens sans constructeur. »
10. **Q : Pourquoi lazy-load les features ?** **R :** « La racine charge les routes de feature à la navigation avec `loadChildren`. Cela sépare les features et évite de charger leur code dans le premier chunk de routes. »
11. **Q : Pourquoi Reactive Forms ?** **R :** « C’est le choix pédagogique des SDD pour apprendre FormGroup, FormControl, validators et état de validation. Le projet ne remplace pas ce choix par Signal Forms. »
12. **Q : Comment distinguer `touched`, `dirty` et `invalid` ?** **R :** « `touched` indique une interaction suivie d’une sortie du champ; `dirty`, une valeur modifiée; `invalid`, un échec de règle. Le template attend interaction ou tentative d’envoi. »
13. **Q : Pourquoi le composant n’appelle-t-il pas HttpClient ?** **R :** « SimulationApiService encapsule URL et POST/GET; la page orchestre l’interface. L’interceptor traite le transport commun et les services gardent les erreurs métier. »
14. **Q : Le type `http.post<SimulationResult>()` valide-t-il la réponse reçue ?** **R :** « Non, le generic sécurise l’usage à la compilation seulement. Il ne vérifie pas la forme du JSON à l’exécution. »
15. **Q : Pourquoi Angular ne calcule-t-il pas `globalScore` ?** **R :** « Le backend est la source de vérité ESG. Angular affiche directement la valeur reçue, ce qui évite une règle concurrente et des écarts d’arrondi. »

### TASK-020 — DI avancée réellement utilisée

Dans ce projet, `@Service()` marque les services comme automatiquement disponibles au système DI Angular; `inject()` demande leurs dépendances au contexte d’injection. La déclaration Angular installée expose aussi l’option `autoProvided: false`, mais le projet ne l’utilise pas et ne déclare pas de providers de service par scope.

`API_BASE_URL` est un `InjectionToken<string>` parce qu’une URL est une valeur de configuration, pas une classe. Son provider `useFactory` choisit la valeur dev/prod dans `app.config.ts`, puis `PortfolioApiService` et `SimulationApiService` la reçoivent via `inject()`.

Les tests utilisent `useValue` pour fournir une chaîne d’URL ou un faux service à TestBed. C’est un remplacement local au test, pas un provider de production. `useClass`, `useExisting`, les providers de route/composant et hierarchical DI ne sont pas utilisés; aucun besoin métier actuel ne justifie un scope plus étroit.

Questions orales TASK-020 :

1. **Q : Qu’est-ce que la Dependency Injection Angular ?** **R :** « C’est le mécanisme où un injecteur fournit des dépendances aux classes qui les demandent. Dans ce projet, il résout par exemple PortfolioService vers PortfolioApiService, puis HttpClient et API_BASE_URL. »
2. **Q : Pourquoi utiliser `inject()` ?** **R :** « `inject()` demande une dépendance à l’injecteur dans un contexte Angular, au lieu de la construire dans la classe. PortfolioService reçoit ainsi son API service géré par Angular. »
3. **Q : Pourquoi un `InjectionToken` pour `API_BASE_URL` ?** **R :** « Une URL est une valeur string, pas une classe à instancier. Le token donne un identifiant typé que `app.config.ts` relie à l’URL active. »
4. **Q : Qu’est-ce qu’un provider ?** **R :** « Un provider indique à Angular comment fournir une dépendance identifiée par un token. Ici `app.config.ts` configure Router, HttpClient et API_BASE_URL au niveau application. »
5. **Q : Pourquoi `useFactory` pour l’URL ?** **R :** « La fabrique choisit une valeur selon `isDevMode()`. Cela garde le choix dev/prod dans la configuration, plutôt que dans chaque service API. »
6. **Q : Différence entre un service injectable et une valeur injectée ?** **R :** « Un service est une classe gérée par le système DI; une valeur injectée peut être une chaîne ou un objet associé à un token. Ici les services injectent à la fois HttpClient et API_BASE_URL. »
7. **Q : Pourquoi ne pas mettre tous les providers au niveau des composants ?** **R :** « Un provider de composant crée une portée plus locale et peut produire une instance distincte par sous-arbre. Les services Portfolio et API sont partagés et sans état local à isoler, donc ils restent auto-fournis. »
8. **Q : Qu’est-ce que hierarchical DI ?** **R :** « Angular cherche une dépendance dans une hiérarchie d’injecteurs, du plus proche vers les parents. Le projet n’a pas de provider de route/composant qui exploite cette hiérarchie. »
9. **Q : Pourquoi `useClass` et `useExisting` ne sont-ils pas utilisés ?** **R :** « Nous n’avons ni implémentation interchangeable à sélectionner par classe ni alias de token à partager. `useValue` suffit aux remplacements simples des tests. »
10. **Q : Quel est le chemin DI de Portfolio ?** **R :** « PortfolioList demande PortfolioService; celui-ci demande PortfolioApiService. L’API service demande ensuite HttpClient et API_BASE_URL, tous résolus par les providers Angular. »

Relances pièges :

- **Est-ce que `inject()` signifie que le service est singleton ?** → Non, `inject()` résout une dépendance; le provider et son scope déterminent l’instance. `@Service()` est auto-fourni selon l’API Angular utilisée ici.
- **Pourquoi ne pas mettre l’URL dans le service ?** → Le token permet à la configuration d’injecter une valeur différente selon l’environnement, sans lier le service à une adresse locale.
- **Pourquoi ajouter un provider au niveau composant ?** → Pour isoler une instance dans un sous-arbre lorsqu’un besoin réel existe; ce projet n’a pas cette exigence.

### TASK-021 — View and Content Queries

**Réellement utilisé :** `input()` / `input.required()`, `output()`, bindings de template, `@for` et `<ng-content />`. Aucune view query ou content query Angular n’est actuellement utilisée en production. Les `querySelector()` / `nativeElement` éventuellement présents dans les specs inspectent le DOM de test; ce ne sont pas des queries Angular.

**Étudié mais non utilisé :** `viewChild()` / `viewChildren()` donnent accès aux éléments ou composants présents dans la vue du composant. `contentChild()` / `contentChildren()` donnent accès au contenu fourni par le parent via `ng-content`. Les variantes signal-based exposent le résultat comme un Signal et suivent les changements de présence; une query optionnelle peut être absente.

**Pourquoi aucune query n’a été ajoutée :** dans `PortfolioList → PortfolioCard`, `input.required<Portfolio>()` transmet la donnée, `output<string>()` transmet l’ID et le binding déclare l’interaction. Le parent n’a pas besoin d’appeler directement une méthode ou manipuler l’enfant. Dans `DetailSection`, un input fournit le titre et `<ng-content />` projette le corps; le composant ne l’inspecte ni ne le coordonne.

**Lifecycle :** les anciennes queries `@ViewChild` / `@ContentChild` sont généralement consommées après l’initialisation de la vue ou du contenu. Les queries signal-based exposent une valeur réactive qui suit l’apparition ou la disparition des éléments, sans devoir synchroniser manuellement une propriété depuis un hook. Il faut toujours tenir compte d’une valeur optionnelle absente.

> Ajouter une query uniquement pour démontrer l’API serait artificiel et contraire à NFR-005.

Questions orales TASK-021 :

1. **Q : Qu’est-ce qu’une view query ?** **R :** « C’est un moyen pour un composant d’obtenir une référence à un élément ou composant de sa propre vue. Dans ce projet, aucun besoin d’accès impératif de ce type n’existe. »
2. **Q : Quelle différence entre `viewChild()` et `contentChild()` ?** **R :** « `viewChild()` cible la vue déclarée par le composant; `contentChild()` cible un enfant projeté par son parent via `ng-content`. `DetailSection` projette du contenu mais n’a pas besoin de le lire. »
3. **Q : Pourquoi `ng-content` ne nécessite-t-il pas automatiquement `contentChild()` ?** **R :** « La projection suffit à afficher le contenu fourni par le parent. Une query ne devient utile que si le conteneur doit réellement détecter ou coordonner ce contenu. »
4. **Q : Pourquoi pas `viewChild()` dans `PortfolioList` ?** **R :** « La liste fournit les données par input et reçoit l’ID par output. Elle navigue à partir de cet événement sans accéder à l’instance de la carte. »
5. **Q : Différence entre query Angular et `querySelector()` ?** **R :** « Une query Angular cible une vue ou du contenu projeté et suit son cycle de rendu. `querySelector()` est une API DOM utilisée ici dans des specs, pas une query de composant en production. »
6. **Q : Que change une signal-based query ?** **R :** « Son résultat est lu comme un Signal et se met à jour quand la présence de l’élément ciblé évolue. Aucune signal query n’est utilisée dans ce projet. »
7. **Q : Quand une query devient-elle pertinente ?** **R :** « Quand un composant doit réellement accéder à un enfant ou contenu projeté pour une interaction impossible à exprimer proprement avec input, output ou binding. Il faut pouvoir nommer ce besoin concret. »
8. **Q : Pourquoi ne pas en ajouter une pour démontrer Angular ?** **R :** « Une API sans besoin réel ajoute du couplage et du code à maintenir. Ici les bindings et la projection répondent déjà aux interactions, conformément à NFR-005. »

### TASK-022 — Pipe et Directive de présentation

Le projet utilise `EsgScorePipe` pour afficher les quatre scores du `SimulationResult` à deux décimales; la pipe transforme le texte d’affichage sans modifier la donnée officielle. `EsgScorePresentationDirective` reçoit un rôle UI (`official` ou `indicator`) et applique des classes CSS à son élément hôte; elle ne lit pas le score et ne connaît aucun seuil.

```text
Pipe       valeur → texte formaté
Directive  élément + rôle de présentation → classes CSS
```

Questions orales TASK-022 :

1. **Q : Pourquoi créer un custom Pipe pour les scores ?** **R :** « Les quatre scores du résultat partagent un format fixe à deux décimales. La pipe centralise cette règle d’affichage sans changer les nombres reçus. »
2. **Q : Pourquoi le Pipe ne calcule-t-il pas le score ESG ?** **R :** « Le backend fournit le score officiel et reste la source de vérité. La pipe ne fait que transformer sa représentation en texte. »
3. **Q : Quelle différence entre Pipe et Directive ?** **R :** « Le Pipe transforme une valeur pour l’affichage. La Directive ajoute une présentation à un élément hôte; ici elle pose des classes à partir d’un rôle fourni. »
4. **Q : Pourquoi mettre ces abstractions dans `shared` ?** **R :** « Elles sont indépendantes des features et réutilisables par d’autres vues. Elles dépendent du contrat numérique et d’un niveau de présentation, pas d’un service Simulation. »
5. **Q : Que signifie standalone pour ces abstractions ?** **R :** « Angular les rend importables directement dans le composant qui les utilise, sans NgModule. Le composant résultat les déclare dans ses `imports`. »
6. **Q : Comment la Directive accède-t-elle à son élément ?** **R :** « Elle utilise les host bindings Angular pour appliquer les classes sur l’élément portant l’attribut. Elle n’a pas besoin de manipuler le DOM directement. »
7. **Q : Pourquoi aucun seuil ESG n’est-il dans la Directive ?** **R :** « Les seuils sont une règle backend. Le template lui fournit seulement le rôle visuel `official` ou `indicator`, que la directive convertit en classes. »
8. **Q : Quand un binding classique suffirait-il ?** **R :** « Pour un seul élément ou une classe isolée, un binding `[class]` est souvent plus simple. La directive devient utile si plusieurs vues partagent réellement ce comportement. »

## 5. 10 relances pièges

1. **Pourquoi ne pas utiliser RxJS partout ?** → RxJS décrit les flux asynchrones; Signals exposent simplement un état courant au template.
2. **Pourquoi ne pas rendre tout l’état global ?** → Le projet garde l’état au scope qui en a besoin; la recherche et le formulaire sont locaux.
3. **Que fait réellement `switchMap` ici ?** → Il remplace le timer simulé précédent après le debounce; la recherche actuelle n’est pas HTTP.
4. **Que se passe-t-il au refresh de `/simulations/:id` ?** → La page relit l’ID et fait un GET pour récupérer le résultat depuis le serveur.
5. **Le generic TypeScript valide-t-il un JSON mal formé ?** → Non; une validation runtime n’est pas présente dans cette implémentation.
6. **Le mock calcule-t-il les scores ?** → Non; il renvoie des valeurs de fixture statiques et ne représente pas la règle métier.
7. **Où doit vivre un message d’erreur métier ?** → Dans la feature qui connaît le contexte; le service transforme l’erreur transport en type applicatif.
8. **Pourquoi l’interceptor ne crée-t-il pas `SimulationNotFoundError` ?** → Ce type exprime une règle de la feature Simulation; l’interceptor ne conserve que le statut transport et le service fait le mapping.
9. **Route parameter ou query parameter ?** → `:id` identifie la ressource et appartient au chemin; un query parameter est plutôt un filtre ou une option de vue.
10. **Que manque-t-il avant production ?** → Tests HTTP/form/résultat, validation runtime éventuelle des contrats, configuration d’environnement robuste et vérification accessibilité automatisée.

## 6. Ce que je n’ai PAS utilisé

- Route guards/resolvers — le projet n’en déclare pas.
- NgRx/store global — l’état reste local.
- `Subject` / `BehaviorSubject` — absents; les Observables HTTP et interop sont utilisés.
- `AsyncPipe` — les flux sont consommés avec `toSignal()` ou `subscribe()`.
- Pipes/directives personnalisés — `EsgScorePipe` et `EsgScorePresentationDirective` sont utilisés pour la présentation des scores; aucune règle ESG métier n'y est implémentée.
- SSR/hydration, zoneless et `@defer` — non implémentés.
- Queries Angular (`viewChild`, `viewChildren`, `contentChild`, `contentChildren`) — étudiées conceptuellement, absentes de la production.

## 7. Réponse finale de 60 secondes

« Je suis développeur Java/fullstack et j’ai construit ce projet pour apprendre Angular moderne sur un cas concret. L’application est standalone, organisée par features et route lazy-loaded; les composants délèguent données et HTTP aux services. J’ai utilisé Signals pour l’état local et RxJS pour le flux de recherche avec debounce et cancellation, puis Reactive Forms pour saisir les indicateurs. Le formulaire passe par un API service typé, et un mock HTTP Node permet de pratiquer POST/GET sans Spring Boot. Je ne recalcule pas l’ESG dans Angular : le backend reste autoritaire. J’ai aussi commencé les tests avec Vitest/TestBed pour le shell, les composants, le service Portfolio et le routing; les tests HTTP et formulaire restent à faire dans les tasks prévues. »
