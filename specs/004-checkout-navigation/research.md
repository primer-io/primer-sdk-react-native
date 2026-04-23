# Research: Checkout Navigation & Route System

**Feature**: 004-checkout-navigation | **Date**: 2026-03-27

## R1: State-Driven Navigation Without Third-Party Libraries

**Decision**: Use React Context + `useReducer` for navigation state, with `Animated` API for transitions.

**Rationale**: The SDK already uses React Context for state management (`PrimerCheckoutContext`, `ThemeContext`). A reducer-based approach provides predictable state transitions (push/pop/replace/popToRoot) and is trivially testable. The RN `Animated` API is built-in and sufficient for slide transitions without adding dependencies.

**Alternatives considered**:
- `react-native-screens` + custom navigator: Adds a peer dependency the SDK shouldn't require.
- Raw `useState` with manual stack manipulation: Less predictable; reducer enforces valid state transitions.
- `react-native-reanimated`: More performant for complex gestures, but overkill for simple slide transitions. Could be adopted later if needed.

## R2: Route Parameters Type Safety

**Decision**: Use a route map type where each route defines its own parameter shape. Navigation functions are generic, constrained to the route map.

**Rationale**: TypeScript generics allow type-safe `push<Route>(route, params)` calls where `params` is inferred from the route. This catches parameter mismatches at compile time, which is valuable when many screens exist. The pattern is standard in typed navigation systems (React Navigation uses this approach).

**Alternatives considered**:
- Generic `Record<string, unknown>` for all params: No compile-time safety; errors caught only at runtime.
- Union type per route: Verbose and hard to extend. The route map approach scales better.

## R3: Header Component Architecture

**Decision**: A standalone `NavigationHeader` component with optional props for each slot (back button, left large title, center title, right component). Each screen renders it explicitly.

**Rationale**: Keeping the header decoupled from the navigation system means:
- No magic — each screen controls its own header layout.
- Testable in isolation without navigation context.
- Matches the spec requirement: "each screen places and configures this header independently."
- Aligns with existing pattern where `PrimerCheckoutProvider` wraps children without imposing UI.

**Alternatives considered**:
- Header managed by navigator (like React Navigation): Couples header to navigation state, adds complexity, and contradicts the spec's explicit per-screen header design.
- No shared header component (each screen builds its own): Leads to inconsistency and duplication.

## R4: Transition Animation Approach

**Decision**: Use RN `Animated` API with horizontal slide transitions. Push slides new screen in from right; pop slides current screen out to right. Replace uses a crossfade (no directional slide, since it's a swap not a forward/back navigation).

**Rationale**: Horizontal slide is the standard mobile navigation pattern. Using `Animated.timing` with 250ms duration keeps transitions snappy. A transition lock (boolean ref) prevents navigation actions during animation.

**Alternatives considered**:
- `LayoutAnimation`: Simpler API but less control over enter/exit sequencing; doesn't support concurrent old-screen-out + new-screen-in.
- No animation initially: Functional but jarring UX. Since the `Animated` API integration is straightforward, include it from the start.

## R5: Android Back Button Handling

**Decision**: Use RN's `BackHandler` API within the navigation provider. When a hardware back is pressed: if stack has >1 entry, pop; if stack has 1 entry (root), let the event propagate (no-op within navigation).

**Rationale**: `BackHandler` is the standard RN approach and is already used in the example app. The handler should be registered/unregistered with the provider's lifecycle.

**Alternatives considered**:
- Per-screen BackHandler: Requires each screen to manage its own handler; error-prone and redundant.
- Native module override: Unnecessary complexity when RN provides the API.
