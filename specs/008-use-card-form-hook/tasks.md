# Tasks: useCardForm() Hook + Tokenization & 3DS

**Input**: Design documents from `/specs/008-use-card-form-hook/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Type definitions and utility infrastructure

- [x] T001 [P] Create CardFormTypes with UseCardFormOptions, UseCardFormReturn, CardFormErrors, CardFormField in src/models/components/CardFormTypes.ts
- [x] T002 [P] Create debounce utility function in src/utils/debounce.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Internal bridge hook that manages RawDataManager lifecycle — all user stories depend on this

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create useRawDataManagerBridge internal hook in src/Components/internal/useRawDataManagerBridge.ts — manages configure(), event subscription (onValidation, onMetadataChange, onBinDataChange), cleanup on unmount, lazy init gated on isReady from PrimerCheckoutContext
- [x] T004 Add validation error parsing logic (map PrimerError[] to per-field CardFormErrors by matching errorId patterns) in src/Components/internal/useRawDataManagerBridge.ts or a separate utility

**Checkpoint**: Bridge hook ready — useCardForm can now be built on top

---

## Phase 3: User Story 1 — Card Form State Management (Priority: P1) 🎯 MVP

**Goal**: Hook manages card field state with auto-formatting and debounced native sync

**Independent Test**: Render plain TextInputs connected to hook updaters, type card details, confirm formatted values and native sync

- [x] T005 [US1] Implement useCardForm hook core in src/Components/hooks/useCardForm.ts — field state (cardNumber, expiryDate, cvv, cardholderName), updater functions with auto-formatting (card number spaces/4, expiry MM/YY slash, CVV digits/4), debounced setRawData() sync via useRawDataManagerBridge, requiredFields from manager, reset() function, cleanup on unmount
- [x] T006 [US1] Export useCardForm and CardForm types from src/Components/index.ts
- [x] T007 [US1] Re-export useCardForm and CardForm types from src/index.tsx

**Checkpoint**: Hook manages field state, formats input, syncs to native. Testable with plain TextInputs.

---

## Phase 4: User Story 2 — Real-Time Validation Feedback (Priority: P1)

**Goal**: Hook provides touch-based validation — errors only show for blurred fields

**Independent Test**: Enter invalid card number, blur field, confirm error appears. Fix it, confirm error clears.

- [x] T008 [US2] Add touched state tracking and markFieldTouched() to useCardForm in src/Components/hooks/useCardForm.ts — per-field touched booleans, errors filtered to only touched fields, onValidationChange callback
- [ ] T009 [US2] Add unit tests for validation and touch behavior in src/__tests__/components/useCardForm.test.ts — test errors hidden for untouched fields, shown after markFieldTouched, cleared when valid

**Checkpoint**: Validation errors appear per-field only after blur. Independently testable.

---

## Phase 5: User Story 3 — Payment Submission & Tokenization (Priority: P1)

**Goal**: submit() triggers tokenization via RawDataManager, guarded by isValid and isSubmitting

**Independent Test**: Fill valid card data, call submit(), verify tokenization flow completes in sandbox

- [x] T010 [US3] Add submit() and isSubmitting state to useCardForm in src/Components/hooks/useCardForm.ts — guard behind isValid and !isSubmitting (no-op if invalid or already submitting), call manager.submit(), track isSubmitting boolean, handle errors
- [ ] T011 [US3] Add unit tests for submit behavior in src/__tests__/components/useCardForm.test.ts — test submit no-op when invalid, no-op when already submitting, isSubmitting state transitions

**Checkpoint**: Full card payment flow works: enter data → validate → submit → tokenize. 3DS handled by native SDK transparently.

---

## Phase 6: User Story 4 — Card Network Detection (Priority: P2)

**Goal**: Hook exposes BIN data (detected card network) for brand icon display

**Independent Test**: Enter first 8 digits of a Visa card, verify binData.preferred reports Visa

- [x] T012 [US4] Add binData state to useCardForm in src/Components/hooks/useCardForm.ts — store PrimerBinData from onBinDataChange events, expose as binData property, call onBinDataChange option callback
- [ ] T013 [US4] Add unit test for BIN data in src/__tests__/components/useCardForm.test.ts — test binData updates on onBinDataChange event

**Checkpoint**: Card network detection works. Merchants can show brand icons.

---

## Phase 7: User Story 5 — Standalone Usage Outside Checkout Sheet (Priority: P2)

**Goal**: Prove hook works with just PrimerCheckoutProvider (no PrimerCheckoutSheet)

**Independent Test**: Render hook inside PrimerCheckoutProvider only, verify all functionality works

- [x] T014 [US5] Create CustomCardFormScreen example in example/src/screens/CustomCardFormScreen.tsx — plain TextInputs using useCardForm(), card network display, pay button with isValid/isSubmitting guards, error display for touched fields
- [x] T015 [US5] Register CustomCardFormScreen in example/src/App.tsx and add entry to CheckoutComponentsListScreen examples array in example/src/screens/CheckoutComponentsListScreen.tsx

**Checkpoint**: Example app demonstrates full custom card form without PrimerCheckoutSheet.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final validation

- [x] T016 Run npm run lint and npm test — ensure all pass
- [x] T017 Run npx tsc --noEmit — ensure no TypeScript errors
- [ ] T018 Manual verification: example app custom card form screen works end-to-end in sandbox
- [ ] T019 Run quickstart.md validation — verify code examples match actual API

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types needed for bridge hook)
- **US1 (Phase 3)**: Depends on Phase 2 (bridge hook)
- **US2 (Phase 4)**: Depends on US1 (adds to existing hook)
- **US3 (Phase 5)**: Depends on US2 (needs validation for submit guard)
- **US4 (Phase 6)**: Depends on Phase 2 only (can parallel with US1-3 but simpler to do after)
- **US5 (Phase 7)**: Depends on US1-3 (needs working hook to demonstrate)
- **Polish (Phase 8)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational — core hook
- **US2 (P1)**: Depends on US1 — adds validation layer
- **US3 (P1)**: Depends on US2 — adds submit with validation guard
- **US4 (P2)**: Can start after Foundational but sequential is simpler
- **US5 (P2)**: Depends on US1-3 — example screen needs working hook

### Parallel Opportunities

- T001 and T002 can run in parallel (different files, no dependencies)
- T006 and T007 can run in parallel after T005
- T012 and T013 are independent of US2/US3 implementation details

---

## Parallel Example: Phase 1

```bash
# Launch setup tasks together:
Task: "Create CardFormTypes in src/models/components/CardFormTypes.ts"
Task: "Create debounce utility in src/utils/debounce.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (types + debounce)
2. Complete Phase 2: Foundational (bridge hook)
3. Complete Phase 3: US1 — field state management
4. Complete Phase 4: US2 — validation feedback
5. Complete Phase 5: US3 — submit/tokenization
6. **STOP and VALIDATE**: Test with plain TextInputs in example app
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → Fields work with formatting → Testable
3. US2 → Validation works → Testable
4. US3 → Full payment flow → MVP complete
5. US4 → Card network detection → Enhancement
6. US5 → Example app screen → Documentation/demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- US1-3 are all P1 but sequential (each builds on the previous)
- US4-5 are P2 and could be deferred if time-constrained
- Commit after each phase checkpoint
