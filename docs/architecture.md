# ESG Portfolio Simulator — Architecture

## 1. General Architecture

The application follows a feature-oriented Angular architecture.

```text
                    Angular Application
                           │
            ┌──────────────┴──────────────┐
            │                             │
         Core                         Features
            │                             │
     Infrastructure          ┌────────────┼────────────┐
                             │            │            │
                         Dashboard    Portfolios   Simulations
                             │            │            │
                             └────────────┴────────────┘
                                          │
                                      Shared UI
```

---

## 2. Directory Structure

Target structure:

```text
src/app/
├── core/
│   ├── http/
│   ├── errors/
│   └── config/
│
├── shared/
│   ├── components/
│   ├── directives/
│   └── pipes/
│
├── features/
│   ├── dashboard/
│   ├── portfolios/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── api/
│   │   └── models/
│   │
│   └── simulations/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── api/
│       └── models/
│
├── app.ts
├── app.config.ts
└── app.routes.ts
```

Authentication is outside the initial scope, so no `core/auth` implementation or placeholder is planned. This structure may evolve during implementation without changing feature ownership.

---

## 3. Dependency Direction

The preferred dependency direction is:

```text
Pages
  ↓
Feature Services
  ↓
API / Infrastructure
```

Shared components must remain independent from specific business features whenever possible.

Core infrastructure must not depend on feature implementations.

---

## 4. State Ownership

State belongs to the smallest scope that needs it.

Examples:

```text
Form state
→ Simulation Form

Portfolio list state
→ Portfolio feature

Global navigation state
→ Application shell
```

A state must not become global simply because it uses Signals.

---

## 5. API Boundary

The backend is considered an external system.

```text
Angular
   │
   │ HTTP
   ▼
Spring Boot API
   │
   ▼
ESG domain
```

The backend is the source of truth for ESG calculations and validation. The frontend must not reproduce backend business rules unnecessarily.

Presentation-only transformations may exist in Angular when required by the UI, but any local ESG preview must be clearly marked as non-authoritative. The official `SimulationResult` returned by the backend is the only value displayed as the business result.

The API layer owns typed contracts for `Portfolio`, `PortfolioEsgIndicators`, `SimulationRequest`, and `SimulationResult`. Feature services coordinate those API calls and expose UI state; pages do not construct HTTP requests directly.

Authoritative business validation remains on the backend.

---

## 6. Error Flow

```text
Backend / HTTP
      ↓
HttpClient
      ↓
API Service
      ↓
Feature Service
      ↓
Page State
      ↓
UI Error State
```

Technical infrastructure details should not leak into the UI.

---

## 7. Routing Architecture

The root application owns global routing.

Feature-specific routes should be defined close to their feature.

Feature ownership is:

* Dashboard: `/`;
* Portfolios: `/portfolios`, `/portfolios/:id`, `/portfolios/:id/simulate`;
* Simulations: `/simulations/:id`.

The dashboard, portfolios, and simulations feature route trees are lazy-loaded from the root route configuration. A simulation result page loads `GET /api/v1/esg/simulations/:id` on direct navigation and browser refresh.

---

## 8. Testing Architecture

The Angular 22 project uses Vitest through the Angular CLI test builder. Testing layers are:

```text
Component tests
      ↓
Service tests
      ↓
HTTP tests
      ↓
Routing tests
```

Tests should verify behaviour at the appropriate level. Component tests cover shell, list, detail, form, states, and result presentation. Service and HTTP tests cover typed API calls and error mapping. Reactive Forms tests cover validators and submission blocking. Routing tests cover lazy feature navigation, route parameters, and direct simulation-result loading.

---

## 9. Performance Architecture

The application should initially prioritize correctness and clarity.

Performance optimizations are introduced after identifying an actual need.

Potential mechanisms include, only when justified by an observed or explainable need:

* lazy loading;
* efficient rendering;
* `@defer`;
* appropriate signal usage;
* modern Angular change detection.

Zoneless Angular and `@defer` remain optional learning topics unless a concrete performance scenario makes them useful.

---

## 10. Security Boundary

The frontend is not a security boundary.

The backend remains responsible for:

* authorization;
* validation;
* protection of business rules;
* sensitive operations.

The frontend provides user experience and client-side validation.

---

## 11. Architecture Decision Records

Important architecture decisions should be documented when they have meaningful trade-offs.

Examples:

* Signals versus RxJS;
* local state versus global state;
* service versus direct component API access;
* lazy loading strategy;
* SSR/hydration;
* testing approach;
* backend authority versus presentation-only frontend transformations.
