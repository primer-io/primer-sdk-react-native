# Feature Specification: useCardForm() Hook + Tokenization & 3DS

**Feature Branch**: `008-use-card-form-hook`
**Created**: 2026-04-14
**Status**: Draft
**Input**: ACC-6925 — useCardForm() hook providing form state, field management, validation, and payment submission via RawDataManager. 3DS handled transparently by native SDK.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Card Payment Form State Management (Priority: P1)

As a merchant developer, I want a hook that manages card form field state (card number, expiry, CVV, cardholder name) so I can build a card payment form without manually wiring up the native RawDataManager, event listeners, and cleanup logic.

**Why this priority**: This is the core value — without managed form state, every other capability (validation, submission, 3DS) is inaccessible. This single story delivers a working card form.

**Independent Test**: Can be fully tested by rendering plain TextInputs connected to the hook's field values and updaters, typing card details, and confirming the hook tracks all field values correctly.

**Acceptance Scenarios**:

1. **Given** a component inside PrimerCheckoutProvider, **When** `useCardForm()` is called, **Then** it returns field values (cardNumber, expiryDate, cvv, cardholderName), updater functions, and a list of required fields based on the merchant's configuration.
2. **Given** the hook is mounted, **When** the user types into a card number input and the updater function is called, **Then** the hook updates its internal state and syncs the data to the native SDK.
3. **Given** the hook is mounted, **When** the component unmounts, **Then** all native event listeners and the RawDataManager are cleaned up automatically.
4. **Given** the hook is mounted, **When** the user types rapidly, **Then** native bridge calls (setRawData) are debounced to avoid excessive bridge traffic.

---

### User Story 2 - Real-Time Validation Feedback (Priority: P1)

As a merchant developer, I want real-time validation feedback from the native SDK so I can show field-level errors to the user as they type (e.g., "Invalid card number", "Expired card").

**Why this priority**: Validation is essential for any usable card form — without it, users submit invalid data and get confusing errors.

**Independent Test**: Can be tested by entering an invalid card number and verifying the hook reports validation errors, then entering a valid card number and verifying errors clear.

**Acceptance Scenarios**:

1. **Given** a mounted hook, **When** the user enters an incomplete card number, **Then** the hook reports `isValid: false` with field-specific validation errors.
2. **Given** a mounted hook with invalid fields, **When** the user corrects all fields to valid values, **Then** `isValid` becomes `true` and errors clear.
3. **Given** a mounted hook, **When** validation errors are received from the native SDK, **Then** they are available per-field so the merchant can display errors next to the relevant input.

---

### User Story 3 - Payment Submission & Tokenization (Priority: P1)

As a merchant developer, I want a `submit()` function that triggers tokenization through the native SDK so I can process card payments without directly managing the RawDataManager.

**Why this priority**: Submission is the purpose of the form — without it, the hook collects data but cannot process payments.

**Independent Test**: Can be tested by filling valid card details, calling `submit()`, and verifying the tokenization flow completes (or errors are reported).

**Acceptance Scenarios**:

1. **Given** a mounted hook with valid card data, **When** `submit()` is called, **Then** the native SDK tokenizes the card and the payment flow proceeds.
2. **Given** a submission in progress, **When** the hook is queried, **Then** `isSubmitting` is `true` and fields should be treated as non-editable by the merchant.
3. **Given** a submission that fails, **When** the error is received, **Then** the hook reports the error and `isSubmitting` returns to `false`.
4. **Given** a submission that requires 3DS authentication, **When** the native SDK handles the 3DS challenge, **Then** the flow completes transparently without additional hook API calls from the merchant.

---

### User Story 4 - Card Network Detection (Priority: P2)

As a merchant developer, I want to know the detected card network (Visa, Mastercard, etc.) as the user types so I can display the appropriate card brand icon.

**Why this priority**: Enhances UX but is not required for a functional card form.

**Independent Test**: Can be tested by entering the first 8 digits of a Visa card and verifying the hook reports the detected network.

**Acceptance Scenarios**:

1. **Given** a mounted hook, **When** the user enters enough digits for BIN detection, **Then** the hook provides detected card network information (display name, network identifier).
2. **Given** a card with co-badged networks, **When** BIN data is received, **Then** both preferred and alternative networks are available.

---

### User Story 5 - Standalone Usage Outside Checkout Sheet (Priority: P2)

As a merchant developer, I want to use the hook outside of PrimerCheckoutSheet (with just PrimerCheckoutProvider) so I can build a fully custom checkout experience.

**Why this priority**: Enables the "custom UI" merchant integration path — critical for SDK flexibility but secondary to the core form functionality.

**Independent Test**: Can be tested by rendering the hook inside PrimerCheckoutProvider without PrimerCheckoutSheet and verifying all form functionality works identically.

**Acceptance Scenarios**:

1. **Given** a component inside PrimerCheckoutProvider but NOT inside PrimerCheckoutSheet, **When** `useCardForm()` is called, **Then** all functionality (field management, validation, submission) works identically.
2. **Given** the hook is used standalone, **When** `submit()` is called with valid data, **Then** tokenization and 3DS proceed normally.

---

### Edge Cases

- What happens when the hook is called before the SDK is ready (isReady is false)?
- What happens when `submit()` is called while a previous submission is still in progress?
- What happens when the component unmounts during an active submission?
- What happens when the network is unavailable during `setRawData()` or `submit()`?
- What happens when `submit()` is called with invalid/incomplete field data?
- What happens when the merchant's configuration does not require cardholder name but the hook consumer provides one?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hook MUST manage card form field state (cardNumber, expiryDate, cvv, cardholderName) with corresponding updater functions. Field values returned to the merchant MUST be auto-formatted (card number with spaces every 4 digits, expiry as MM/YY with slash).
- **FR-002**: Hook MUST sync field data to the native SDK via debounced bridge calls to avoid excessive native traffic.
- **FR-003**: Hook MUST provide real-time validation state (`isValid` boolean and per-field error details) sourced from the native SDK's validation events. Errors MUST only be surfaced for "touched" fields (fields the user has blurred). Hook MUST provide a `markFieldTouched()` function for merchants to control touch state.
- **FR-004**: Hook MUST provide a `submit()` function that triggers tokenization via the native RawDataManager.
- **FR-005**: Hook MUST report submission state (`isSubmitting` boolean) during the tokenization/3DS flow.
- **FR-006**: Hook MUST automatically clean up all native event listeners and the RawDataManager when the component unmounts.
- **FR-007**: Hook MUST provide the list of required input fields based on the merchant's configuration (e.g., whether cardholder name is required).
- **FR-008**: Hook MUST provide BIN data (detected card network, co-badged alternatives) when available from the native SDK.
- **FR-009**: Hook MUST work both inside PrimerCheckoutSheet (drop-in flow) and standalone with just PrimerCheckoutProvider (custom flow).
- **FR-010**: Hook MUST lazily initialize the RawDataManager (not on hook mount, but on first use) to avoid unnecessary native resource allocation.
- **FR-011**: Hook MUST prevent double-submission (calling `submit()` while already submitting should be a no-op).
- **FR-013**: Hook MUST guard `submit()` behind `isValid` — calling submit with invalid data should return early without triggering the native pipeline.
- **FR-012**: Hook MUST be exported from the package root alongside its return type for merchant consumption.

### Key Entities

- **CardFormFields**: The set of card input values — card number, expiry date, CVV, and optionally cardholder name.
- **ValidationState**: Overall form validity and per-field error details, sourced from native SDK validation events.
- **BinData**: Card network detection information including preferred network, alternative networks (co-badging), and enrichment status.
- **SubmissionState**: Whether a tokenization/3DS flow is currently in progress.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Merchants can build a working card payment form using the hook and plain input components with zero direct RawDataManager interaction.
- **SC-002**: Card form validation errors appear within 1 second of the user finishing a field edit.
- **SC-003**: Payment submission (tokenization + 3DS if required) completes successfully for valid card data in sandbox environment.
- **SC-004**: Hook cleanup on unmount leaves no dangling native event listeners or manager instances.
- **SC-005**: Bridge calls from rapid typing are debounced to no more than ~10 calls per second.
- **SC-006**: The hook works identically whether used inside PrimerCheckoutSheet or standalone with PrimerCheckoutProvider.

## Clarifications

### Session 2026-04-14

- Q: Should the hook auto-format card number and expiry input? → A: Yes — hook auto-formats card number (spaces every 4 digits) and expiry (MM/YY with auto-slash). Existing formatting utilities in the RN or native SDK should be reused.
- Q: When should validation errors be surfaced to the merchant? → A: Touch-based — hook tracks "touched" state per field, errors only surfaced for fields the user has blurred. Hook provides a `markFieldTouched()` function.
- Q: What should happen when submit() is called with invalid data? → A: Hook guards submit() behind isValid — returns early without triggering the native pipeline. Native SDK validation is a safety net but triggering the full pipeline (analytics, session prep, RawDataManager creation, validation round-trip) on invalid data is wasteful. Confirmed by native iOS SDK investigation: CheckoutComponents scope does not guard at scope level, but repository layer validates before tokenization.

## Assumptions

- The existing RawDataManager native bridge is stable and its API will not change during this work.
- 3DS authentication is handled entirely by the native SDK — the hook does not need to manage 3DS UI or state.
- The hook will initially support card payments only (PAYMENT_CARD type). Other RawDataManager-supported types (phone number, Bancontact, retail) are out of scope.
- The hook requires PrimerCheckoutProvider to be mounted (for SDK initialization) but does NOT require PrimerCheckoutSheet or the internal navigation system.
- Debounce timing for setRawData() calls will follow a reasonable default (~100-200ms) and can be tuned based on testing.
- The hook will be tested in the example app with plain TextInputs to prove it works standalone before pre-built input components (ACC-6494) are built on top.
