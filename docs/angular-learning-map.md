# Angular Learning Map

## Objective

This document maps project implementation to Angular learning objectives.

The goal is not to learn Angular APIs in isolation.

Each important Angular concept must be encountered through a concrete feature.

---

## Learning Progression

| Task     | Feature        | Main Angular Concept        | Learning Objective                |
| -------- | -------------- | --------------------------- | --------------------------------- |
| TASK-001 | Bootstrap      | Standalone / CLI            | Understand how Angular starts     |
| TASK-002 | Shell          | Components                  | Understand component structure    |
| TASK-003 | Dashboard      | Signals                     | Manage local reactive state       |
| TASK-004 | Portfolio list | `@for`                      | Render collections                |
| TASK-005 | Card           | Inputs                      | Pass data to children             |
| TASK-006 | Card/List      | Outputs                     | Emit events to parents            |
| TASK-007 | UI container   | Content projection          | Understand `ng-content`           |
| TASK-008 | Navigation     | Router                      | Understand SPA navigation         |
| TASK-009 | Detail         | Route params                | React to route state              |
| TASK-010 | Features       | Lazy loading                | Understand feature boundaries     |
| TASK-011 | Data           | DI / Services               | Separate UI and data access       |
| TASK-012 | Search         | Signals                     | Derive UI state                   |
| TASK-013 | Async search   | RxJS                        | Use debounce and cancellation without duplicating UI state |
| TASK-014 | States         | Control flow                | Model UI states                   |
| TASK-015 | Simulation     | Reactive Forms              | Build typed forms                 |
| TASK-016 | Validation     | Validators                  | Model business input rules        |
| TASK-017 | API            | HttpClient / `provideHttpClient()` | Communicate with backend      |
| TASK-017A | ESG contract  | API contracts / testing     | Display the backend-authoritative result |
| TASK-018 | Result         | State / routing             | Compose feature result            |
| TASK-019 | HTTP           | Interceptors                | Compare cross-cutting error handling when justified |
| TASK-020 | DI             | Tokens/providers            | Compare advanced DI for a real dependency need |
| TASK-021 | Components     | Queries                     | Use queries only for a real child/content interaction |
| TASK-022 | UI             | Pipes/directives            | Add a presentation abstraction only when useful |
| TASK-023 | Performance    | Change detection / `@defer` | Optimize intentionally; zoneless and `@defer` optional |
| TASK-024 | Tests          | TestBed + Vitest            | Test components and UI behaviour  |
| TASK-025 | HTTP           | HTTP testing + Vitest       | Test services and HTTP contracts  |
| TASK-026 | Routing        | Router testing + Vitest     | Test navigation                   |
| TASK-027 | SSR            | SSR/hydration               | Optional architecture comparison  |
| TASK-028 | Security       | Sanitization                | Optional security comparison      |
| TASK-029 | Review         | Architecture                | Consolidate knowledge             |

---

## Concepts To Master

By the end of the project, the learner should be able to explain:

### Angular Fundamentals

* Angular CLI;
* application bootstrap;
* standalone components;
* templates;
* component lifecycle;
* dependency injection.

### Modern Angular

* Signals;
* `computed()`;
* `effect()` only for a justified external side effect;
* signal inputs;
* signal outputs;
* signal-based queries when a real interaction requires them;
* modern template control flow, especially `@if` and `@for`; `@switch` is optional unless a multi-state view benefits from it.

### Components

* parent/child relationships;
* inputs;
* outputs;
* content projection;
* reusable components.

### Routing

* routes;
* route parameters;
* navigation;
* lazy loading.

### Services and DI

* service responsibilities;
* `inject()`;
* providers;
* injection tokens;
* provider scopes.

### Reactive Programming

* Observable;
* subscription;
* RxJS operators;
* debounce;
* `switchMap`;
* cancellation;
* Signals versus RxJS.

### Forms

* Reactive Forms;
* controls;
* groups;
* validators;
* validation state;
* why Reactive Forms are retained as a deliberate pedagogical choice in Angular 22.

### HTTP

* HttpClient;
* `provideHttpClient()`;
* typed requests;
* error handling;
* interceptors;
* HTTP testing.

### Performance

* rendering;
* change detection;
* lazy loading;
* `@defer`;
* list tracking;
* zoneless Angular as an optional comparison.

### Testing

* Vitest with Angular 22;
* component tests;
* service tests;
* HTTP tests;
* routing tests;
* Reactive Forms and validation tests;
* ESG result presentation tests.

### Architecture

* feature-oriented architecture;
* state ownership;
* separation of concerns;
* UI versus infrastructure;
* frontend/backend boundary.

---

## Learning Rule

A concept must be explained before being used.

The learner must not be tested on a concept that has not yet been taught.

Concepts marked optional are discussed or compared only when a real project need exists. They are not required for the functional implementation and must not cause artificial features to be added.

For each task:

```text
1. Explain the problem
2. Identify the Angular concepts
3. Teach new concepts
4. Explain why they are appropriate
5. Show architecture
6. Ask at most one short question
7. Correct the answer
8. Implement
9. Explain the files
10. Write tests
11. Validate
12. Move to next task
```

---

## Copilot Rule

Before using Copilot or another AI coding assistant:

```text
COPILOT NÉCESSAIRE ? OUI / NON

POURQUOI ?

CE QU'IL VA GÉNÉRER

CE QUE JE DOIS COMPRENDRE AVANT DE L'UTILISER

PROMPT
```

AI assistance must accelerate learning rather than replace understanding.
