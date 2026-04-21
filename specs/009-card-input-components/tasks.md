# Tasks: Card Input Components

**Input**: Design documents from `/specs/009-card-input-components/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/CardInputComponents.ts

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Types and directory structure

- [X] T001 Create CardInputTheme and component prop types in src/models/components/CardInputTypes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared base component used by all four input components. Includes theme layering (PrimerTokens baseline + CardInputTheme overrides), focus state management, label/error rendering, and border color logic.

**CRITICAL**: No US1 component work can begin until this phase is complete.

- [X] T002 Create internal CardInputBase component in src/Components/inputs/CardInputBase.tsx — shared layout (label + TextInput + error text), useTheme() integration, CardInputTheme override merging, focus state (local useState), border color logic (error > focused > default), editable={!cardForm.isSubmitting}

**Checkpoint**: Base component ready — individual input components can now be built in parallel.

---

## Phase 3: User Story 1 — Connected Card Inputs (Priority: P1)

**Goal**: Four input components that auto-wire to useCardForm() hook. Each reads its field value, calls its update function, marks touched on blur, and displays errors.

**Independent Test**: Render all four components with useCardForm(), type card data, verify formatting appears, blur to see errors, confirm isValid updates.

- [X] T003 [P] [US1] Create CardNumberInput component in src/Components/inputs/CardNumberInput.tsx — wraps CardInputBase with keyboardType=number-pad, maxLength=19, autoComplete=cc-number, optional card network icon via cardForm.binData
- [X] T004 [P] [US1] Create ExpiryDateInput component in src/Components/inputs/ExpiryDateInput.tsx — wraps CardInputBase with keyboardType=number-pad, maxLength=5, autoComplete=cc-exp
- [X] T005 [P] [US1] Create CVVInput component in src/Components/inputs/CVVInput.tsx — wraps CardInputBase with keyboardType=number-pad, maxLength=4, secureTextEntry=true, autoComplete=cc-csc
- [X] T006 [P] [US1] Create CardholderNameInput component in src/Components/inputs/CardholderNameInput.tsx — wraps CardInputBase with keyboardType=default, autoCapitalize=words, autoComplete=name
- [X] T007 [US1] Create barrel export in src/Components/inputs/index.ts
- [X] T008 [US1] Wire exports in src/Components/index.ts and src/index.tsx — add CardNumberInput, ExpiryDateInput, CVVInput, CardholderNameInput, CardInputTheme, CardInputBaseProps type exports

**Checkpoint**: All four components render, auto-wire to useCardForm(), format input, show errors on blur. US1 fully functional.

---

## Phase 4: User Story 2 — Themed Card Inputs (Priority: P2)

**Goal**: Components respect SDK theme (light/dark) by default and accept CardInputTheme overrides for merchant brand customization.

**Independent Test**: Render inputs with custom theme prop (primaryColor, errorColor, borderRadius), verify visual overrides apply. Render without theme prop, verify SDK default tokens used.

Theme support is built into CardInputBase (Phase 2). This phase verifies it works end-to-end. No additional implementation tasks — US2 is satisfied by the foundational theme layering in T002.

**Checkpoint**: Theme overrides work. Light/dark mode defaults work.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Example screen for end-to-end testing and demonstration.

- [X] T009 [P] Create CustomCardFormScreen in example/src/screens/CustomCardFormScreen.tsx — uses PrimerCheckoutProvider + useCardForm() + all four input components + submit button
- [X] T010 [P] Add "Card Form" entry in example/src/screens/CheckoutComponentsListScreen.tsx
- [X] T011 Register CustomCardFormScreen in example/src/App.tsx

**Checkpoint**: Example app shows card form screen with all inputs, validates, and submits.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) — BLOCKS all US1 tasks
- **US1 (Phase 3)**: Depends on T002 (CardInputBase) — T003-T006 can run in parallel
- **US2 (Phase 4)**: Satisfied by Phase 2 — no additional work
- **Polish (Phase 5)**: Depends on T008 (exports wired) — T009-T010 can run in parallel

### Within US1

- T003, T004, T005, T006 are [P] — all four components can be built simultaneously (different files)
- T007 depends on T003-T006 (barrel export needs all components)
- T008 depends on T007 (SDK exports need barrel)

### Parallel Opportunities

```
Phase 2 done →
  T003 CardNumberInput  ──┐
  T004 ExpiryDateInput  ──┤── all parallel
  T005 CVVInput          ──┤
  T006 CardholderNameInput┘
                            → T007 barrel → T008 exports
                                              → T009 example ──┐── parallel
                                              → T010 list entry ┘
                                                → T011 register screen
```

---

## Implementation Strategy

### MVP (US1 Only)

1. T001: Types
2. T002: CardInputBase
3. T003-T006: All four components (parallel)
4. T007-T008: Exports
5. **VALIDATE**: Inputs render, format, validate, submit via useCardForm()

### Full Delivery

1. MVP above
2. T009-T011: Example screen
3. Verify in simulator

---

## Notes

- No test tasks generated (not explicitly requested)
- US2 (theming) requires no additional tasks — implemented as part of CardInputBase
- Components are pure UI — formatting lives in useCardForm() hook
- All components follow connected-only pattern (cardForm prop required)
