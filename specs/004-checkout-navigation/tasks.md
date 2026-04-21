# Tasks: Checkout Navigation & Route System

**Input**: Design documents from `/specs/004-checkout-navigation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/navigation-api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create directory structure for the navigation module

- [x] T001 Create navigation module directory at `src/Components/internal/navigation/` and test directory at `src/__tests__/navigation/`

---

## Phase 2: Foundational (Types, Reducer, Context)

**Purpose**: Core type definitions and state management that ALL user stories depend on

- [x] T002 [P] Define `CheckoutRoute` enum, `RouteParamMap` type map, `RouteEntry`, `NavigationState`, and `NavigationAction` union type in `src/Components/internal/navigation/types.ts` — per data-model.md entities and contracts/navigation-api.md
- [x] T003 [P] Implement `navigationReducer` with all actions (push, pop, replace, popToRoot, setAnimating) in `src/Components/internal/navigation/navigationReducer.ts` — push/replace generate unique keys via counter, pop no-ops at root, popToRoot keeps first entry only
- [x] T004 [P] Create `NavigationContext` with typed context value (state + action dispatchers) in `src/Components/internal/navigation/NavigationContext.ts`

**Checkpoint**: Core types and reducer are defined. All state transitions are implementable.

---

## Phase 3: User Stories 1 & 2 - Push/Pop Navigation + Back (Priority: P1) MVP

**Goal**: Working stack navigation with push (typed params), pop, replace, popToRoot, and Android hardware back. Screens switch immediately (no animation yet).

**Independent Test**: Push a screen with params, verify it renders. Pop back, verify previous screen appears. Press Android back button, verify same behavior as pop.

### Implementation

- [x] T005 [US1] Implement `NavigationProvider` component in `src/Components/internal/navigation/NavigationProvider.tsx` — wraps children with `NavigationContext.Provider`, uses `useReducer` with `navigationReducer`, accepts `initialRoute` and optional `initialParams` props
- [x] T006 [US2] Add Android `BackHandler` integration to `NavigationProvider` — register on mount, pop if stack > 1, propagate event if at root
- [x] T007 [P] [US1] Implement `useNavigation` hook in `src/Components/internal/navigation/useNavigation.ts` — returns `{ push, pop, replace, popToRoot, canGoBack }`, guards all actions when `isAnimating === true`
- [x] T008 [P] [US1] Implement `useRoute` hook in `src/Components/internal/navigation/useRoute.ts` — returns `{ route, params }` for the top stack entry, typed via generic parameter
- [x] T009 [US1] Implement `NavigationContainer` component in `src/Components/internal/navigation/NavigationContainer.tsx` — accepts `screenMap` prop, renders the component mapped to the current top-of-stack route (no animation in this phase, direct swap)
- [x] T010 [US1] Create public barrel export in `src/Components/internal/navigation/index.ts` — export `NavigationProvider`, `NavigationContainer`, `useNavigation`, `useRoute`, `CheckoutRoute`, and relevant types

**Checkpoint**: Push screens with typed params, pop back, replace, popToRoot, Android back — all functional. Screens switch instantly. This is the MVP.

---

## Phase 4: User Story 3 - Generic Header Component (Priority: P2)

**Goal**: Reusable header component with configurable slots (back button, left large title, center title, right component) that any screen can place independently.

**Independent Test**: Render header with different slot combinations. Verify back button triggers pop, title positions correctly, right component renders.

### Implementation

- [x] T011 [US3] Implement `NavigationHeader` component in `src/Components/internal/navigation/NavigationHeader.tsx` — props: `showBackButton?: boolean`, `onBackPress?: () => void` (defaults to `pop()`), `leftLargeTitle?: string`, `centerTitle?: string`, `rightComponent?: ReactNode`. Layout: back button on far left, then either left large title or center title, right component on far right. Uses design tokens from ThemeContext for spacing/typography if available.
- [x] T012 [US3] Update barrel export in `src/Components/internal/navigation/index.ts` — add `NavigationHeader` and its prop types to exports

**Checkpoint**: Screens can render headers with any combination of slots. Header is fully decoupled from navigation state management.

---

## Phase 5: User Story 5 - Screen Transitions (Priority: P3)

**Goal**: Animated slide transitions between screens. Push slides in from right, pop slides out to right, replace crossfades.

**Independent Test**: Trigger push/pop and observe animated transition between screens completing within 300ms.

### Implementation

- [x] T013 [US5] Add animated transition logic to `NavigationContainer` in `src/Components/internal/navigation/NavigationContainer.tsx` — use RN `Animated.timing` (250ms duration). On push: new screen slides in from right while old slides left. On pop: reverse. On replace: crossfade. Set `isAnimating` true at start, false on completion. Render both old and new screens during transition using absolute positioning.
- [x] T014 [US5] Add transition lock to `useNavigation` in `src/Components/internal/navigation/useNavigation.ts` — all navigation actions (push/pop/replace/popToRoot) should no-op when `state.isAnimating === true` (already guarded in T007, verify it works with animation lifecycle)

**Checkpoint**: All navigation operations have smooth animated transitions. Rapid taps are debounced by the animation lock.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case hardening and final verification

- [x] T015 Verify edge cases: pop at root no-ops, rapid navigation debounced, replace preserves stack depth, popToRoot from root no-ops — manual test in NavigationContainer
- [x] T016 Run TypeScript compilation (`yarn typescript`) to verify no type errors across navigation module
- [x] T017 Run linter (`yarn lint`) and fix any issues in navigation module files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 — core MVP
- **US3 (Phase 4)**: Depends on Phase 3 (needs `useNavigation` for back button)
- **US5 (Phase 5)**: Depends on Phase 3 (enhances `NavigationContainer`)
- **Polish (Phase 6)**: Depends on all prior phases

### User Story Dependencies

- **US1+US2 (P1)**: Start after Phase 2 — no other story dependencies
- **US3 (P2)**: Needs `useNavigation` from US1+US2 — for back button default handler
- **US4 (P2)**: Included in Phase 2 (reducer) and Phase 3 (hooks) — no separate phase needed since replace/popToRoot are just additional reducer cases
- **US5 (P3)**: Enhances existing `NavigationContainer` — can start after Phase 3

### Parallel Opportunities

- **Phase 2**: T002, T003, T004 are all independent files — run in parallel
- **Phase 3**: T007 and T008 are independent hooks — run in parallel
- **Phase 4 + Phase 5**: Can run in parallel (header is independent from transitions)

---

## Parallel Example: Phase 2

```
# All foundational files can be created simultaneously:
Task T002: "Define types in src/Components/internal/navigation/types.ts"
Task T003: "Implement reducer in src/Components/internal/navigation/navigationReducer.ts"
Task T004: "Create context in src/Components/internal/navigation/NavigationContext.ts"
```

## Parallel Example: Phase 3

```
# Hooks are independent files:
Task T007: "Implement useNavigation in src/Components/internal/navigation/useNavigation.ts"
Task T008: "Implement useRoute in src/Components/internal/navigation/useRoute.ts"
```

---

## Implementation Strategy

### MVP First (Phase 1-3)

1. Complete Phase 1: Setup directories
2. Complete Phase 2: Types + reducer + context (3 parallel tasks)
3. Complete Phase 3: Provider, hooks, container, exports
4. **STOP and VALIDATE**: Push/pop/replace/popToRoot all work with typed params, Android back works
5. This is a fully functional navigation system without animations or header

### Incremental Delivery

1. Phase 1-3 → MVP navigation (push/pop/replace/popToRoot)
2. Phase 4 → Add header component (screens get navigation chrome)
3. Phase 5 → Add transitions (polish)
4. Phase 6 → Edge case hardening, lint, type-check

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US4 (popToRoot/replace) is folded into Phase 2 (reducer) and Phase 3 (hooks) since they are just additional cases in the same files — no separate phase needed
- No test tasks generated (not explicitly requested in spec)
- Commit after each phase or logical group
