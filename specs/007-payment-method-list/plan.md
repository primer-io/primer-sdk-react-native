# Implementation Plan: PrimerPaymentMethodList Component

**Branch**: `007-payment-method-list` | **Date**: 2026-04-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-payment-method-list/spec.md`

## Summary

Pre-built payment method list component that renders branded payment method buttons using data from the `usePaymentMethods()` hook. The component supports two button styles (color-filled and outlined), per-method surcharge display, expand/collapse, and integrates with the existing navigation system and theme token system. Lives inside the checkout sheet screen as a child component.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81.1, React 19.1.0
**Primary Dependencies**: React (hooks, context), React Native primitives (View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Animated), existing theme system (`useTheme`), existing navigation system (`useNavigation`), `usePaymentMethods` hook (ACC-6917)
**Storage**: N/A (in-memory React state)
**Testing**: Jest + react-test-renderer (custom `renderHook` pattern, no @testing-library)
**Target Platform**: iOS + Android via React Native
**Project Type**: Library (React Native SDK component)
**Performance Goals**: Render branded buttons within 200ms of data availability; smooth 60fps expand/collapse animation
**Constraints**: Must use existing theme tokens for layout/spacing/typography; color-style buttons override with API-provided branding; no new dependencies
**Scale/Scope**: Typically 3-10 payment methods per checkout session; support up to 20+

## Constitution Check

*No active constitution principles defined. Template only — no gates to evaluate.*

## Project Structure

### Documentation (this feature)

```text
specs/007-payment-method-list/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── PrimerPaymentMethodList.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── Components/
│   ├── PrimerPaymentMethodList.tsx          # Main list component (NEW)
│   ├── internal/
│   │   ├── ui/
│   │   │   ├── PaymentMethodButton.tsx      # Button component (NEW)
│   │   │   └── CheckoutButton.tsx           # Existing reference
│   │   ├── theme/                           # Existing theme system
│   │   │   ├── types.ts                     # PrimerTokens, colors, spacing, radii, etc.
│   │   │   ├── useTheme.ts                  # useTheme() hook
│   │   │   └── ...
│   │   ├── navigation/                      # Existing navigation system
│   │   │   ├── types.ts                     # CheckoutRoute enum
│   │   │   ├── useNavigation.ts             # push(), pop(), replace()
│   │   │   └── ...
│   │   └── checkout-sheet/                  # Existing sheet container
│   ├── hooks/
│   │   ├── usePaymentMethods.ts             # Existing hook (ACC-6917)
│   │   └── usePrimerCheckout.ts             # Existing checkout context hook
│   └── index.ts                             # Public exports
├── models/
│   └── components/
│       ├── PaymentMethodTypes.ts             # Existing types from ACC-6917
│       └── PrimerPaymentMethodListTypes.ts   # List component props/types (NEW)
└── __tests__/
    └── components/
        ├── usePaymentMethods.test.ts         # Existing tests
        └── PrimerPaymentMethodList.test.tsx   # Component tests (NEW)
```

**Structure Decision**: Follows existing component architecture. `PrimerPaymentMethodList` is a public component in `src/Components/`. Internal `PaymentMethodButton` goes in `src/Components/internal/ui/` following the `CheckoutButton` pattern. Uses existing theme, navigation, and hook infrastructure.

## Key Architectural Decisions

### 1. Button Style Determination

Two button styles based on resource data:
- **Color button**: Method has a `PrimerPaymentMethodAsset` with `paymentMethodBackgroundColor` — filled background + centered logo image
- **Outlined button**: Method has no background color or is a `PrimerPaymentMethodNativeView` — white background with border, icon + "Pay with [name]" text

### 2. FlatList vs View.map()

Use **FlatList** per the Jira requirement, even though hackathon used `.map()`. FlatList provides:
- Virtualization for 20+ methods
- Built-in scroll behavior
- `ListEmptyComponent` support

### 3. Theme Integration

- Layout tokens (spacing, radii, borders, typography) come from `useTheme()` / `PrimerTokens`
- Outlined button uses theme colors for background, border, text
- Color button overrides background/text with API-provided branding colors
- Button height (44px from Figma) and gap (8px) use theme spacing tokens where appropriate

### 4. Navigation on Selection

When a payment method is tapped:
1. Fire `PrimerAnalytics.trackEvent('PAYMENT_METHOD_SELECTION', { paymentMethodType })` (if analytics bridge available)
2. Call `onSelect(method)` callback prop
3. Parent screen uses `useNavigation().push()` to route to the payment form

The component itself does NOT navigate — it calls the callback and lets the parent screen handle routing. This keeps the component reusable.

### 5. Expand/Collapse

- Controlled by `collapsedCount` prop (default: show all)
- When set, only first N methods visible + "Show more" toggle
- Toggle animates height with `LayoutAnimation` or `Animated`
- State managed internally with `useState`

### 6. Surcharge Display

- Reads `surcharge` from `PaymentMethodItem` (provided by hook)
- Formats using currency utility (if available) or raw number fallback
- Displayed as secondary text on the button

## Complexity Tracking

No constitution violations to justify.
