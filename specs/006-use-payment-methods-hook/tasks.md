# Tasks: usePaymentMethods Hook

**Input**: Design documents from `/specs/006-use-payment-methods-hook/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create type definitions shared across all user stories

- [x] T001 [P] Create PaymentMethodItem, UsePaymentMethodsOptions, and UsePaymentMethodsReturn types in src/models/components/PaymentMethodTypes.ts (see contracts/usePaymentMethods.ts for shapes, add surcharge?: number field)
- [x] T002 [P] Extend PrimerCheckoutContextValue with paymentMethodResources and isLoadingResources fields in src/models/components/PrimerCheckoutProviderTypes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the provider to fetch and expose payment method resources — MUST complete before hook implementation

- [x] T003 Add resource fetching to PrimerCheckoutProvider in src/Components/PrimerCheckoutProvider.tsx — after startWithClientToken() resolves, call AssetsManager.getPaymentMethodResources(), store in state, track isLoadingResources, handle failure gracefully (set empty array), respect cancelled flag, update initialState with new fields

**Checkpoint**: Context now exposes paymentMethodResources and isLoadingResources — hook implementation can begin

---

## Phase 3: User Story 1 — Access Available Payment Methods (Priority: P1) — MVP

**Goal**: Hook returns merged payment method items with display info after SDK init

**Independent Test**: Call usePaymentMethods() inside a component after SDK init, verify it returns methods with type, name, logo, colors, surcharge

- [x] T004 [US1] Create usePaymentMethods hook in src/Components/hooks/usePaymentMethods.ts — consume usePrimerCheckout(), useMemo to merge availablePaymentMethods with paymentMethodResources into PaymentMethodItem[] (resource lookup map by paymentMethodType, extract logo/backgroundColor/name, attach surcharge from clientSession if available), expose isLoading (derived from !isReady || isLoadingResources), error state, return UsePaymentMethodsReturn
- [x] T005 [US1] Export usePaymentMethods from src/Components/hooks/index.ts (skipped — no hooks/index.ts, exported via Components/index.ts)
- [x] T006 [US1] Re-export usePaymentMethods from src/Components/index.ts (if barrel exists, otherwise skip)
- [x] T007 [US1] Add public exports to src/index.tsx — export usePaymentMethods hook and types (PaymentMethodItem, UsePaymentMethodsOptions, UsePaymentMethodsReturn)

**Checkpoint**: usePaymentMethods() returns merged, display-ready payment methods — core hook is functional

---

## Phase 4: User Story 2 — Filter Payment Methods (Priority: P2)

**Goal**: Hook supports include/exclude options to filter the returned list

**Independent Test**: Pass include or exclude arrays to hook options, verify returned list is correctly filtered

- [x] T008 [US2] Add include/exclude filtering logic to usePaymentMethods in src/Components/hooks/usePaymentMethods.ts — inside the useMemo, after merge: apply include filter first (if provided, keep only matching types), then apply exclude filter (remove matching types)

**Checkpoint**: Filtering works — include whitelist, exclude blacklist, combined include-then-exclude

---

## Phase 5: User Story 3 — Select a Payment Method (Priority: P2)

**Goal**: Hook provides selection state management (selectMethod, clearSelection, selectedMethod)

**Independent Test**: Call selectMethod() with a method, verify selectedMethod updates; call clearSelection(), verify it becomes null

- [x] T009 [US3] Add selection state to usePaymentMethods in src/Components/hooks/usePaymentMethods.ts — useState for selectedMethod, useCallback for selectMethod (sets state) and clearSelection (sets null), include in return value

**Checkpoint**: Selection state works — select, change, clear

---

## Phase 6: User Story 4 — Sort Payment Methods (Priority: P3)

**Goal**: PAYMENT_CARD appears first by default, configurable via showCardFirst option

**Independent Test**: Call hook with default options, verify PAYMENT_CARD is first; call with showCardFirst: false, verify original order

- [x] T010 [US4] Add showCardFirst sorting logic to usePaymentMethods in src/Components/hooks/usePaymentMethods.ts — inside useMemo after filtering, if showCardFirst (default true), sort PAYMENT_CARD to index 0 using stable sort; add showCardFirst to useMemo deps

**Checkpoint**: Sorting works — cards first by default, original order when disabled

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T011 Add onLoad callback support to usePaymentMethods in src/Components/hooks/usePaymentMethods.ts — useEffect that calls options.onLoad when paymentMethods array changes and is non-empty
- [x] T012 Run npm test && npm run lint to verify no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 run in parallel
- **Foundational (Phase 2)**: Depends on T002 (context types must exist before provider uses them)
- **US1 (Phase 3)**: Depends on Phase 2 (provider must expose resources)
- **US2 (Phase 4)**: Depends on T004 (hook must exist to add filtering)
- **US3 (Phase 5)**: Depends on T004 (hook must exist to add selection)
- **US4 (Phase 6)**: Depends on T004 (hook must exist to add sorting)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Blocks US2, US3, US4 (hook file must exist first)
- **US2 (P2)**: Independent of US3, US4
- **US3 (P2)**: Independent of US2, US4
- **US4 (P3)**: Independent of US2, US3

### Parallel Opportunities

- T001 and T002 run in parallel (different files)
- T005, T006, T007 run in parallel after T004 (different files, export wiring)
- T008, T009, T010 could be developed in parallel on branches (same file but independent logic blocks), though sequential is simpler for a single developer

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 + T002 in parallel
2. Complete Phase 2: T003
3. Complete Phase 3: T004 → T005 + T006 + T007 in parallel
4. **STOP and VALIDATE**: usePaymentMethods() returns methods with display data

### Incremental Delivery

1. Setup + Foundational → Context ready
2. US1 → Hook returns merged methods (MVP)
3. US2 → Filtering works
4. US3 → Selection works
5. US4 → Sorting works
6. Polish → onLoad callback, verification

---

## Notes

- US2, US3, US4 are all modifications to the same hook file (T004 creates it, T008-T010 add features) — sequential execution is natural
- No test tasks generated (not explicitly requested in spec)
- Surcharge data availability depends on clientSession contents — implementation should handle it as optional gracefully
