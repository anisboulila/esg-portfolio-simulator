# ESG Portfolio Simulator — Specification

## 1. Data Models

The frontend models remain independent from Angular components and represent API contracts.

### Portfolio

A portfolio contains:

```text
Portfolio
- id: string
- name: string
- description: string
- assetCount: number
- currentValue: number
```

The unit and display format of `currentValue` must be documented by the backend contract before implementation.

### PortfolioEsgIndicators

ESG information associated with a portfolio is represented separately:

```text
PortfolioEsgIndicators
- carbonEmission: number
- socialScore: number
- governanceScore: number
- greenInvestmentPercentage: number
- currentScore: number | null
```

The indicators and current score are optional from the portfolio detail perspective when the backend does not provide them.
The unit and display format of `carbonEmission` must be documented by the backend contract before implementation.

### SimulationRequest

The request sent when creating a simulation is:

```text
SimulationRequest
- portfolioId: string
- carbonEmission: number
- greenInvestmentPercentage: number
- socialScore: number
- governanceScore: number
```

### SimulationResult

The response returned by a successful simulation contains:

```text
SimulationResult
- id: string
- portfolio: Portfolio
- environmentalScore: number
- socialScore: number
- governanceScore: number
- globalScore: number
- greenInvestmentPercentage: number
```

`globalScore` is the official backend value. The frontend must not recalculate it as a second business rule.

---

## 2. Dashboard

Route:

```text
/
```

The dashboard must provide:

* application introduction;
* portfolio summary;
* navigation to portfolios;
* navigation to ESG simulation.

---

## 3. Portfolio List

Route:

```text
/portfolios
```

The page must:

1. load portfolios;
2. display portfolios;
3. provide a search field;
4. update the list when the search value changes;
5. display loading, empty and error states.

---

## 4. Portfolio Card

A portfolio card must display:

* name;
* description;
* current value;
* asset count;
* ESG information when available.

The card must expose an action to navigate to the portfolio detail.

The card must remain reusable and should not directly perform HTTP operations.

---

## 5. Portfolio Detail

Route:

```text
/portfolios/:id
```

The page must load the portfolio identified by the route parameter.

If the portfolio does not exist, an appropriate error state must be displayed.

The page must provide access to the ESG simulation.

---

## 6. ESG Simulation Form

Route:

```text
/portfolios/:id/simulate
```

The form contains:

```text
portfolioId
carbonEmission
greenInvestmentPercentage
socialScore
governanceScore
```

The form must use Angular Reactive Forms.

Validation must occur before submission.

---

## 7. ESG Calculation

The backend is the source of truth for ESG business calculations. The frontend submits validated input and displays the values returned by the backend. It must not duplicate the calculation as an authoritative rule.

Environmental score:

```text
if carbonEmission <= 100
    environmentalScore = 100

else if carbonEmission <= 500
    environmentalScore = 70

else
    environmentalScore = 40
```

Global score:

```text
globalScore =
    environmentalScore * 0.40
  + socialScore * 0.30
  + governanceScore * 0.30
```

The backend performs the calculation with `BigDecimal`, rounds the result to two decimal places using `HALF_UP`, and returns the rounded official value. `greenInvestmentPercentage` is stored and displayed but does not currently affect the global score.

If the frontend shows a local preview before submission, it is presentation-only, must be clearly labelled as an estimate, and must never replace the backend result.

---

## 8. Simulation API

The frontend must communicate with the backend through an API abstraction.

The UI components must not contain direct HTTP calls.

Expected operations:

```text
GET  /api/v1/portfolios
GET  /api/v1/portfolios/{id}
POST /api/v1/esg/simulations
GET  /api/v1/esg/simulations/{id}
```

`POST /api/v1/esg/simulations` creates a simulation and returns a `SimulationResult`, including its identifier. The application navigates to `/simulations/:id` using that identifier.

`GET /api/v1/esg/simulations/{id}` loads the official result for the result page. The result page must use this operation on direct navigation or browser refresh and must display loading, success, empty/not-found, and error states as appropriate.

The backend is initially considered an external dependency.

For development, mock data or a controlled mock API may be used.

---

## 9. Error Model

The frontend must distinguish at least:

```text
loading
success
empty
error
```

HTTP errors must be converted into application-level states where appropriate.

---

## 10. Routing

The initial route structure is:

```text
/
├── portfolios
│   └── :id
│       └── simulate
└── simulations
    └── :id
```

Route ownership is:

* Dashboard feature: `/`;
* Portfolios feature: `/portfolios`, `/portfolios/:id`, `/portfolios/:id/simulate`;
* Simulations feature: `/simulations/:id`.

The dashboard, portfolios, and simulations feature route trees should be lazy-loaded from the root route configuration. The root application owns only global composition and redirects.

---

## 11. Responsive Behaviour

The UI must adapt to different viewport sizes.

The application must remain usable without requiring a specific desktop resolution.

---

## 12. Accessibility

Forms must have accessible labels.

Interactive elements must be keyboard accessible.

Validation errors must be associated with the relevant controls.

---

## 13. Testing

The project uses Angular 22 with Vitest through the Angular CLI test builder. Tests must verify behaviour rather than implementation details.

Examples:

* component rendering;
* user interaction;
* signal state changes;
* form validation;
* service behaviour;
* HTTP requests;
* route navigation;
* loading, empty, and error states;
* official ESG result display, including the backend-provided rounded value.

Reactive Forms tests must cover required fields, numeric bounds, validation messages, and submission blocking. HTTP tests must cover API requests and responses. Routing tests must cover route parameters, lazy feature navigation, and direct result navigation.

---

## 14. SDD Rule

Every significant implementation must be traceable to:

```text
Requirement
    ↓
Specification
    ↓
Task
    ↓
Implementation
    ↓
Test
    ↓
Acceptance criteria
```
