# Feature Specification: PrimerPaymentMethodList Component

**Feature Branch**: `007-payment-method-list`
**Created**: 2026-04-09
**Status**: Draft
**Input**: User description: "ACC-6492 - Pre-built payment method list component on top of usePaymentMethods() hook with per-method surcharge display, API-provided button styling, analytics events, and expand/collapse state. Renders inside a checkout sheet using the custom navigation system."

## Clarifications

### Session 2026-04-09

- Q: Does the component render the "Choose payment method" section title? → A: No. The sheet screen owns the header and title. The component is only the button list.

## User Scenarios & Testing

### User Story 1 - Display Payment Methods as Branded Buttons (Priority: P1)

As an SDK consumer, I want a pre-built payment method list component that renders available payment methods as branded, full-width buttons so I can offer a polished checkout experience without building the UI from scratch.

Each payment method button is 44px tall and full-width. There are two button styles determined by the API-provided resource data:

- **Color button**: Filled background color with a centered brand logo (e.g., Apple Pay, Google Pay, PayPal). Used when the method provides a logo asset and background color.
- **Outlined button**: White background with a subtle border, displaying an icon and a "Pay with [name]" text label (e.g., "Pay with card"). Used when the method does not provide a filled branding style.

Some methods combine text + logo in the color style (e.g., Klarna shows "Pay with" text alongside a logo badge).

The component lives inside the checkout sheet screen. The sheet screen renders the amount header and "Choose payment method" section title above the list — the component itself is only the list of payment method buttons.

**Why this priority**: This is the core value proposition of the component. Without branded rendering, there is no reason to use a pre-built component over the raw hook.

**Independent Test**: Can be tested by mounting the component with a valid checkout session and verifying that each available payment method renders as a styled button with the correct brand assets and colors.

**Acceptance Scenarios**:

1. **Given** the SDK has loaded available payment methods and their resources, **When** the list component renders, **Then** each payment method appears as a full-width, 44px tall button with 8px vertical gap between buttons
2. **Given** a payment method has a background color and logo from the API, **When** it renders, **Then** the button uses the color button style with branded background and centered logo
3. **Given** a payment method is the card type (outlined style), **When** it renders, **Then** the button uses a white background with a border, displaying the card icon and "Pay with card" text
4. **Given** a payment method has no matching resource data, **When** it renders, **Then** the button falls back to an outlined style with a text-only label using the payment method name
5. **Given** the payment methods are still loading, **When** the list component renders, **Then** it shows a loading indicator

---

### User Story 2 - Select a Payment Method (Priority: P1)

As a customer, I want to tap a payment method button to begin the payment flow for that method so I can complete my purchase.

Tapping a payment method button fires an analytics event and uses the checkout navigation system to route the customer to the appropriate payment form for that method.

**Why this priority**: Selection is the primary interaction — without it the list is purely decorative.

**Independent Test**: Can be tested by tapping a payment method button and verifying the onSelect callback fires with the correct payment method and that a PAYMENT_METHOD_SELECTION analytics event is emitted.

**Acceptance Scenarios**:

1. **Given** the payment method list is displayed, **When** the customer taps a payment method button, **Then** the system fires a PAYMENT_METHOD_SELECTION analytics event with the selected method type
2. **Given** the payment method list is displayed, **When** the customer taps a payment method button, **Then** the component invokes the onSelect callback with the selected payment method item
3. **Given** the checkout navigation system is configured, **When** the customer taps a payment method, **Then** the system navigates to the payment form for that method via the checkout navigation system

---

### User Story 3 - Display Per-Method Surcharges (Priority: P2)

As a customer, I want to see any additional surcharge associated with each payment method so I can make an informed decision about which method to use.

When a payment method has a surcharge, it is displayed on the button alongside the method branding. The surcharge amount is formatted in the order's currency.

**Why this priority**: Surcharge transparency is a regulatory and UX concern but the list still works without it.

**Independent Test**: Can be tested by providing payment methods with surcharge data and verifying the formatted surcharge amount appears on the corresponding buttons.

**Acceptance Scenarios**:

1. **Given** a payment method has a surcharge amount, **When** the list renders, **Then** the surcharge is displayed on that method's button formatted in the order currency
2. **Given** a payment method has no surcharge, **When** the list renders, **Then** no surcharge label appears on that method's button

---

### User Story 4 - Expand/Collapse Payment Method List (Priority: P2)

As an SDK consumer, I want the payment method list to support an expanded and collapsed state so I can manage screen real estate in the checkout flow.

In the collapsed state, only a subset of payment methods is visible (e.g., the first N methods). A "Show more" / "Show less" toggle allows the customer to expand or collapse the full list.

**Why this priority**: Important for checkout flows with many payment methods, but a fully expanded list is a viable default.

**Independent Test**: Can be tested by rendering a list with more methods than the collapsed threshold and verifying the toggle shows/hides additional methods.

**Acceptance Scenarios**:

1. **Given** the number of available payment methods exceeds the collapsed threshold, **When** the list renders in collapsed mode, **Then** only the first N methods are visible with a "Show more" toggle
2. **Given** the list is in collapsed mode, **When** the customer taps "Show more", **Then** all payment methods become visible and the toggle changes to "Show less"
3. **Given** the list is in expanded mode, **When** the customer taps "Show less", **Then** the list collapses back to the first N methods
4. **Given** the number of available payment methods is within the collapsed threshold, **When** the list renders, **Then** all methods are shown without a toggle

---

### User Story 5 - Customizable Filtering and Ordering (Priority: P3)

As an SDK consumer, I want to filter and reorder which payment methods appear in the list so I can tailor the checkout experience for my use case.

The component accepts include/exclude lists and a flag to control whether card payment appears first, matching the options already supported by the underlying hook.

**Why this priority**: The hook already supports these options — the component just needs to pass them through. Lower priority since the defaults work for most cases.

**Independent Test**: Can be tested by providing include/exclude options and verifying only the expected methods appear in the expected order.

**Acceptance Scenarios**:

1. **Given** an include list is provided, **When** the list renders, **Then** only payment methods in the include list appear
2. **Given** an exclude list is provided, **When** the list renders, **Then** payment methods in the exclude list do not appear
3. **Given** showCardFirst is set to false, **When** the list renders, **Then** payment methods appear in API order without card prioritization

---

### User Story 6 - Checkout Flow Orchestration (Priority: P1)

As an SDK consumer, I want the checkout flow to automatically show a loading screen while the SDK initializes, then transition to the payment method list once ready, so I get a polished end-to-end experience out of the box.

The flow starts when the checkout sheet opens. It shows a loading screen with a spinner and message ("Loading your secure checkout" / "This won't take long"). When the SDK is ready and payment methods are loaded, the flow transitions to the method selection screen showing the payment method list with a header ("Pay [amount]") and section title ("Choose payment method").

**Why this priority**: Without the orchestration screen, the payment method list has no home in the checkout flow.

**Independent Test**: Open the checkout sheet → verify loading screen appears → verify transition to method selection when SDK becomes ready.

**Acceptance Scenarios**:

1. **Given** the checkout sheet opens, **When** the SDK is initializing, **Then** the loading screen shows a spinner with "Loading your secure checkout" and "This won't take long"
2. **Given** the SDK has finished loading, **When** payment methods are available, **Then** the flow transitions from loading to the method selection screen
3. **Given** the method selection screen is displayed, **When** the customer taps a payment method, **Then** the flow navigates to the appropriate payment form screen

---

### Edge Cases

- What happens when no payment methods are available? The component renders an empty state (no buttons, no toggle).
- What happens when the SDK encounters an error loading payment methods? The component shows an error state.
- What happens when a payment method's logo fails to load? The button falls back to outlined style with text-only display.
- How does the component handle a single payment method? It renders one button with no expand/collapse toggle.
- What happens if surcharge data is available but currency formatting is not? The raw numeric amount is displayed as fallback.

## Requirements

### Functional Requirements

- **FR-001**: Component MUST render each available payment method as a full-width, 44px tall branded button
- **FR-002**: Component MUST support two button styles: color (filled background + centered logo) and outlined (white background with border + icon + text label)
- **FR-003**: Component MUST apply API-provided styling (background color, text color, border color) to color-style buttons
- **FR-004**: Component MUST display the payment method's logo or icon from the payment method resources
- **FR-005**: Component MUST fall back to outlined style with text label when no logo/icon resource is available for a method
- **FR-006**: Component MUST fire a PAYMENT_METHOD_SELECTION analytics event when a payment method is tapped
- **FR-007**: Component MUST invoke an onSelect callback with the selected payment method item when tapped
- **FR-008**: Component MUST display per-method surcharge amounts formatted in the order currency when surcharge data is present
- **FR-009**: Component MUST support an expand/collapse toggle when the number of methods exceeds a configurable threshold
- **FR-010**: Component MUST show a loading indicator while payment methods or their resources are still loading
- **FR-011**: Component MUST accept include/exclude filtering options and a showCardFirst ordering option, delegating to the underlying hook
- **FR-012**: Component MUST render an empty state when no payment methods are available
- **FR-013**: Component MUST use a scrollable list for efficient rendering of many payment methods
- **FR-014**: Component MUST render with 8px vertical gap between buttons and 8px rounded corners on buttons
- **FR-015**: Component MUST support method selection via onSelect callback, enabling the parent screen to route to payment forms
- **FR-016**: LoadingScreen MUST accept optional title and subtitle props with sensible defaults
- **FR-017**: A MethodSelectionScreen MUST render the sheet header, "Choose payment method" title, and PrimerPaymentMethodList, and handle navigation on method selection
- **FR-018**: The checkout flow MUST start with the loading screen and transition to method selection when SDK is ready and payment methods are loaded

### Key Entities

- **PaymentMethodItem**: Represents a single payment method with its type, display name, logo, background color, surcharge, and selection state (provided by the usePaymentMethods hook)
- **PrimerPaymentMethodList**: The pre-built component that renders a list of PaymentMethodItem entries as branded buttons
- **PaymentMethodButton**: A single branded button within the list — either "color" style (filled background + logo) or "outlined" style (bordered + icon + text)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All available payment methods render as branded buttons within 200ms of data becoming available
- **SC-002**: 100% of payment method taps fire the correct analytics event and invoke the onSelect callback
- **SC-003**: Surcharge amounts display correctly for all payment methods that have surcharge data
- **SC-004**: Expand/collapse toggle correctly shows/hides methods beyond the threshold
- **SC-005**: Component renders correctly with 0, 1, 5, and 20+ payment methods without layout issues
- **SC-006**: Both button styles (color and outlined) render correctly matching the Figma design specification

## Assumptions

- The `usePaymentMethods()` hook (ACC-6917) is available and provides merged payment method data including resources and surcharge information
- Payment method resources (logos, colors) are fetched by the SDK and available through the checkout context
- The checkout navigation system handles routing to payment forms after method selection
- Analytics event emission uses the existing SDK analytics infrastructure
- Currency formatting for surcharges uses existing or planned currency utilities
- The expand/collapse threshold is configurable by the SDK consumer with a sensible default (e.g., 4 methods visible when collapsed)
- The button style (color vs outlined) is determined by the available resource data for each payment method — methods with a background color and logo use color style; methods without use outlined style
- The component renders inside the checkout sheet screen. The sheet screen owns the amount header ("Pay $99.00"), "Choose payment method" title, and "Cancel" action — the component is only the button list
- The component uses the existing theme system (design tokens for colors, spacing, typography, radii, borders) for layout and outlined button styling, while color-style buttons override with API-provided branding colors
