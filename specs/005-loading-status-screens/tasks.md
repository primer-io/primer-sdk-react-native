# Tasks: Loading & Status Screens

**Input**: Design documents from `/specs/005-loading-status-screens/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Rebase branch and create directory structure

- [x] T001 Rebase `005-loading-status-screens` branch onto `ov/feat/ACC-6920` to get navigation system, design tokens, and checkout sheet
- [x] T002 Create directory `src/Components/internal/screens/` and initial barrel export file `src/Components/internal/screens/index.ts`

---

## Phase 2: Foundational (Shared Layout)

**Purpose**: Create the shared StatusScreenLayout component used by all three status screens

**CRITICAL**: All user story screens depend on this component

- [x] T003 Implement `StatusScreenLayout` component in `src/Components/internal/screens/StatusScreenLayout.tsx` — accepts `icon` (ReactNode), `title` (string), `subtitle` (string), and optional `children` (ReactNode) props. Layout: centered column with 48px vertical padding, 32px horizontal padding (`spacing.xxxlarge`), 56px icon area, `spacing.small` (8px) gap between icon and text, `spacing.xsmall` (4px) gap between title and subtitle. Use `useTheme()` + `useMemo` + `StyleSheet.create` pattern from NavigationHeader.tsx. Title uses `typography.bodyLarge` with `colors.textPrimary`, subtitle uses `typography.bodyMedium` with `colors.textSecondary`. Export from `index.ts`.

**Checkpoint**: StatusScreenLayout renders correctly with any icon/title/subtitle combination

---

## Phase 3: User Story 1 - Loading Screen (Priority: P1)

**Goal**: Display a loading/processing screen with a spinner and informational message

**Independent Test**: Navigate to the loading route in the demo app and verify the spinner, title ("Loading"), and subtitle ("This may take a few seconds.") render correctly with Figma-matching layout

### Implementation for User Story 1

- [x] T004 [US1] Implement `LoadingScreen` component in `src/Components/internal/screens/LoadingScreen.tsx` — uses `StatusScreenLayout` with React Native's `ActivityIndicator` (size 56, color `colors.primary`) as the icon, hardcoded title "Loading" and subtitle "This may take a few seconds.". Use `useSheetHeight().setHeight()` to set the sheet height in pixels appropriate for the content (icon + text only). Export from `index.ts`.

**Checkpoint**: LoadingScreen renders matching the Figma loading design when navigated to

---

## Phase 4: User Story 2 - Success Screen (Priority: P2)

**Goal**: Display a success confirmation screen with a green checkmark icon and success message

**Independent Test**: Navigate to the success route in the demo app and verify the green checkmark icon, title ("Payment successful"), and subtitle ("You'll be redirected to the order confirmation page soon.") render correctly

### Implementation for User Story 2

- [x] T005 [P] [US2] Implement `CheckCircleIcon` component in `src/Components/internal/screens/CheckCircleIcon.tsx` — accepts `size` (number) and `color` (string) props. Build from RN View primitives: circular background (`borderRadius: size/2`, `backgroundColor: color`) with a white checkmark inside (two bordered View arms rotated 45deg, same technique as `ChevronLeftIcon` in NavigationHeader.tsx). Export from `index.ts`.
- [x] T006 [US2] Implement `SuccessScreen` component in `src/Components/internal/screens/SuccessScreen.tsx` — uses `StatusScreenLayout` with `CheckCircleIcon` (size 56, color `colors.iconPositive`) as the icon, hardcoded title "Payment successful" and subtitle "You'll be redirected to the order confirmation page soon.". Use `useSheetHeight().setHeight()` to set the sheet height in pixels appropriate for the content (icon + text only). Export from `index.ts`.

**Checkpoint**: SuccessScreen renders matching the Figma success design when navigated to

---

## Phase 5: User Story 3 - Error Screen (Priority: P3)

**Goal**: Display an error screen with a warning icon, error message, and two action buttons (Retry + Choose other payment method)

**Independent Test**: Navigate to the error route in the demo app and verify the red warning icon, title ("Payment failed"), subtitle ("There was a network issue."), and both buttons render correctly and respond to taps

### Implementation for User Story 3

- [x] T007 [P] [US3] Implement `WarningTriangleIcon` component in `src/Components/internal/screens/WarningTriangleIcon.tsx` — accepts `size` (number) and `color` (string) props. Build from RN View primitives: triangle shape using border technique (transparent borders with colored bottom border) with an exclamation mark inside. Export from `index.ts`.
- [x] T008 [P] [US3] Implement `CheckoutButton` component in `src/Components/internal/screens/CheckoutButton.tsx` — accepts `title` (string), `onPress` (() => void), and `variant` ('primary' | 'outlined') props. Primary variant: `colors.primary` background, `colors.background` text. Outlined variant: `colors.background` background, `colors.border` border (`borders.default` width), `colors.textPrimary` text. Both: `typography.titleLarge`, `radii.medium` border radius, `spacing.medium` padding, full width, centered text. Use `TouchableOpacity`. Export from `index.ts`.
- [x] T009 [US3] Implement `ErrorScreen` component in `src/Components/internal/screens/ErrorScreen.tsx` — uses `StatusScreenLayout` with `WarningTriangleIcon` (size 56, color `colors.iconNegative`) as the icon, hardcoded title "Payment failed" and subtitle "There was a network issue.". Passes two `CheckoutButton` components as children: "Retry" (primary variant) and "Choose other payment method" (outlined variant) with `spacing.small` (8px) gap between them. Button `onPress` handlers trigger debug actions (console.log or navigation via `useNavigation`). Use `useSheetHeight().setHeight()` to set the sheet height in pixels to accommodate the taller content (buttons below the message area). Export from `index.ts`.

**Checkpoint**: ErrorScreen renders matching the Figma error design, both buttons are tappable and trigger debug actions

---

## Phase 6: User Story 4 - Debug Navigation (Priority: P4)

**Goal**: Register all status screens in the demo app's navigation so developers can navigate between them

**Independent Test**: Open the NavigationDemoScreen, navigate to loading/success/error screens, and verify transitions work with standard animations

### Implementation for User Story 4

- [x] T010 [US4] Update screen map in `example/src/screens/NavigationDemoScreen.tsx` — import `LoadingScreen`, `SuccessScreen`, `ErrorScreen` from `src/Components/internal/screens/` and register them: `[CheckoutRoute.splash]: LoadingScreen`, `[CheckoutRoute.loading]: LoadingScreen`, `[CheckoutRoute.processing]: LoadingScreen`, `[CheckoutRoute.success]: SuccessScreen`, `[CheckoutRoute.error]: ErrorScreen`. Replace the existing `PlaceholderScreen` mappings for these routes.

**Checkpoint**: All status screens are accessible via navigation in the demo app with push/pop/replace animations

---

## Phase 7: Polish & Validation

**Purpose**: Final validation across all screens

- [x] T011 Run `npm run lint` and fix any lint errors across all new files in `src/Components/internal/screens/`
- [x] T012 Run `npm test` and verify no regressions in existing tests
- [x] T013 Visual verification: run the example app, navigate to each status screen (loading, success, error), and confirm all match the Figma designs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — must complete first (rebase is critical)
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Loading (Phase 3)**: Depends on Foundational — no dependencies on other stories
- **US2 Success (Phase 4)**: Depends on Foundational — no dependencies on other stories
- **US3 Error (Phase 5)**: Depends on Foundational — no dependencies on other stories
- **US4 Debug Nav (Phase 6)**: Depends on US1 + US2 + US3 (needs all screens to exist)
- **Polish (Phase 7)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — independent
- **US2 (P2)**: Can start after Foundational (Phase 2) — independent, parallelizable with US1
- **US3 (P3)**: Can start after Foundational (Phase 2) — independent, parallelizable with US1 and US2
- **US4 (P4)**: Depends on US1 + US2 + US3 — integrates all screens into demo

### Within Each User Story

- Icon/button components before screen components (when applicable)
- Screen component uses StatusScreenLayout + its specific icon/buttons
- Export added to index.ts after each new component

### Parallel Opportunities

- **Phase 3-5**: US1, US2, and US3 can all proceed in parallel after Foundational completes
- **Within US2**: T005 (CheckCircleIcon) can start immediately
- **Within US3**: T007 (WarningTriangleIcon) and T008 (CheckoutButton) can run in parallel

---

## Parallel Example: User Stories 1-3

```text
# After Foundational (T003) completes, launch all three in parallel:

Agent 1 (US1): T004 — LoadingScreen
Agent 2 (US2): T005 (CheckCircleIcon) → T006 (SuccessScreen)
Agent 3 (US3): T007 + T008 (icon + button, parallel) → T009 (ErrorScreen)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (rebase branch)
2. Complete Phase 2: Foundational (StatusScreenLayout)
3. Complete Phase 3: US1 (LoadingScreen)
4. **STOP and VALIDATE**: LoadingScreen renders correctly in isolation
5. Can demo with just the loading screen registered

### Incremental Delivery

1. Setup + Foundational → StatusScreenLayout ready
2. Add US1 (LoadingScreen) → Test independently → simplest screen validated
3. Add US2 (SuccessScreen) → Test independently → icon pattern established
4. Add US3 (ErrorScreen) → Test independently → button pattern established
5. Add US4 (Demo integration) → All screens navigable in example app
6. Polish → lint, test, visual verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- All styling via `useTheme()` tokens — zero hardcoded values
- Icons built from RN View primitives — no SVG dependency
- All screens are stateless visual shells with hardcoded text
