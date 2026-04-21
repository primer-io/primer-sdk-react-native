# Feature Specification: Loading & Status Screens

**Feature Branch**: `005-loading-status-screens`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "After #336, work on ACC-6919 — Loading & Status Screens for Checkout Components"

## Design References

- **Success screen**: [Figma](https://www.figma.com/design/fHmyhCfJZbwPoZRUc7Blqv/Checkout-Components-UI?node-id=245-36654&m=dev) — Green checkmark icon (56px), "Payment successful" title, "You'll be redirected to the order confirmation page soon." subtitle, centered layout with 48px vertical / 32px horizontal padding.
- **Loading/Processing screen**: [Figma](https://www.figma.com/design/fHmyhCfJZbwPoZRUc7Blqv/Checkout-Components-UI?node-id=254-463417&m=dev) — Blue spinner/loader (56px), "Loading" title, "This may take a few seconds." subtitle, same centered layout.
- **Error/Failed screen**: [Figma](https://www.figma.com/design/fHmyhCfJZbwPoZRUc7Blqv/Checkout-Components-UI?node-id=254-463351&m=dev) — Red warning triangle icon (56px), "Payment failed" title, "There was a network issue." subtitle, plus two full-width buttons: "Retry" (primary/filled) and "Choose other payment method" (outlined/secondary).

All three screens share a consistent layout pattern: a centered message area (icon + title + subtitle) within the checkout container. The error screen additionally includes a button group below the message.

## Scope Note

This feature implements **generic, static status screen components** with debug navigation functions. These screens are visual shells matching the Figma designs — they will not be wired to real checkout lifecycle logic or payment flows at this stage. Functional integration (state machine, real callbacks, auto-dismiss timers) will be handled in a subsequent ticket.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Loading Screen (Priority: P1)

As an SDK consumer, a loading/processing screen is available as a route in the checkout navigation, displaying a spinner and an informational message so that users see clear feedback during wait states.

**Why this priority**: The loading screen is the most commonly displayed status screen — it appears during initialization and payment processing. It's the simplest screen (no user actions) and establishes the shared layout pattern for the other status screens.

**Independent Test**: Can be fully tested by navigating to the loading route and verifying the spinner, title, and subtitle render correctly with the expected styling.

**Acceptance Scenarios**:

1. **Given** the checkout navigates to the loading route, **When** the loading screen renders, **Then** a circular spinner/activity indicator (56px), a "Loading" title (body/large), and a "This may take a few seconds." subtitle (body/medium) are displayed, all centered.
2. **Given** the loading screen is displayed, **When** the user views it, **Then** the layout matches the Figma design — icon area, text content area with 8px gap, 48px vertical padding, 32px horizontal padding.

---

### User Story 2 - Success Screen (Priority: P2)

As an SDK consumer, a success screen is available as a route in the checkout navigation, displaying a confirmation checkmark and a success message so that users receive positive feedback when a payment completes.

**Why this priority**: The success screen is the next simplest status screen — same layout as loading, with a different icon and text. No interactive elements.

**Independent Test**: Can be fully tested by navigating to the success route and verifying the checkmark icon, title, and subtitle render correctly.

**Acceptance Scenarios**:

1. **Given** the checkout navigates to the success route, **When** the success screen renders, **Then** a green checkmark icon (56px), a "Payment successful" title (body/large), and a "You'll be redirected to the order confirmation page soon." subtitle (body/medium) are displayed, all centered.
2. **Given** the success screen is displayed, **When** the user views it, **Then** the layout matches the Figma design with consistent spacing and typography tokens.

---

### User Story 3 - Error Screen (Priority: P3)

As an SDK consumer, an error screen is available as a route in the checkout navigation, displaying an error message with recovery action buttons so that users understand what went wrong and can take action.

**Why this priority**: The error screen is the most complex status screen — it extends the shared layout with a button group. The "Retry" and "Choose other payment method" buttons require interactive elements, though in this phase they trigger debug/placeholder actions only.

**Independent Test**: Can be fully tested by navigating to the error route and verifying the error icon, message, and both action buttons render correctly and respond to taps.

**Acceptance Scenarios**:

1. **Given** the checkout navigates to the error route, **When** the error screen renders, **Then** a red warning triangle icon (56px), a "Payment failed" title (body/large), and a "There was a network issue." subtitle (body/medium) are displayed, all centered.
2. **Given** the error screen is displayed, **When** the user views it, **Then** two full-width buttons are shown below the message: "Retry" (primary/filled style) and "Choose other payment method" (outlined/secondary style).
3. **Given** the error screen is displayed, **When** the user taps "Retry", **Then** a debug action is triggered (e.g., navigating back to loading or logging to console).
4. **Given** the error screen is displayed, **When** the user taps "Choose other payment method", **Then** a debug action is triggered (e.g., navigating back to method selection or logging to console).

---

### User Story 4 - Debug Navigation Between Status Screens (Priority: P4)

As a developer working on the checkout flow, I can navigate between the loading, success, and error screens using debug controls so that I can visually verify each screen during development without needing a real payment flow.

**Why this priority**: Debug navigation enables rapid iteration and visual testing of the screens without requiring backend integration. It supports the development workflow.

**Independent Test**: Can be fully tested by using the example app's demo screen to navigate to each status screen and trigger transitions between them.

**Acceptance Scenarios**:

1. **Given** the example/demo app is running, **When** a developer triggers navigation to any status screen route, **Then** the corresponding screen is displayed within the checkout sheet.
2. **Given** any status screen is displayed, **When** a developer triggers navigation to a different status screen, **Then** the navigation transition (push/replace) occurs with the standard animation.

---

### Edge Cases

- What happens if the loading screen is navigated to with no content customization? Default text ("Loading" / "This may take a few seconds.") is displayed.
- What happens if the error screen buttons are tapped multiple times rapidly? Each tap should be handled independently; no crash or inconsistent state.
- What happens if the sheet height needs to adjust for the error screen (which is taller due to buttons)? The sheet height context should accommodate the additional content.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a loading screen component that displays a spinner/activity indicator (56px), a title, and a subtitle, centered in the checkout container.
- **FR-002**: System MUST provide a success screen component that displays a green checkmark icon (56px), a title, and a subtitle, centered in the checkout container.
- **FR-003**: System MUST provide an error screen component that displays a red warning icon (56px), a title, a subtitle, and two full-width action buttons ("Retry" as primary, "Choose other payment method" as outlined).
- **FR-004**: All three status screens MUST follow the shared layout pattern from the Figma designs — icon + text content area with consistent padding (48px vertical, 32px horizontal) and spacing (8px between icon and text, 4px between title and subtitle).
- **FR-005**: All status screens MUST use the design token system for colors, typography, spacing, and border radii — no hardcoded values.
- **FR-006**: Each status screen MUST be registered as a navigable route in the existing checkout navigation system.
- **FR-007**: The error screen action buttons MUST be tappable and trigger debug/placeholder actions in this phase.
- **FR-008**: The error screen "Retry" button MUST use the primary/filled button style (brand color background, white text).
- **FR-009**: The error screen "Choose other payment method" button MUST use the outlined/secondary button style (white background, border, dark text).

### Key Entities

- **StatusScreen**: A pre-built screen component corresponding to a checkout status (loading, success, error). Each shares a common centered layout pattern (icon + title + subtitle) and is styled via design tokens.
- **StatusScreenButton**: An interactive element on the error screen representing a recovery action. Has two visual variants: primary (filled) and outlined (secondary).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three status screens (loading, success, error) render correctly and match the Figma designs when navigated to via the checkout navigation system.
- **SC-002**: All text, colors, spacing, and typography in the status screens are sourced from design tokens — zero hardcoded style values.
- **SC-003**: The error screen's two action buttons are visually distinct (primary vs. outlined) and respond to tap interactions.
- **SC-004**: All status screens display correctly within the checkout sheet at the default sheet height.
- **SC-005**: Navigation to and from each status screen works with the existing animated transitions (push, pop, replace).

## Assumptions

- The navigation system (routes, stack, animated transitions) and checkout sheet (modal container) are already implemented and available from PR #336 / ACC-6920.
- The `CheckoutRoute` enum already includes `splash`, `loading`, `processing`, `success`, and `error` routes with their parameter types defined.
- The design token system (`useTheme`) is available for styling all screens.
- Functional logic (state machine, auto-dismiss timers, real retry behavior, form disabling) is out of scope for this ticket and will be addressed in a follow-up.
- The loading screen serves double duty for both initialization (splash) and payment processing phases — the same component, potentially with different text, will be used for both.
- Button components may be extracted as shared/reusable primitives if the design token system doesn't already provide them.
