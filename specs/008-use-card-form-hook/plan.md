# Implementation Plan: useCardForm() Hook + Tokenization & 3DS

**Branch**: `008-use-card-form-hook` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-use-card-form-hook/spec.md`

## Summary

Add a `useCardForm()` React hook that wraps the native `RawDataManager` to provide managed card form state, auto-formatting, touch-based validation, debounced native sync, BIN detection, and a guarded `submit()` for tokenization/3DS. The hook works both inside the drop-in `PrimerCheckoutSheet` and standalone with `PrimerCheckoutProvider` for custom merchant UIs.

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81.1, React 19.1.0
**Primary Dependencies**: React (hooks, context), existing `RawDataManager` native bridge, `PrimerCheckoutProvider`/Context
**Storage**: N/A (in-memory React state)
**Testing**: Jest + @testing-library/react-hooks (existing pattern from `usePaymentMethods.test.ts`)
**Target Platform**: iOS + Android via React Native
**Project Type**: Library (React Native SDK)
**Performance Goals**: Debounced bridge calls to ~10/sec max, validation feedback <1s
**Constraints**: Must work without PrimerCheckoutSheet, lazy RawDataManager init, no new native dependencies
**Scale/Scope**: Single hook + types + internal bridge hook + example screen

## Constitution Check

*No constitution gates defined (template placeholder). Proceeding.*

## Project Structure

### Documentation (this feature)

```text
specs/008-use-card-form-hook/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Data model
├── quickstart.md        # Phase 1: Usage examples
├── contracts/
│   └── useCardForm.ts   # Phase 1: Public API contract
└── tasks.md             # Phase 2: Task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── Components/
│   ├── hooks/
│   │   ├── useCardForm.ts              # NEW — public hook
│   │   └── usePrimerCheckout.ts        # Existing — used for SDK readiness
│   ├── internal/
│   │   └── useRawDataManagerBridge.ts  # NEW — internal manager lifecycle hook
│   └── index.ts                        # MODIFY — export useCardForm
├── models/
│   └── components/
│       └── CardFormTypes.ts            # NEW — types for hook options/return
├── utils/
│   └── debounce.ts                     # NEW — simple debounce utility
└── index.tsx                           # MODIFY — export from package root

example/src/screens/
└── CustomCardFormScreen.tsx            # NEW — example with plain TextInputs

src/__tests__/
└── components/
    └── useCardForm.test.ts             # NEW — unit tests
```

**Structure Decision**: Follows existing hook pattern (`usePaymentMethods` in `src/Components/hooks/`). Internal bridge hook in `src/Components/internal/`. Types in `src/models/components/`. Matches codebase conventions.

## Key Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/models/components/CardFormTypes.ts` | NEW | UseCardFormOptions, UseCardFormReturn, CardFormErrors, CardFormField types |
| `src/utils/debounce.ts` | NEW | Simple debounce utility (no external dependency) |
| `src/Components/internal/useRawDataManagerBridge.ts` | NEW | Manages RawDataManager lifecycle, events, cleanup |
| `src/Components/hooks/useCardForm.ts` | NEW | Public hook — formatting, touch tracking, validation parsing, submit guard |
| `src/Components/index.ts` | MODIFY | Export useCardForm + types |
| `src/index.tsx` | MODIFY | Re-export from package root |
| `src/__tests__/components/useCardForm.test.ts` | NEW | Unit tests |
| `example/src/screens/CustomCardFormScreen.tsx` | NEW | Example app screen with plain TextInputs |

## Key Decisions (from research.md)

1. **Internal bridge hook**: `useRawDataManagerBridge` manages RawDataManager lifecycle separately from form logic
2. **Auto-formatting**: Card number (spaces/4), expiry (MM/YY), CVV (digits/4) — strip before sending to native
3. **Debounce**: ~150ms on setRawData() calls via new utility
4. **Lazy init**: Manager created when `isReady === true` from PrimerCheckoutContext
5. **Touch-based errors**: Validation errors only surfaced for blurred fields
6. **Submit guard**: No-op if `!isValid` or `isSubmitting` — does not throw
7. **Error parsing**: Map PrimerError[] from native to per-field strings via errorId pattern matching
