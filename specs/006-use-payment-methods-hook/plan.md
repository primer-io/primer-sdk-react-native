# Implementation Plan: usePaymentMethods Hook

**Branch**: `006-use-payment-methods-hook` | **Date**: 2026-04-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-use-payment-methods-hook/spec.md`

## Summary

Add a `usePaymentMethods()` React hook that provides merchant developers with a display-ready, filtered, sortable list of available payment methods. The hook merges payment method availability data with display resources (logos, colors, names) and per-method surcharge data from the SDK context. This is task #9 (ACC-6917) in the Checkout Components epic and is a prerequisite for the PrimerPaymentMethodList component (ACC-6492).

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81.1, React 19.1.0
**Primary Dependencies**: React (hooks, context), existing PrimerCheckoutProvider/Context
**Storage**: N/A (in-memory React state)
**Testing**: Jest (`npm test`)
**Target Platform**: iOS + Android via React Native
**Project Type**: Library (React Native SDK)
**Performance Goals**: N/A — synchronous derived state from context
**Constraints**: No new dependencies; must work with existing PrimerCheckoutProvider
**Scale/Scope**: Single hook + types + context extension + exports

## Constitution Check

*No constitution configured — gates pass by default.*

## Project Structure

### Documentation (this feature)

```text
specs/006-use-payment-methods-hook/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Usage examples
├── contracts/           # Public API contract
│   └── usePaymentMethods.ts
└── tasks.md             # (created by /speckit.tasks)
```

### Source Code (files to create/modify)

```text
src/
├── Components/
│   ├── PrimerCheckoutProvider.tsx          # MODIFY — add resource fetching
│   ├── hooks/
│   │   ├── usePaymentMethods.ts           # CREATE — the new hook
│   │   └── index.ts                       # MODIFY — add export
│   └── internal/
│       └── PrimerCheckoutContext.ts        # no change (uses type from below)
├── models/
│   └── components/
│       ├── PrimerCheckoutProviderTypes.ts  # MODIFY — extend context value
│       └── PaymentMethodTypes.ts          # CREATE — PaymentMethodItem, options, return types
├── index.tsx                               # MODIFY — add public exports
tests/
└── Components/
    └── hooks/
        └── usePaymentMethods.test.ts      # CREATE — unit tests
```

**Structure Decision**: Follows existing `src/Components/hooks/` pattern established by `usePrimerCheckout`. Types go in `src/models/components/` matching existing convention. The hook file name matches the hook name (`usePaymentMethods.ts`).

## Implementation Steps

### Step 1: Create PaymentMethodItem types

**File**: `src/models/components/PaymentMethodTypes.ts` (CREATE)

Define `PaymentMethodItem`, `UsePaymentMethodsOptions`, `UsePaymentMethodsReturn` interfaces. See [contracts/usePaymentMethods.ts](contracts/usePaymentMethods.ts) for exact shapes.

Reference: Hackathon branch `src/models/components/PaymentMethodListTypes.ts` — adapt the `PaymentMethodItem` interface, add `surcharge` field, simplify options (remove theme/component-level props that belong in ACC-6492).

### Step 2: Extend PrimerCheckoutContextValue

**File**: `src/models/components/PrimerCheckoutProviderTypes.ts` (MODIFY)

Add to `PrimerCheckoutContextValue`:
- `paymentMethodResources: (PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView)[]`
- `isLoadingResources: boolean`

Reference: Hackathon branch same file shows the exact extension.

### Step 3: Fetch resources in PrimerCheckoutProvider

**File**: `src/Components/PrimerCheckoutProvider.tsx` (MODIFY)

After `startWithClientToken()` resolves and sets `isReady`, call `AssetsManager.getPaymentMethodResources()` and store results in state. Track `isLoadingResources` separately.

Key points:
- Set `isLoadingResources: true` before fetch, `false` after (success or failure)
- On resource fetch failure: set `paymentMethodResources: []` and `isLoadingResources: false` (graceful degradation — methods still show, just without logos/colors)
- Respect the `cancelled` flag for cleanup
- Add `paymentMethodResources` and `isLoadingResources` to `initialState`

Reference: Hackathon branch `PrimerCheckoutProvider.tsx` lines showing resource fetch after init.

### Step 4: Implement usePaymentMethods hook

**File**: `src/Components/hooks/usePaymentMethods.ts` (CREATE)

Core logic (follows hackathon `usePaymentMethodList.ts` pattern):
1. Call `usePrimerCheckout()` to get context data
2. `useMemo` to merge `availablePaymentMethods` + `paymentMethodResources` → `PaymentMethodItem[]`
   - Create resource lookup map by `paymentMethodType`
   - For each available method, merge with resource (logo, name, colors)
   - Attach surcharge from `clientSession` if available
   - Apply `include` filter, then `exclude` filter
   - Sort with `showCardFirst` (PAYMENT_CARD to index 0)
3. `useState` for `selectedMethod` and `error`
4. `useCallback` for `selectMethod` and `clearSelection`
5. `useEffect` for `onLoad` callback
6. Return `UsePaymentMethodsReturn`

Surcharge lookup: Access `clientSession` from context. The native SDK passes surcharge data through the client session. Check for a per-method surcharge keyed by `paymentMethodType`. Model as optional since not all sessions configure surcharges.

### Step 5: Wire up exports

**File**: `src/Components/hooks/index.ts` (MODIFY) — add `usePaymentMethods` export
**File**: `src/Components/index.ts` (MODIFY if needed) — re-export from hooks
**File**: `src/index.tsx` (MODIFY) — add public exports:
- `usePaymentMethods`
- Types: `PaymentMethodItem`, `UsePaymentMethodsOptions`, `UsePaymentMethodsReturn`

### Step 6: Unit tests

**File**: `tests/Components/hooks/usePaymentMethods.test.ts` (CREATE)

Test scenarios from spec:
- Returns empty array + isLoading when not ready
- Returns merged methods when ready
- Filters by include
- Filters by exclude
- Include then exclude precedence
- showCardFirst sorting
- Selection state management
- Error state when merge fails
- Throws when used outside provider

## Verification

1. `npm test` — all tests pass
2. `npm run lint` — no lint errors
3. Manual: In example app, use `usePaymentMethods()` inside a component wrapped in `PrimerCheckoutProvider` and verify methods render with logos and names
