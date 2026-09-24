# ESG Portfolio Simulator — Tasks

## TASK-001 — Initialize Modern Angular Application

### Requirement

Create the Angular application using the current supported Angular version.

### Functional Objective

Have a running Angular application with Git initialized.

### Angular Objective

Understand:

* Angular CLI;
* project structure;
* standalone architecture;
* application bootstrap;
* application configuration.

### Angular Notions

* Angular CLI;
* standalone components;
* `main.ts`;
* `app.ts`;
* `app.config.ts`;
* `app.routes.ts`.

### Prerequisites

None.

### Files

Initial Angular CLI-generated files.

### Tests

Verify that the generated application tests pass.

### Acceptance Criteria

* application starts successfully;
* Angular CLI version is correct;
* Git repository exists;
* default tests pass.

### Difficulty

★☆☆☆☆

### Copilot

No.

---

## TASK-002 — Application Shell

### Requirement

REQ-001.

### Objective

Create the application shell.

### Angular Notions

* component template;
* component styles;
* standalone components;
* semantic HTML;
* component composition;
* responsive layout basics;
* keyboard-accessible navigation and visible focus.

### Acceptance Criteria

* header, navigation, main content area, and footer remain present across route navigation;
* all navigation items are reachable by keyboard and have visible focus;
* the shell remains usable at desktop, tablet, and mobile widths without horizontal scrolling.

### Copilot

No.

---

## TASK-003 — Dashboard and Signals

### Requirement

REQ-002.

### Objective

Create the dashboard and display portfolio summary data.

### Angular Notions

* Signals;
* `signal()`;
* `computed()`;
* template signal consumption.

### Copilot

No.

---

## TASK-004 — Portfolio List

### Requirement

REQ-003.

### Objective

Display a collection of portfolios.

### Angular Notions

* `@for`;
* track expressions;
* typed models;
* component rendering.

### Copilot

No.

---

## TASK-005 — Portfolio Card

### Requirement

REQ-003.

### Objective

Create a reusable portfolio card.

### Angular Notions

* component inputs;
* signal inputs;
* component composition.

### Copilot

No.

---

## TASK-006 — Parent / Child Communication

### Requirement

REQ-003 / REQ-014.

### Objective

Allow the portfolio list and portfolio card to communicate.

### Angular Notions

* inputs;
* outputs;
* signal-based inputs/outputs;
* event handling.

### Copilot

No.

---

## TASK-007 — Content Projection

### Requirement

NFR-005 / educational objective.

### Objective

Create a realistic reusable container/card using projected content.

### Angular Notions

* `ng-content`;
* content projection;
* projection versus inputs.

### Copilot

No.

---

## TASK-008 — Routing

### Requirement

REQ-014.

### Objective

Navigate between dashboard and portfolio pages.

### Angular Notions

* Router;
* routes;
* `routerLink`;
* `router-outlet`.

The root route configuration owns global composition. Feature route files own their feature routes; TASK-010 defines the lazy-loading boundary.

### Copilot

No.

---

## TASK-009 — Portfolio Detail

### Requirement

REQ-005.

### Objective

Display a portfolio using a route parameter.

### Angular Notions

* route parameters;
* injected Router services;
* feature page composition.

### Copilot

No.

---

## TASK-010 — Lazy Loading

### Requirement

REQ-014 / REQ-018 / NFR-002.

### Objective

Create a meaningful lazy-loaded feature boundary.

### Angular Notions

* lazy routes;
* feature boundaries;
* route configuration.

The dashboard, portfolios, and simulations route trees are the feature boundaries. The root route configuration loads each feature lazily and keeps only global composition and redirects.

### Copilot

No.

---

## TASK-011 — Portfolio Service

### Requirement

REQ-003 / REQ-004.

### Objective

Move portfolio data access outside components.

### Angular Notions

* Dependency Injection;
* `inject()`;
* service design;
* state ownership.

### Copilot

No.

---

## TASK-012 — Portfolio Search

### Requirement

REQ-004.

### Objective

Implement portfolio search.

### Angular Notions

* signals;
* derived state;
* search state.

TASK-012 defines the UI search state and derived filtered view. It does not make a second data-loading implementation.

### Copilot

No.

---

## TASK-013 — Asynchronous Search with RxJS

### Requirement

REQ-004.

### Objective

Connect the search state to an asynchronous data flow without duplicating TASK-012.

### Angular Notions

* Observable;
* debounce;
* `switchMap`;
* cancellation;
* RxJS versus Signals.

The input and HTTP stream use RxJS for debounce and cancellation. Results, loading, empty, and error values are exposed to the template through Signals.

### Copilot

No.

---

## TASK-014 — Loading / Empty / Error States

### Requirement

REQ-011 / REQ-012 / REQ-013.

### Objective

Implement explicit asynchronous UI states.

### Angular Notions

* state modeling;
* signals;
* template control flow;
* `@if`.

### Acceptance Criteria

* loading, success, empty, and error states are distinct;
* error messages do not expose unnecessary technical details;
* state transitions are covered by component or feature-service tests.

### Copilot

No.

---

## TASK-015 — ESG Simulation Form

### Requirement

REQ-006 / REQ-007.

### Objective

Create the simulation form.

### Angular Notions

* Reactive Forms;
* `FormGroup`;
* `FormControl`;
* validators;
* form submission.

Reactive Forms are retained intentionally for this project to learn typed controls, groups, validators, and validation state. Signal Forms are not substituted automatically.

### Tests

Vitest tests cover required fields, form submission blocking, and accessible validation presentation.

### Copilot

No.

---

## TASK-016 — Advanced Validation

### Requirement

REQ-007.

### Objective

Implement and display validation rules correctly.

### Angular Notions

* custom validators;
* validation state;
* reusable validation logic.

Built-in validators are preferred; custom validators are used only where the documented rules cannot be expressed with them.

### Tests

Vitest tests cover the carbon emission lower bound, all percentage bounds, understandable messages, and association of errors with controls.

### Copilot

No.

---

## TASK-017 — Simulation API

### Requirement

REQ-006 / REQ-010 / REQ-018.

### Objective

Submit a simulation to the backend.

### Angular Notions

* HttpClient;
* `provideHttpClient()`;
* API services;
* typed HTTP calls;
* Observables.

The task must configure Angular 22 HttpClient with `provideHttpClient()`, obtain the backend base URL from application configuration, and select an explicit controlled mock API or service-level mock during development. The mock must follow the same typed contracts as the backend.

### Tests

Vitest HTTP tests verify the POST request, typed response handling, and mapping of HTTP failures to application state.

### Copilot

No.

---

## TASK-017A — ESG Calculation Contract and Tests

### Requirement

REQ-008 / REQ-009 / REQ-010 / REQ-017.

### Objective

Make the ESG calculation contract explicit without duplicating the business rule in Angular.

### Scope

* verify the backend environmental thresholds;
* verify the 40/30/30 global weighting;
* verify backend `BigDecimal` calculation and two-decimal `HALF_UP` rounding;
* define the `SimulationResult` fields consumed by the frontend;
* test that Angular displays the official backend result.

The backend remains the source of truth. Angular does not implement a second authoritative ESG calculator.

### Tests

Vitest tests cover the API result contract, boundary-value presentation, and display of the returned rounded global score. Backend calculation tests are owned by the backend project; they are not reimplemented in the Angular test suite.

### Acceptance Criteria

* the API contract documents environmental score, social score, governance score, and global score;
* the backend contract states `BigDecimal` and `HALF_UP` rounding;
* the frontend displays the returned official value without recalculating it;
* test coverage is traceable to REQ-008, REQ-009, and REQ-010.

### Copilot

No.

---

## TASK-018 — Simulation Result

### Requirement

REQ-010 / REQ-014.

### Objective

Display the simulation result.

### Angular Notions

* result state;
* route navigation;
* reusable presentation components.

After POST, navigate to `/simulations/:id`. On direct navigation or browser refresh, load the official result with `GET /api/v1/esg/simulations/:id`. The page must display the backend-provided rounded global score and must not replace it with a competing frontend calculation.

### Tests

Vitest tests cover successful result display, loading, not-found, error, direct navigation, and refresh-equivalent route loading.

### Copilot

No.

---

## TASK-019 — HTTP Errors and Interceptor

### Requirement

REQ-013.

### Objective

Centralize appropriate HTTP error handling.

An interceptor is added only if a cross-cutting concern such as consistent transport error normalization is demonstrated. Feature-specific messages remain in feature services. If no cross-cutting need exists, this task is a comparison exercise and does not add an interceptor.

### Angular Notions

* HTTP interceptors;
* error handling;
* infrastructure versus feature concerns.

### Copilot

Potentially useful, but only after understanding the concept.

---

## TASK-020 — Advanced Dependency Injection

### Requirement

REQ-018.

### Objective

Evaluate DI beyond basic services only when the application needs a real configuration, mock, or feature-scoped dependency.

### Angular Notions

* injection tokens;
* providers;
* provider scopes;
* hierarchical DI.

If no such need exists, compare these concepts pedagogically without adding artificial production code.

### Copilot

No.

---

## TASK-021 — View and Content Queries

### Requirement

NFR-005 / educational architecture objective.

### Objective

Evaluate queries in a realistic component interaction, such as a reusable projected container that genuinely needs access to projected or child content.

### Angular Notions

* signal-based view queries;
* signal-based content queries;
* lifecycle implications.

If inputs, outputs, and template bindings solve the interaction, queries remain optional and are not introduced into the application.

### Copilot

No.

---

## TASK-022 — Pipes and Directives

### Requirement

REQ-003 / REQ-010.

### Objective

Create an ESG presentation abstraction only if formatting or threshold presentation is not clearer with ordinary template bindings.

### Angular Notions

* custom pipes;
* custom directives;
* template transformation versus behaviour.

The concept is optional when no concrete presentation need exists.

### Copilot

No.

---

## TASK-023 — Performance

### Requirement

NFR-002.

### Objective

Improve rendering and loading behaviour where justified.

### Angular Notions

* modern change detection;
* zoneless;
* lazy loading;
* `@defer`;
* efficient list rendering.

Zoneless Angular and `@defer` are optional comparisons unless profiling or a concrete loading boundary justifies them. Lazy loading and list tracking remain required where they directly support the documented routes and portfolio list.

### Copilot

Potentially useful for review only.

---

## TASK-024 — Component Tests

### Requirement

REQ-017.

### Objective

Test important UI behaviour.

### Angular Notions

* Angular TestBed;
* component fixtures;
* DOM assertions;
* user interaction.

Vitest tests cover shell accessibility, portfolio rendering, loading/empty/error states, form presentation, and official result display.

### Copilot

No.

---

## TASK-025 — Service and HTTP Tests

### Requirement

REQ-017.

### Objective

Test services and HTTP interactions.

### Angular Notions

* HTTP testing;
* service testing;
* mocked backend interactions.

Vitest tests cover portfolio and simulation services, `provideHttpClient()`-compatible HTTP testing, typed responses, and error mapping.

### Copilot

No.

---

## TASK-026 — Routing Tests

### Requirement

REQ-017.

### Objective

Test navigation behaviour.

### Angular Notions

* router testing;
* route parameters;
* navigation assertions.

Vitest tests cover lazy feature navigation, portfolio route parameters, simulation routes, and direct or refreshed result navigation.

### Copilot

No.

---

## TASK-027 — SSR and Hydration

### Requirement

Architecture exploration.

### Objective

Evaluate SSR/hydration after the client application is complete.

This is an optional architecture comparison. It does not change the initial client-only scope.

### Angular Notions

* SSR;
* hydration;
* browser/server execution;
* architectural trade-offs.

### Copilot

No.

---

## TASK-028 — Security

### Requirement

REQ-018 / security.

### Objective

Review frontend security concerns.

Sanitization is discussed as an optional comparison because user-controlled rich HTML is outside the initial scope. The task must not add authentication or a new security feature.

### Angular Notions

* sanitization;
* XSS;
* safe rendering;
* authentication boundary.

### Copilot

No.

---

## TASK-029 — Architecture Review

### Requirement

All requirements.

### Objective

Review the complete application against the SDD documentation.

### Activities

* requirements traceability;
* architecture review;
* code review;
* test coverage review;
* Angular concepts review;
* refactoring;
* technical debt identification.

### Copilot

Optional review assistant only.

---

## Traceability Matrix

| Requirement | Specification | Task(s) | Test / acceptance evidence |
| --- | --- | --- | --- |
| REQ-001 | Application shell and accessibility | TASK-002 | Shell structure, keyboard navigation, visible focus, responsive shell |
| REQ-002 | Dashboard | TASK-003, TASK-008 | Dashboard rendering and navigation tests |
| REQ-003 | Portfolio model, list, and card | TASK-004, TASK-005, TASK-006, TASK-011 | Component rendering and portfolio service tests |
| REQ-004 | Portfolio search | TASK-011, TASK-012, TASK-013, TASK-014 | RxJS debounce/cancellation and filtered-result tests |
| REQ-005 | Portfolio detail | TASK-009, TASK-014 | Route parameter, detail rendering, not-found tests |
| REQ-006 | Simulation form and API | TASK-015, TASK-017, TASK-018 | Form submission and typed POST tests |
| REQ-007 | Validation | TASK-015, TASK-016 | Reactive Forms validator and error-association tests |
| REQ-008 | Environmental score contract | TASK-017A | Backend threshold contract and result-presentation tests |
| REQ-009 | Global score contract and rounding | TASK-017A | `BigDecimal`/`HALF_UP` backend contract and official-result display tests |
| REQ-010 | Simulation result | TASK-017A, TASK-018 | Result loading, display, refresh, and error tests |
| REQ-011 | Loading state | TASK-014, TASK-018 | Loading-state component tests |
| REQ-012 | Empty state | TASK-014 | Empty portfolio and empty result tests |
| REQ-013 | Error state | TASK-014, TASK-019 | User-facing error mapping tests |
| REQ-014 | Navigation and browser navigation | TASK-006, TASK-008, TASK-009, TASK-010, TASK-018, TASK-026 | Router and direct-navigation tests |
| REQ-015 | Responsive interface | TASK-002, TASK-029 | Responsive acceptance checks and review |
| REQ-016 | Accessibility | TASK-002, TASK-015, TASK-016, TASK-024, TASK-029 | Labels, keyboard, focus, and associated-error tests/checks |
| REQ-017 | Vitest test strategy | TASK-017A, TASK-024, TASK-025, TASK-026 | Component, service, HTTP, form, ESG, and routing tests |
| REQ-018 | Feature architecture and API boundary | TASK-010, TASK-011, TASK-017, TASK-020, TASK-029 | Architecture and dependency-direction review |

All Angular tests in this matrix use Vitest through the Angular 22 CLI test builder. TASK-027 and the optional parts of TASK-019, TASK-020, TASK-021, TASK-022, TASK-023, and TASK-028 are learning or review activities and do not add functional scope.
