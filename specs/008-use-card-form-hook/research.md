# Research: useCardForm() Hook

## Decision: RawDataManager Lifecycle Management

**Decision**: Create a `useRawDataManagerBridge` internal hook that manages the full RawDataManager lifecycle (configure, event subscription, cleanup). The `useCardForm` hook composes this internally.

**Rationale**: The hackathon branch proved this pattern works. Separating bridge management from form logic keeps the hook testable and allows reuse if other RawDataManager-based hooks are needed later (e.g., for ACH or Bancontact).

**Alternatives considered**: Inline all manager logic in useCardForm — rejected because it conflates lifecycle management with form state logic.

## Decision: Field Formatting

**Decision**: Format card number (spaces every 4 digits), expiry (MM/YY with slash), and CVV (digits only, max 4) inside the hook. Strip formatting before sending to native via setRawData().

**Rationale**: No existing formatters in the codebase. Hackathon branch has working regex-based formatters. Native SDK expects raw unformatted data. Formatting in the hook prevents merchant integration bugs.

**Alternatives considered**: Leave formatting to merchants — rejected because it increases integration complexity and error surface.

## Decision: Debounce Strategy

**Decision**: Debounce `setRawData()` calls with ~150ms delay. Implement a simple debounce utility since none exists in the codebase.

**Rationale**: Jira notes flag 10+ calls/sec from rapid typing. The hackathon branch syncs immediately but this was noted as a performance concern. A short debounce reduces bridge traffic without perceptible lag.

**Alternatives considered**: No debounce (hackathon approach) — rejected per Jira guidance. Longer debounce (500ms) — rejected because validation feedback would feel sluggish.

## Decision: Lazy Initialization

**Decision**: RawDataManager is created and configured only when the SDK is ready (`isReady === true` from PrimerCheckoutContext). Uses the `enabled` flag pattern from hackathon's useRawDataManagerBridge.

**Rationale**: Creating the manager before SDK init causes native bridge errors. Watching `isReady` from context ensures proper sequencing.

**Alternatives considered**: Initialize on first field update — rejected because validation and required fields need the manager configured before any user interaction.

## Decision: Validation Error Parsing

**Decision**: Parse `PrimerError[]` from native `onValidation` callback into per-field error strings by matching `errorId` patterns (e.g., errorId containing "card" + "number" maps to cardNumber field).

**Rationale**: Native SDK returns flat error arrays without field association. Hackathon branch has a working parser. This mapping is essential for field-level error display.

**Alternatives considered**: Expose raw PrimerError array — rejected because merchants would need to implement the same parsing logic themselves.

## Decision: Submit Guard

**Decision**: `submit()` returns early (no-op) if `isValid` is false or `isSubmitting` is true. Does not throw.

**Rationale**: Native iOS SDK investigation confirmed the full pipeline (analytics, session prep, RawDataManager creation, validation round-trip) runs before failing on invalid data. Client-side guard is more efficient. No-op (vs throw) matches the double-submission pattern and is simpler for merchants.

**Alternatives considered**: Throw on invalid — rejected for consistency with double-submit guard. Let native reject — rejected as wasteful per iOS SDK analysis.
