# Tasks: PrimerPaymentMethodList Component + Checkout Flow

**Input**: Design documents from `/specs/007-payment-method-list/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Type definitions and project structure

- [X] T001 Create PrimerPaymentMethodListTypes.ts with PrimerPaymentMethodListProps and PaymentMethodButtonProps interfaces in src/models/components/PrimerPaymentMethodListTypes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Internal button component and LoadingScreen enhancement

- [X] T002 Create PaymentMethodButton component in src/Components/internal/ui/PaymentMethodButton.tsx — renders a single payment method as either color style (filled background + centered logo Image) or outlined style (white background with border + icon + "Pay with [name]" text). Determine style from item.backgroundColor and item.logo presence. Use useTheme() for layout tokens (spacing, radii, typography). Button is 44px tall, full-width. Accept item: PaymentMethodItem and onPress callback props.
- [X] T003 [P] Make LoadingScreen accept optional title and subtitle props in src/Components/internal/screens/LoadingScreen.tsx — add title?: string (default: "Loading") and subtitle?: string (default: "This may take a few seconds.") props. Pass them to StatusScreenLayout instead of hardcoded values.

**Checkpoint**: Foundation ready — button component and generic loading screen available

---

## Phase 3: User Story 1 - Display Payment Methods as Branded Buttons (Priority: P1)

**Goal**: Render a FlatList of branded payment method buttons using usePaymentMethods hook

**Independent Test**: Mount component with checkout context → verify branded buttons render with correct logos and colors

- [X] T004 [US1] Create PrimerPaymentMethodList component in src/Components/PrimerPaymentMethodList.tsx — use FlatList to render PaymentMethodButton for each item from usePaymentMethods() hook. Wire up useTheme() for container styling (8px gap via ItemSeparatorComponent). Accept PrimerPaymentMethodListProps.
- [X] T005 [US1] Add loading state to PrimerPaymentMethodList in src/Components/PrimerPaymentMethodList.tsx — show ActivityIndicator when isLoading is true from the hook
- [X] T006 [US1] Add empty state to PrimerPaymentMethodList in src/Components/PrimerPaymentMethodList.tsx — render empty view (no buttons, no toggle) when paymentMethods array is empty and not loading

**Checkpoint**: Payment methods render as branded buttons. Loading and empty states work.

---

## Phase 4: User Story 2 - Select a Payment Method (Priority: P1)

**Goal**: Tapping a button fires analytics event and calls onSelect callback

**Independent Test**: Tap a payment method button → verify onSelect fires with correct PaymentMethodItem and PAYMENT_METHOD_SELECTION analytics event is emitted

- [X] T007 [US2] Wire onSelect callback in PrimerPaymentMethodList in src/Components/PrimerPaymentMethodList.tsx — pass onPress handler to each PaymentMethodButton that calls props.onSelect(item) when tapped
- [X] T008 [US2] Fire PAYMENT_METHOD_SELECTION analytics event on method tap in src/Components/PrimerPaymentMethodList.tsx — call PrimerAnalytics.trackEvent('PAYMENT_METHOD_SELECTION', { paymentMethodType: item.type }) on tap. Guard against analytics bridge not being available.

**Checkpoint**: Tapping any payment method fires callback + analytics.

---

## Phase 5: User Story 6 - Checkout Flow Orchestration (Priority: P1)

**Goal**: Wire up the full checkout flow: loading screen → method selection screen → payment form navigation

**Independent Test**: Open checkout sheet → verify loading screen with correct text → verify transition to method selection → tap a method → verify navigation to card form

- [X] T009 [US6] Create MethodSelectionScreen in src/Components/internal/screens/MethodSelectionScreen.tsx — renders NavigationHeader with title "Pay [amount]" and "Cancel" right action, "Choose payment method" section title using theme typography, and PrimerPaymentMethodList. On method select, call useNavigation().push(CheckoutRoute.cardForm, { paymentMethodType: method.type }).
- [X] T010 [US6] Wire checkout flow screen map and loading-to-selection transition — register LoadingScreen (with title "Loading your secure checkout", subtitle "This won't take long") and MethodSelectionScreen in the NavigationContainer screenMap. Add logic to transition from loading to methodSelection route when isReady is true and payment methods are loaded. Place this in the appropriate orchestration component (e.g., within CheckoutSheet usage or a new CheckoutFlow component).

**Checkpoint**: Full flow works: sheet opens → loading → method selection → tap method → navigates to form

---

## Phase 6: User Story 3 - Display Per-Method Surcharges (Priority: P2)

**Goal**: Show formatted surcharge amount on buttons that have surcharge data

**Independent Test**: Provide methods with surcharge data → verify formatted amount appears on button

- [X] T011 [US3] Add surcharge display to PaymentMethodButton in src/Components/internal/ui/PaymentMethodButton.tsx — when item.surcharge is defined, render a secondary text label showing the formatted amount. Use currency formatting if available, otherwise display raw number as fallback.

**Checkpoint**: Buttons with surcharge data show the amount. Buttons without surcharge are unchanged.

---

## Phase 7: User Story 4 - Expand/Collapse Payment Method List (Priority: P2)

**Goal**: Support collapsing the list to show only first N methods with a toggle

**Independent Test**: Set collapsedCount={2} with 5 methods → verify only 2 shown + "Show more" toggle. Tap toggle → all 5 shown.

- [X] T012 [US4] Add expand/collapse to PrimerPaymentMethodList in src/Components/PrimerPaymentMethodList.tsx — when collapsedCount prop is set and methods exceed that count, slice FlatList data to first N items. Add internal isExpanded state (default: false). Render "Show more" / "Show less" toggle button below the list using theme tokens. When collapsedCount is undefined or methods count is within threshold, show all methods with no toggle.

**Checkpoint**: Expand/collapse works with configurable threshold. No toggle when all methods fit.

---

## Phase 8: User Story 5 - Customizable Filtering and Ordering (Priority: P3)

**Goal**: Pass through include/exclude/showCardFirst options to the underlying hook

**Independent Test**: Provide include/exclude options → verify only expected methods appear in expected order

- [X] T013 [US5] Pass filtering props through to usePaymentMethods in src/Components/PrimerPaymentMethodList.tsx — forward include, exclude, and showCardFirst from PrimerPaymentMethodListProps to the usePaymentMethods() hook call

**Checkpoint**: Filtering and ordering work via props, delegating to hook logic.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Public API exports and validation

- [X] T014 [P] Add PrimerPaymentMethodList and PrimerPaymentMethodListProps exports to src/Components/index.ts
- [X] T015 [P] Add PrimerPaymentMethodList and PrimerPaymentMethodListProps exports to src/index.tsx
- [X] T016 Run lint check (npm run lint) and fix any issues across all new/modified files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — types only
- **Foundational (Phase 2)**: Depends on Phase 1 (types)
- **US1 (Phase 3)**: Depends on Phase 2 (button component)
- **US2 (Phase 4)**: Depends on Phase 3 (list must render before selection works)
- **US6 (Phase 5)**: Depends on Phase 3 + Phase 4 (needs list + selection working)
- **US3 (Phase 6)**: Depends on Phase 2 (button component)
- **US4 (Phase 7)**: Depends on Phase 3 (list must render before collapse works)
- **US5 (Phase 8)**: Depends on Phase 3 (list must render before filtering works)
- **Polish (Phase 9)**: Depends on all user story phases

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T014 and T015 can run in parallel (different files)
- US3 can start before US6 completes (different file: PaymentMethodButton vs screens)

---

## Implementation Strategy

### MVP First (US1 + US2 + US6)

1. Phase 1: Types (T001)
2. Phase 2: Button component + LoadingScreen enhancement (T002, T003)
3. Phase 3: List rendering (T004-T006)
4. Phase 4: Selection + analytics (T007-T008)
5. Phase 5: Checkout flow orchestration (T009-T010)
6. **STOP and VALIDATE**: Full flow works end-to-end

### Incremental Delivery

1. Setup + Foundational + US1 + US2 + US6 → MVP: full checkout flow with branded buttons
2. Add US3 → Surcharges visible on buttons
3. Add US4 → Expand/collapse for many methods
4. Add US5 → Filtering/ordering customization
5. Polish → Exports, lint

---

## Notes

- PaymentMethodButton follows existing CheckoutButton pattern: useTheme() + createStyles(tokens) + StyleSheet.create()
- Analytics bridge may not be on the implementation branch — guard with try/catch or optional import
- FlatList required per Jira (not View.map())
- LoadingScreen becomes generic with optional title/subtitle props, backward compatible
- MethodSelectionScreen owns the header and title, PrimerPaymentMethodList is just the button list
