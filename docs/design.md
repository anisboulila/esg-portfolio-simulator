# ESG Portfolio Simulator — Design

## 1. Design Principles

The frontend follows these principles:

* feature-oriented organization;
* explicit state ownership;
* separation between UI and data access;
* strong TypeScript typing;
* small and focused components;
* reusable components where justified;
* modern Angular APIs;
* tests focused on observable behaviour.

---

## 2. Component Design

Components are divided into:

### Pages

Pages coordinate a feature.

They may:

* obtain route parameters;
* interact with feature services;
* compose child components;
* manage page-level state.

### Components

Reusable components display or manipulate a focused part of the UI.

They should avoid knowing how backend communication works.

---

## 3. State Management

Local component state should use Angular Signals when appropriate.

Example conceptual model:

```text
loading = signal(false)
portfolios = signal<Portfolio[]>([])
error = signal<string | null>(null)
```

Derived state should use `computed()` when appropriate.

Effects should only be used when a real side effect is required, such as synchronizing a non-Angular browser API. They are not a replacement for computed state or service calls.

A global state management library must not be introduced unless the application demonstrates a real need for it.

---

## 4. Component Communication

Parent-child communication should use modern Angular APIs.

Inputs and outputs should be used when component boundaries require communication. Signal inputs and outputs are the preferred modern APIs for new components.

The project should also demonstrate:

* signal inputs and outputs when a real parent-child boundary requires them;
* content projection when a reusable container needs caller-defined content;
* content queries or view queries only when a concrete component interaction cannot be expressed with inputs, outputs, or template bindings.

These concepts must be introduced through realistic features.

---

## 5. RxJS

Signals and RxJS have distinct responsibilities:

* Signals represent local UI state and state exposed to the view;
* RxJS represents asynchronous operations, HTTP streams, debounce, cancellation, and stream composition.

RxJS should be used where asynchronous streams provide value.

Examples:

* HTTP requests;
* search streams;
* debouncing;
* cancellation;
* composition of asynchronous operations.

Signals should not replace RxJS mechanically, and the same search flow must not be implemented twice. The portfolio search input and request flow use RxJS for debounce and cancellation; the resulting portfolios, loading state, and error state are exposed to the template through Signals.

---

## 6. Dependency Injection

Angular Dependency Injection must be used for:

* feature services;
* API services;
* infrastructure concerns;
* reusable dependencies.

The project should demonstrate where useful:

* `inject()`;
* provider scopes;
* injection tokens;
* hierarchical injectors.

Advanced DI is optional unless a real configuration, mock, or feature-scoped dependency requires it. It must not be added only to demonstrate an API.

---

## 7. Forms

The simulation form intentionally uses Angular Reactive Forms. This is a pedagogical choice to learn typed controls, groups, validators, validation state, and submission. Signal Forms are not introduced automatically in this project; they may be compared conceptually later without replacing the selected implementation.

Validation should be separated conceptually into:

```text
form structure
+
validation rules
+
presentation of validation errors
```

Custom validators should only be introduced when built-in validators are insufficient.

---

## 8. HTTP

HTTP communication must use Angular 22's modern standalone HttpClient configuration with `provideHttpClient()` in application providers.

The backend base URL must come from application configuration rather than being embedded in components. During development, a controlled mock API or service-level mock must be selected explicitly and must expose the same typed API contracts as the backend.

Components must not directly call HTTP endpoints.

Example conceptual dependency:

```text
Page
 ↓
Feature Service
 ↓
API Service
 ↓
HttpClient
 ↓
Backend
```

---

## 9. Routing

Angular Router is responsible for:

* navigation;
* route parameters;
* lazy loading;
* route-level composition;
* direct navigation and browser refresh.

Feature routes should be isolated from unrelated features. The dashboard owns `/`, the portfolios feature owns `/portfolios`, `/portfolios/:id`, and `/portfolios/:id/simulate`, and the simulations feature owns `/simulations/:id`. These feature route trees are lazy-loaded from the root configuration.

---

## 10. Content Projection

Content projection must be demonstrated using a reusable UI component where it solves a real composition problem.

The goal is to understand:

```html
<ng-content>
```

and when it differs from:

```text
@Input()
```

---

## 11. Queries

The project may demonstrate modern signal-based query APIs when justified.

Examples:

* obtaining a child component reference;
* accessing projected content;
* interacting with template elements.

Queries must not be used merely because they exist. If no concrete interaction needs them, they remain an optional comparison exercise and are not added to production code.

---

## 12. Pipes and Directives

A custom pipe or directive should only be introduced when the application has a concrete use case, such as formatting the backend-provided ESG score or applying a meaningful threshold presentation. Otherwise the concept remains optional and is not forced into the application.

Possible examples:

* ESG score formatting;
* visual treatment of ESG thresholds.

---

## 13. Performance

Performance improvements should be introduced after the basic application works.

Potential topics, evaluated only when they provide a measurable or explainable benefit:

* modern change detection;
* zoneless Angular;
* lazy loading;
* `@defer`;
* avoiding unnecessary computations;
* efficient list rendering.

Zoneless Angular and `@defer` are optional learning topics unless the implemented application exposes a concrete performance scenario for them.

---

## 14. Security

The frontend must:

* avoid unsafe HTML;
* avoid unnecessary direct DOM manipulation;
* avoid exposing secrets;
* treat backend validation as authoritative;
* avoid storing sensitive information unnecessarily.

Sanitization is an optional comparison topic unless the application introduces user-controlled rich HTML, which is outside the initial functional scope.

---

## 15. SSR / Hydration

SSR and hydration are outside the initial bootstrap phase.

They will be evaluated later as an architectural exercise.

The goal is to understand:

* why SSR exists;
* when it provides value;
* hydration;
* browser/server differences.

---

## 16. Testing

The project uses Angular 22's Angular CLI test builder with Vitest. TestBed and Angular testing utilities are used for component, service, HTTP, Reactive Forms, and routing tests.

Tests should remain close to the feature they validate where practical and must cover behaviour rather than implementation details. ESG calculation tests validate the backend contract and display of the returned official result; they do not reimplement the backend business rule as a competing frontend authority.

---

## 17. Educational Rule

No Angular API should be introduced merely as a checkbox.

Each important concept must answer:

1. What problem does it solve?
2. Why is it appropriate here?
3. What alternative exists?
4. What trade-off does it introduce?
