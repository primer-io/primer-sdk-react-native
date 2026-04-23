# Research: Loading & Status Screens

**Feature**: 005-loading-status-screens  
**Date**: 2026-04-02

## R-001: Screen Component Pattern

**Decision**: Follow the established internal SDK component pattern from the NavigationHeader and demo screens on `ov/feat/ACC-6920`.

**Rationale**: The codebase already has a clear pattern for internal screen components:
- Functional components using `useTheme()` for token-based styling
- `useMemo` wrapping `StyleSheet.create()` with tokens as dependency
- `useNavigation()` and `useRoute()` hooks for navigation and params
- Screens are registered via `screenMap` passed to `NavigationContainer`

**Alternatives considered**:
- Using example app patterns (rejected — example app uses hardcoded styles and loose typing)
- External component library (rejected — SDK builds from RN primitives, no external UI deps)

## R-002: Icon Implementation

**Decision**: Build icons as simple React Native View-based components (same approach as `ChevronLeftIcon` in NavigationHeader).

**Rationale**: The existing `ChevronLeftIcon` in NavigationHeader.tsx is built purely from `View` components with borders and transforms — no SVG library dependency. The three icons needed are:
1. **Checkmark** — green circle background + checkmark shape (View with borders, rotated)
2. **Warning triangle** — can use similar border/transform technique or a simple Text-based icon
3. **Spinner** — React Native's built-in `ActivityIndicator` component (already used in example app)

**Alternatives considered**:
- react-native-svg (rejected — adds a dependency for only 2 static icons)
- Image assets / PNGs (rejected — doesn't scale with theme tokens, adds asset management)
- Emoji/Unicode symbols (rejected — inconsistent rendering across platforms)

## R-003: Button Component Approach

**Decision**: Create a shared internal button component with two variants (primary/filled and outlined/secondary).

**Rationale**: The error screen needs two visually distinct buttons matching the Figma design. The demo screen already has a `DemoButton` pattern but it's example-only. The SDK needs its own button primitive styled via design tokens. This component will be reusable for future screens (card form submit, etc.).

**Alternatives considered**:
- Inline buttons only in the error screen (rejected — buttons will be needed across multiple future screens)
- Using DemoButton from example app (rejected — it's in example/, not in the SDK src/)

## R-004: Layout Composition

**Decision**: Create a shared `StatusScreenLayout` wrapper that encapsulates the common centered layout (icon + title + subtitle), with the error screen extending it to add a button group.

**Rationale**: All three Figma screens share identical layout: centered message area with 48px vertical padding, 32px horizontal padding, 56px icon, 8px gap to text, 4px gap between title and subtitle. Extracting this avoids triple-duplication.

**Alternatives considered**:
- Each screen fully standalone (rejected — violates DRY, three copies of identical layout code)
- Single parameterized StatusScreen component (rejected — error screen's button group makes it structurally different enough to warrant composition over configuration)

## R-005: Branch Strategy

**Decision**: The `005-loading-status-screens` branch must be rebased onto `ov/feat/ACC-6920` before implementation begins.

**Rationale**: The navigation system, design tokens, checkout sheet, and route definitions all exist on `ov/feat/ACC-6920` (PR #336). The current branch was created from `ov/feat/ACC-6491` which doesn't have these dependencies.

**Alternatives considered**:
- Cherry-pick needed files (rejected — too many interdependent files, risk of inconsistency)
- Implement without dependencies and merge later (rejected — can't test screens without navigation/theme)

## R-006: Route Params Handling

**Decision**: Screens accept route params as defined in `RouteParamMap` but display hardcoded default text in this phase. Error screen receives `{ error: PrimerError }` param but shows static "Payment failed" / "There was a network issue." text.

**Rationale**: This is a generic/debug implementation phase. The route params infrastructure is already defined and screens should accept them for type safety, but displaying dynamic content from params is deferred to the functional integration ticket.

**Alternatives considered**:
- Display dynamic text from params now (rejected — user explicitly scoped this as generic static screens)
- Ignore params entirely (rejected — accepting params now means less rework when adding functional logic later)
