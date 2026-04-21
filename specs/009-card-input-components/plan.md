# Implementation Plan: Card Input Components

**Branch**: `009-card-input-components` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-card-input-components/spec.md`

## Summary

Four individual card input components (CardNumberInput, ExpiryDateInput, CVVInput, CardholderNameInput) that connect to the `useCardForm()` hook. Connected-only — no standalone mode. Components are pure UI; all formatting and validation lives in the hook. Uses SDK PrimerTokens for default styling with optional `CardInputTheme` overrides.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: React 19.1.0, React Native 0.81.1, existing useCardForm() hook (ACC-6925), existing theme system (PrimerTokens/useTheme)  
**Storage**: N/A (pure UI components, state managed by useCardForm hook)  
**Testing**: Jest + React Native Testing Library  
**Target Platform**: iOS + Android via React Native  
**Project Type**: Library (SDK)  
**Performance Goals**: No visual lag on input formatting, no flicker on re-renders  
**Constraints**: Must integrate with existing PrimerTokens theme, must work inside PrimerCheckoutProvider  
**Scale/Scope**: 4 public components + 1 internal base component + 1 types file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a template with placeholders — no specific gates to enforce. Proceeding.

**Post-design re-check**: No violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-card-input-components/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── CardInputComponents.ts
├── checklists/
│   └── requirements.md
└── tasks.md                     # Created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── Components/
│   ├── inputs/                         # NEW — all card input components
│   │   ├── CardInputBase.tsx           # Internal shared base component
│   │   ├── CardNumberInput.tsx         # Public — card number field
│   │   ├── ExpiryDateInput.tsx         # Public — expiry date field
│   │   ├── CVVInput.tsx                # Public — CVV field
│   │   ├── CardholderNameInput.tsx     # Public — cardholder name field
│   │   └── index.ts                   # Barrel export
│   ├── hooks/
│   │   └── useCardForm.ts             # Existing (ACC-6925) — no changes
│   ├── internal/
│   │   └── theme/                     # Existing — no changes
│   └── index.ts                       # MODIFY — add input component exports
├── models/
│   └── components/
│       └── CardInputTypes.ts          # NEW — CardInputTheme, component prop types
└── index.tsx                          # MODIFY — add public exports

example/
└── src/
    └── screens/
        └── CustomCardFormScreen.tsx    # NEW — example screen using inputs + useCardForm()
```

**Structure Decision**: New `inputs/` directory under Components, mirroring the pattern of `hooks/` and `internal/`. Each component is a separate file. Internal base component in the same directory (not in `internal/`) since it's only used by sibling files.

## Key Architecture Decisions

### 1. Internal CardInputBase

All four components share identical structure: label → TextInput → error text. Differences are only configuration (keyboard type, maxLength, secureTextEntry, autocomplete). A single `CardInputBase` handles layout, styling, focus state, and theme application. Each public component wraps it with field-specific config.

### 2. Theme Layering

```
PrimerTokens (useTheme)  →  CardInputTheme (merchant override)  →  Final styles
```

Components call `useTheme()` internally for baseline values. If merchant provides a `theme` prop, those properties override the corresponding PrimerTokens values. This ensures:
- Without theme prop: inputs match SDK theme (light/dark mode)
- With theme prop: merchant brand customization

### 3. Auto-wiring Pattern

Each component knows its field identity internally:

```
CardNumberInput → reads cardForm.cardNumber, calls cardForm.updateCardNumber, 
                  calls cardForm.markFieldTouched('cardNumber'), reads cardForm.errors.cardNumber
```

No `field` prop needed — the component type implies the field.

### 4. Focus State

Each component manages its own `isFocused` boolean via local `useState`. This drives the border color (focused vs default). The hook's `markFieldTouched` is called on blur to trigger error display.

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `src/models/components/CardInputTypes.ts` | NEW | CardInputTheme, CardInputBaseProps, per-component props |
| `src/Components/inputs/CardInputBase.tsx` | NEW | Internal shared base with layout, styling, focus, theme |
| `src/Components/inputs/CardNumberInput.tsx` | NEW | Card number field + optional network icon |
| `src/Components/inputs/ExpiryDateInput.tsx` | NEW | Expiry date field |
| `src/Components/inputs/CVVInput.tsx` | NEW | CVV field with secure entry |
| `src/Components/inputs/CardholderNameInput.tsx` | NEW | Cardholder name field |
| `src/Components/inputs/index.ts` | NEW | Barrel exports |
| `src/Components/index.ts` | MODIFY | Add input component exports |
| `src/index.tsx` | MODIFY | Add public exports |
| `example/src/screens/CustomCardFormScreen.tsx` | NEW | Example screen |
| `example/src/screens/CheckoutComponentsListScreen.tsx` | MODIFY | Add entry for card form example |
| `example/src/App.tsx` | MODIFY | Register new screen |
