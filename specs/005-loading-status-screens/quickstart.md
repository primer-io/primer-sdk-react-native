# Quickstart: Loading & Status Screens

**Feature**: 005-loading-status-screens  
**Date**: 2026-04-02

## Prerequisites

1. Branch `005-loading-status-screens` must be rebased onto `ov/feat/ACC-6920` (PR #336) which provides the navigation system, design tokens, and checkout sheet.
2. Example app running: `cd example && npx react-native run-ios` (or `run-android`).

## Build Sequence

### Step 1: Shared Components

Create `src/Components/internal/screens/` directory with:
1. `StatusScreenLayout.tsx` — shared icon + title + subtitle layout
2. `CheckoutButton.tsx` — primary and outlined button variants
3. Icon components (`CheckCircleIcon`, `WarningTriangleIcon`)
4. `index.ts` — exports

### Step 2: Screen Components

1. `LoadingScreen.tsx` — uses `ActivityIndicator` + `StatusScreenLayout`
2. `SuccessScreen.tsx` — uses `CheckCircleIcon` + `StatusScreenLayout`
3. `ErrorScreen.tsx` — uses `WarningTriangleIcon` + `StatusScreenLayout` + `CheckoutButton` pair

### Step 3: Register Screens

Update the demo screen's `screenMap` in `example/src/screens/NavigationDemoScreen.tsx` to map `splash`, `loading`, `processing` → `LoadingScreen`, `success` → `SuccessScreen`, `error` → `ErrorScreen`.

### Step 4: Tests

Add component render tests in `src/__tests__/components/screens/` following the existing `PrimerCheckoutProvider.test.tsx` pattern (Jest + react-test-renderer).

## Verification

1. `npm test` — all tests pass
2. `npm run lint` — no lint errors
3. Run example app → open navigation demo → navigate to each status screen and visually verify against Figma designs
4. Verify error screen buttons respond to taps (console log or navigation action)
