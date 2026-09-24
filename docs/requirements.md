# ESG Portfolio Simulator — Requirements

## 1. Objective

The ESG Portfolio Simulator is a web application allowing a user to consult investment portfolios and simulate an ESG score based on environmental, social and governance indicators.

The application is an Angular frontend connected to an existing Spring Boot backend POC.

The project is also used as an educational project to learn modern Angular through a Specification-Driven Development (SDD) workflow.

---

## 2. Users

The application targets users who need to:

* consult available investment portfolios;
* search portfolios;
* inspect portfolio information;
* create an ESG simulation;
* understand the resulting ESG score.

Authentication is outside the initial scope.

---

## 3. Functional Requirements

### REQ-001 — Application Shell

The application must provide a global application shell containing:

* a header;
* a navigation area;
* a main content area;
* a footer.

The shell must remain consistent when navigating between application features.

---

### REQ-002 — Dashboard

The application must provide a dashboard presenting:

* a welcome section;
* a summary of available portfolios;
* access to portfolio consultation;
* access to ESG simulation.

---

### REQ-003 — Portfolio List

The application must display a list of investment portfolios.

Each portfolio must expose at least:

* identifier;
* name;
* description;
* number of assets;
* current value.

---

### REQ-004 — Portfolio Search

The user must be able to search portfolios by name.

The search must update the displayed results without requiring a full page reload.

---

### REQ-005 — Portfolio Detail

The user must be able to navigate to a portfolio detail page.

The detail page must display:

* portfolio information;
* ESG indicators;
* current score when available;
* an action allowing the user to start an ESG simulation.

---

### REQ-006 — ESG Simulation

The user must be able to create an ESG simulation for a portfolio.

The simulation must accept:

* portfolio identifier;
* carbon emission;
* green investment percentage;
* social score;
* governance score.

---

### REQ-007 — ESG Validation

The application must validate simulation input before submission.

Rules:

* portfolio identifier is mandatory;
* carbon emission cannot be negative;
* green investment percentage must be between 0 and 100;
* social score must be between 0 and 100;
* governance score must be between 0 and 100.

Validation errors must be understandable by the user.

---

### REQ-008 — Environmental Score

The backend must calculate the official environmental score from carbon emissions:

* carbon emission <= 100 → environmental score = 100;
* 100 < carbon emission <= 500 → environmental score = 70;
* carbon emission > 500 → environmental score = 40.

---

### REQ-009 — Global ESG Score

The backend must calculate the official global ESG score using:

* Environmental: 40%;
* Social: 30%;
* Governance: 30%.

The result must be rounded to two decimal places using HALF_UP rounding.

The backend calculation must use `BigDecimal` before applying `HALF_UP` rounding.

Green investment percentage is displayed and stored but does not currently affect the global ESG score.

---

### REQ-010 — Simulation Result

After successful simulation, the application must display:

* environmental score;
* social score;
* governance score;
* global ESG score;
* portfolio information.

The result must be understandable without requiring the user to inspect technical details.

---

### REQ-011 — Loading State

The application must provide an appropriate loading state while waiting for asynchronous operations.

---

### REQ-012 — Empty State

The application must provide an appropriate empty state when no portfolio matches a search or when no data is available.

---

### REQ-013 — Error State

The application must provide a user-friendly error state when an API operation fails.

Technical error details must not be exposed unnecessarily.

---

### REQ-014 — Navigation

The application must support navigation between:

* dashboard;
* portfolio list;
* portfolio detail;
* ESG simulation;
* simulation result.

Browser navigation must work correctly.

---

### REQ-015 — Responsive Interface

The application must remain usable on:

* desktop;
* tablet;
* mobile.

At the minimum, the shell, portfolio list, detail page, simulation form, and result page must remain readable and operable without horizontal scrolling at the supported viewport sizes.

---

### REQ-016 — Accessibility

The application must follow basic accessibility principles:

* semantic HTML;
* keyboard navigation;
* accessible form labels;
* meaningful buttons and links;
* appropriate error messages.

Form controls must have associated labels. Keyboard navigation must reach all interactive elements, focus must remain visible and move predictably after navigation or submission, and validation messages must be associated with their controls.

---

### REQ-017 — Testing

The Angular 22 project must use Vitest through the Angular CLI test builder. The application must contain automated behaviour-focused tests for:

* components;
* services;
* forms;
* HTTP communication;
* routing;
* Reactive Forms and validation;
* loading, empty, and error states;
* important ESG result presentation logic, including display of the backend-provided rounded value.

---

### REQ-018 — Architecture

The Angular application must use a feature-oriented architecture.

The application must avoid unnecessary global state.

Components must not directly contain HTTP implementation details.

HTTP communication must be encapsulated behind services or API abstractions.

The backend remains authoritative for ESG business rules. The frontend is responsible for user experience, client-side validation, state presentation, and navigation.

---

## 4. Non-Functional Requirements

### NFR-001 — Maintainability

The code must remain understandable and easy to evolve.

### NFR-002 — Performance

The application should use modern Angular performance mechanisms where they provide a concrete benefit.

### NFR-003 — Type Safety

TypeScript strict mode must remain enabled.

### NFR-004 — Modern Angular

The project should use modern Angular APIs instead of legacy APIs when an equivalent modern solution exists.

### NFR-005 — Educational Value

Each significant implementation task must introduce or reinforce at least one meaningful Angular concept.

Artificial features must not be added solely to demonstrate an API.

---

## 5. Out of Scope

The initial version does not include:

* authentication;
* authorization;
* real user management;
* payment;
* database implementation in Angular;
* NgRx;
* micro-frontends;
* Docker;
* cloud deployment;
* advanced UI frameworks.

These topics may be introduced later only if they serve a concrete architectural or educational objective.

---

## 6. SDD Principle

Implementation must follow the documented requirements and specification.

If a requirement is ambiguous, it must be identified and clarified rather than silently invented.
