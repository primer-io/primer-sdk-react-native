# Feature Specification: usePaymentMethods Hook

**Feature Branch**: `006-use-payment-methods-hook`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "usePaymentMethods hook - React hook exposing available payment methods from SDK state with filtering, sorting, and selection capabilities for checkout components (ACC-6917)"

## Clarifications

### Session 2026-04-09

- Q: Should PaymentMethodItem include per-method surcharge data, or will the consuming component fetch it separately? → A: Include surcharge data on PaymentMethodItem — the hook provides display-ready data including formatted surcharge amounts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Available Payment Methods (Priority: P1)

As a merchant developer, I want to retrieve the list of available payment methods from the SDK so I can render a custom payment method selection UI.

**Why this priority**: This is the core purpose of the hook. Without access to payment method data, no other functionality is possible.

**Independent Test**: Can be tested by calling the hook inside a component after SDK initialization and verifying it returns the list of payment methods with their display information (name, logo, type, styling).

**Acceptance Scenarios**:

1. **Given** the SDK has been initialized and `/configuration` has returned, **When** a component calls `usePaymentMethods()`, **Then** it returns an array of available payment methods with type, display name, logo, and styling information.
2. **Given** the SDK is still loading configuration, **When** a component calls `usePaymentMethods()`, **Then** it returns an empty array and `isLoading` is `true`.
3. **Given** the SDK has no available payment methods, **When** a component calls `usePaymentMethods()`, **Then** it returns an empty array and `isLoading` is `false`.

---

### User Story 2 - Filter Payment Methods (Priority: P2)

As a merchant developer, I want to include or exclude specific payment methods so I can tailor the payment experience to my use case (e.g., hide Apple Pay on Android, show only card payments on a specific screen).

**Why this priority**: Filtering is the most common customization need. Merchants often need to show different methods on different screens or platforms.

**Independent Test**: Can be tested by passing `include` or `exclude` options to the hook and verifying the returned list only contains the expected methods.

**Acceptance Scenarios**:

1. **Given** 5 payment methods are available, **When** the hook is called with `include: ['PAYMENT_CARD', 'PAYPAL']`, **Then** only those two methods are returned.
2. **Given** 5 payment methods are available, **When** the hook is called with `exclude: ['APPLE_PAY']`, **Then** all methods except Apple Pay are returned.
3. **Given** both `include` and `exclude` are provided, **When** the hook is called, **Then** `include` is applied first, then `exclude` filters from that result.

---

### User Story 3 - Select a Payment Method (Priority: P2)

As a merchant developer, I want to track which payment method the user selected so I can proceed with the appropriate payment flow.

**Why this priority**: Selection state is essential for driving the checkout flow forward. It works hand-in-hand with payment method display.

**Independent Test**: Can be tested by calling `selectMethod()` with a payment method and verifying `selectedMethod` updates accordingly.

**Acceptance Scenarios**:

1. **Given** payment methods are loaded, **When** `selectMethod(method)` is called, **Then** `selectedMethod` reflects the chosen method.
2. **Given** a method is already selected, **When** a different method is selected, **Then** `selectedMethod` updates to the new one.
3. **Given** a method is selected, **When** `clearSelection()` is called, **Then** `selectedMethod` becomes `null`.

---

### User Story 4 - Sort Payment Methods (Priority: P3)

As a merchant developer, I want card payment to appear first by default so the most common payment method is prominently positioned.

**Why this priority**: Sorting improves UX but is not blocking for core functionality. A reasonable default (cards first) covers most use cases.

**Independent Test**: Can be tested by calling the hook with `showCardFirst: true` (default) and verifying PAYMENT_CARD appears as the first item.

**Acceptance Scenarios**:

1. **Given** PAYMENT_CARD is among available methods, **When** the hook is called with default options, **Then** PAYMENT_CARD appears first in the list.
2. **Given** the hook is called with `showCardFirst: false`, **Then** the original API order is preserved.

---

### Edge Cases

- What happens when the hook is called outside of a PrimerCheckout context/provider?
- What happens when payment method resources (logos, styling) fail to load for some methods?
- What happens when the available payment methods list changes after initial load (e.g., due to session update)?
- What happens when `include` contains a payment method type that doesn't exist in the available methods?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hook MUST return available payment methods with their display information (type, name, logo URL, background color, text color, border color, per-method surcharge amount) after SDK configuration is loaded.
- **FR-002**: Hook MUST expose loading state (`isLoading`) that is `true` while SDK configuration or payment method resources are being fetched.
- **FR-003**: Hook MUST support an `include` option to whitelist specific payment method types.
- **FR-004**: Hook MUST support an `exclude` option to blacklist specific payment method types.
- **FR-005**: Hook MUST sort card payment methods first by default, configurable via `showCardFirst` option.
- **FR-006**: Hook MUST provide `selectMethod` and `clearSelection` functions for managing selection state.
- **FR-007**: Hook MUST expose `selectedMethod` reflecting the currently selected payment method.
- **FR-008**: Hook MUST merge payment method availability data with display resources (logos, styling) into a unified item structure.
- **FR-009**: Hook MUST expose each method's native view information (whether it uses a native platform view and the view identifier).
- **FR-010**: Hook MUST expose each method's supported categories and intents for downstream routing decisions.
- **FR-011**: Hook MUST expose an error state if payment method resolution fails.

### Key Entities

- **PaymentMethodItem**: Merged representation of a payment method combining availability data (type, categories, intents) with display resources (name, logo, colors) and per-method surcharge information. This is the primary data type consumers of the hook interact with.
- **UsePaymentMethodsOptions**: Configuration for the hook including `include`, `exclude`, `showCardFirst`, and lifecycle callbacks.
- **UsePaymentMethodsReturn**: The return value of the hook containing `paymentMethods`, `isLoading`, `error`, `selectedMethod`, `selectMethod`, and `clearSelection`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Merchant developers can render a complete payment method list using only data from this hook, without directly accessing SDK internals.
- **SC-002**: Filtering by include/exclude correctly reduces the returned list to only matching methods.
- **SC-003**: All payment method display information (name, logo, colors) is available on each returned item without additional data fetching by the consumer.
- **SC-004**: Selection state updates synchronously when `selectMethod` or `clearSelection` is called.
- **SC-005**: The hook correctly reflects loading state transitions: loading -> loaded (with methods) or loading -> loaded (empty) or loading -> error.

## Assumptions

- The SDK's `PrimerCheckoutProvider` (or equivalent context) is a prerequisite and will be available as an ancestor component before this hook is used.
- Payment method availability data and display resources are already exposed by the SDK's native bridge layer and accessible from the checkout context.
- The hackathon branch (`nq/hackathon-components`) implementation of `usePaymentMethodList` serves as a proven reference for the data merging and filtering approach.
- The `PaymentMethodItem` type will align with what the downstream `PrimerPaymentMethodList` component (ACC-6492) needs, since that component depends on this hook.
- Analytics event firing (e.g., `PAYMENT_METHOD_SELECTION`) is the responsibility of the consuming component (ACC-6492), not this hook.
