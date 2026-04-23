# Implementation Plan: Checkout Navigation & Route System

**Branch**: `004-checkout-navigation` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-checkout-navigation/spec.md`

## Summary

Build a self-contained, stack-based navigation system for the checkout components using React Context + `useReducer`. Supports push (with typed params), pop, replace, and popToRoot operations. Includes a generic header component with configurable slots and animated slide transitions. No third-party navigation libraries.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native >=0.68
**Primary Dependencies**: React (>=16.8), React Native (>=0.68) — no new dependencies added
**Storage**: N/A (in-memory state only)
**Testing**: Jest 29.7 with react-test-renderer
**Target Platform**: iOS + Android (React Native)
**Project Type**: SDK library (npm package)
**Performance Goals**: Transitions <=300ms, navigation actions immediate
**Constraints**: Zero third-party navigation deps; must work within existing PrimerCheckoutProvider context tree
**Scale/Scope**: ~11 known routes, max stack depth ~5 in practice

## Constitution Check

*Constitution not configured (template placeholders only). No gates to evaluate.*

## Project Structure

### Documentation (this feature)

```text
specs/004-checkout-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── navigation-api.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/Components/internal/navigation/
├── index.ts                    # Public exports
├── types.ts                    # CheckoutRoute enum, RouteParamMap, NavigationState, NavigationAction
├── NavigationContext.ts         # React context for navigation state + dispatch
├── navigationReducer.ts        # Reducer: push, pop, replace, popToRoot, setAnimating
├── NavigationProvider.tsx       # Context provider + BackHandler (Android)
├── NavigationContainer.tsx      # Renders current screen + animated transitions
├── NavigationHeader.tsx         # Generic header with slots
├── useNavigation.ts            # Hook returning { push, pop, replace, popToRoot, canGoBack }
└── useRoute.ts                 # Hook returning { route, params } for current screen

src/__tests__/navigation/
├── navigationReducer.test.ts    # Unit tests for all reducer actions
├── useNavigation.test.tsx       # Hook behavior tests
├── useRoute.test.tsx            # Parameter reading tests
├── NavigationContainer.test.tsx # Screen rendering + transition tests
└── NavigationHeader.test.tsx    # Header slot configuration tests
```

**Structure Decision**: All navigation code lives under `src/Components/internal/navigation/` following the existing pattern where `internal/` holds non-public SDK internals (e.g., `internal/theme/`, `internal/PrimerCheckoutContext.ts`). Tests follow the existing `src/__tests__/` convention.

## Complexity Tracking

No constitution violations to justify.
