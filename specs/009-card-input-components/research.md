# Research: Card Input Components

## 1. Theme Integration Strategy

**Decision**: Use PrimerTokens (via `useTheme()`) as baseline, accept optional `CardInputTheme` for merchant overrides.

**Rationale**: The SDK already has a comprehensive theme system (PrimerTokens) with light/dark mode, used by all existing components (PaymentMethodButton, StatusScreens, etc.). Card inputs should integrate with this system rather than define a parallel one. The hackathon prototype's separate InputTheme with its own defaults (primaryColor: #0066FF) diverges from SDK tokens (primary: #2f98ff), creating visual inconsistency.

**Alternatives considered**:
- Separate InputTheme with own defaults (hackathon approach): Rejected — creates visual inconsistency, doesn't respect light/dark mode out of the box
- PrimerTokens only, no overrides: Rejected — merchants need brand customization
- Full PrimerThemeOverride: Rejected — too complex for per-component overrides

## 2. Connected Mode API Shape

**Decision**: Pass `UseCardFormReturn` as a `cardForm` prop. Component knows its own field internally.

**Rationale**: Each component is already specialized (CardNumberInput knows it's a card number field). No need for a `field` prop — the component auto-wires to the correct hook properties. This is simpler than the hackathon's `cardForm + field` pattern.

**Alternatives considered**:
- `cardForm + field` prop (hackathon approach): Rejected — redundant since CardNumberInput already implies `field="cardNumber"`
- Individual props (value, onChange, onBlur, error): Rejected — this is manual mode, which we eliminated
- Context-based (hook provides context, components consume): Rejected — would couple to specific provider tree, less flexible

## 3. Shared Base Component

**Decision**: Create a single internal `CardInputBase` component. Each public component wraps it with field-specific configuration.

**Rationale**: All four inputs share identical structure (label + TextInput + error text) and styling logic (border color based on focus/error state, theme application). Only differences are: keyboard type, maxLength, secureTextEntry, autoComplete hint, placeholder default, and which hook field to wire. Extracting a base avoids 4x duplicated rendering/styling logic.

**Alternatives considered**:
- Four independent components with no shared code: Rejected — massive duplication of identical styling/layout logic
- Higher-order component wrapping TextInput: Rejected — HOCs are less ergonomic than composition in modern React
- Render props pattern: Rejected — overcomplicated for this use case

## 4. Formatting Ownership

**Decision**: All formatting lives in the `useCardForm()` hook. Components display the hook's pre-formatted values as-is.

**Rationale**: The hook already formats card number (spaces/4), expiry (MM/YY), and CVV (digits only). Components read `cardForm.cardNumber` which is already formatted. No duplicate formatting in components. Confirmed in the spec's Assumptions section.

**Alternatives considered**:
- Components format independently: Rejected — duplicates hook logic, risk of desync
- Native-side formatting: Rejected — formatting is already in RN-side hook

## 5. Disabled State During Submission

**Decision**: Components read `cardForm.isSubmitting` and set `editable={false}` on the TextInput.

**Rationale**: FR-016 requires inputs to be non-editable during submission. The hook already exposes `isSubmitting`. Simple boolean check — no additional state management needed.
