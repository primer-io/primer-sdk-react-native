# Feature Specification: Card Input Components

**Feature Branch**: `009-card-input-components`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: ACC-6494 — Card Input Components (CardNumberInput, ExpiryDateInput, CVVInput, CardholderNameInput)

## Clarifications

### Session 2026-04-15

- Q: Should components support a standalone/manual mode (value/onChange/error props without the hook), or require connection to useCardForm()? → A: Connected-only. Components require the useCardForm() hook. This matches both iOS and Android native SDK architecture where input components always route through the form manager. Merchants who want fully custom UI use their own inputs with the hook directly (Tier 3).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connected Card Inputs (Priority: P1)

A merchant integrating the SDK wants to place individual card input fields in their custom payment form. They use the `useCardForm()` hook and pass it to each input component. The inputs automatically handle formatting, validation error display, keyboard types, and touch tracking without any manual wiring.

**Why this priority**: This is the primary and only usage pattern for these components. The useCardForm() hook is always required, matching the native SDK architecture. Merchants who want full control use their own UI components with the hook directly (Tier 3).

**Independent Test**: Can be tested by rendering all four input components in connected mode, typing card data, verifying auto-formatting appears, blurring fields to see validation errors, and confirming the hook's isValid state updates correctly.

**Acceptance Scenarios**:

1. **Given** a form with connected CardNumberInput, **When** the user types "4242424242424242", **Then** the display shows "4242 4242 4242 4242" with spaces every 4 digits
2. **Given** a form with connected ExpiryDateInput, **When** the user types "1225", **Then** the display shows "12/25" with auto-inserted slash
3. **Given** a form with connected CVVInput, **When** the user types "123", **Then** the display shows masked dots (secure entry) for up to 4 digits
4. **Given** a connected input with no user interaction yet, **When** the field has a validation error, **Then** no error is shown until the user blurs the field
5. **Given** a connected input the user has blurred, **When** a validation error exists for that field, **Then** the error message displays below the input and the border turns to error color
6. **Given** all four connected inputs, **When** the merchant does not explicitly configure anything, **Then** each input uses the correct keyboard type (numeric for card/expiry/CVV, text for name) and platform autocomplete hints

---

### User Story 2 - Themed Card Inputs (Priority: P2)

A merchant wants their card inputs to match their brand. They customize colors, borders, typography, and spacing through a theme prop. The inputs also respect the SDK's global theme (light/dark mode) as a baseline.

**Why this priority**: Visual customization is expected but not blocking for core functionality. Merchants need brand consistency, but default styling works out of the box.

**Independent Test**: Can be tested by rendering inputs with custom theme overrides and verifying the visual output matches the specified colors, borders, and typography.

**Acceptance Scenarios**:

1. **Given** a CardNumberInput with a custom primary color, **When** the field is focused, **Then** the border uses the custom primary color
2. **Given** inputs with no theme prop, **When** rendered, **Then** they use the SDK's default theme tokens (respecting light/dark mode)
3. **Given** a custom error color in the theme, **When** a validation error is shown, **Then** both the border and error text use the custom error color

---

### Edge Cases

- What happens when the merchant does not include CardholderNameInput but the server configuration requires cardholder name? The form should still work; the missing field simply won't be filled, and validation will report it as required.
- What happens when the user pastes a full card number with or without spaces? The hook strips non-digits and reformats correctly; the component displays the hook's formatted value.
- What happens when the user types an expiry month greater than 12? The hook handles it gracefully (e.g., "13" stays as "13" and validation marks it invalid); the component displays whatever the hook provides.
- What happens when the input is disabled or the form is submitting? Inputs should be non-editable during submission.
- What happens when the useCardForm() hook is not provided? The component should fail clearly (development-time error), not silently render an empty input.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: SDK MUST provide four individual input components: CardNumberInput, ExpiryDateInput, CVVInput, and CardholderNameInput
- **FR-002**: Each component MUST require the useCardForm() hook return value as a prop and auto-wire to it for value management, formatting, error display, and touch tracking
- **FR-003**: CardNumberInput MUST display the card number with spaces every 4 digits and accept only numeric input
- **FR-004**: ExpiryDateInput MUST display the expiry in MM/YY format with an auto-inserted slash and accept only numeric input
- **FR-005**: CVVInput MUST mask the entered digits (secure text entry) and accept up to 4 numeric digits
- **FR-006**: CardholderNameInput MUST accept free-form text with word-level capitalization
- **FR-007**: Each component MUST use the appropriate keyboard type (numeric pad for card/expiry/CVV, default for cardholder name)
- **FR-008**: Each component MUST provide platform-appropriate autocomplete hints (card number, expiry, security code, name)
- **FR-009**: Each component MUST display validation errors below the input only after the user has interacted with (blurred) the field
- **FR-010**: Each component MUST accept a theme prop for customizing colors, borders, border radius, typography, and field height
- **FR-011**: Each component MUST fall back to SDK default theme tokens when no custom theme is provided
- **FR-012**: Each component MUST support standard style override props for container, input, label, and error text
- **FR-013**: Each component MUST accept a label prop and optionally show/hide it
- **FR-014**: Each component MUST accept a placeholder prop
- **FR-015**: Each component MUST support a testID prop for automated testing
- **FR-016**: Inputs MUST become non-editable when the form is in a submitting state
- **FR-017**: CardNumberInput SHOULD optionally display a card network icon based on detected card type

### Key Entities

- **CardInput**: A styled text input field specialized for a specific card data field (number, expiry, CVV, name). Has a value, error state, focus state, theme, and required connection to the useCardForm() hook.
- **CardInputTheme**: A set of visual customization options (colors, borders, typography, spacing) that controls the appearance of card inputs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Merchants can render a complete card form using only the four input components and the useCardForm() hook with zero additional UI code for basic flows
- **SC-002**: Each input component correctly formats user input in real-time (card number spaces, expiry slash, CVV masking) with no visual lag or flicker
- **SC-003**: Validation errors appear only after the user has interacted with a field, ensuring no errors flash on initial render
- **SC-004**: Custom themes applied via the theme prop are visually reflected within one render cycle
- **SC-005**: All four components pass accessibility checks: correct keyboard types, autocomplete hints, and testID attributes present

## Assumptions

- The useCardForm() hook (ACC-6925) is implemented and available as a dependency
- The SDK's existing theme system (light/dark tokens) provides baseline styling values
- The useRawDataManagerBridge handles all native SDK communication; input components do not interact with native code directly
- Card network icon display (FR-017) uses assets already available in the SDK's AssetsManager
- The components are pure UI — all formatting logic lives in the useCardForm() hook, not in the components themselves (the hook's update functions handle formatting, and the hook's state provides pre-formatted values for display)
- Cardholder name field visibility is controlled by the merchant (the component is always available; whether to render it is the merchant's choice based on requiredFields from the hook)
- The three integration tiers are: (1) Drop-in PrimerCardForm, (2) SDK input components + useCardForm(), (3) Merchant's own UI + useCardForm(). These components serve Tier 2 only.
