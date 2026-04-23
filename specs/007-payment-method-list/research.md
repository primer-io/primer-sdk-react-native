# Research: PrimerPaymentMethodList Component

## R1: Navigation System Integration

**Decision**: Component does NOT navigate directly. Uses callback pattern — parent screen handles navigation via `useNavigation().push()`.

**Rationale**: The existing navigation system uses a custom stack-based router with `CheckoutRoute` enum. The `methodSelection` route is the screen that hosts the list. On method tap, the parent pushes the appropriate route (e.g., `cardForm` with `{ paymentMethodType }` params). This keeps the list component reusable and decoupled from routing logic.

**Alternatives considered**:
- Component navigates directly via `useNavigation()` — rejected because it couples the component to specific routes and prevents reuse in non-navigation contexts.

## R2: Analytics Event Firing

**Decision**: Fire `PrimerAnalytics.trackEvent('PAYMENT_METHOD_SELECTION', { paymentMethodType })` on method tap. Analytics bridge may not be available on all branches yet.

**Rationale**: The analytics system uses a native bridge (`PrimerAnalytics` from `src/Components/analytics.ts`) with `trackEvent(name, metadata)`. The analytics bridge is on `origin/ov/feat/analytics-logging-bridge` and may not be merged to the implementation branch. Implementation should guard against missing analytics gracefully.

**Alternatives considered**:
- Native event emitter pattern — rejected because `trackEvent` is the established pattern.
- Skip analytics entirely — rejected because it's a spec requirement (FR-006).

## R3: Theme System Usage

**Decision**: Use `useTheme()` for layout tokens. Color buttons override with API branding.

**Rationale**: Existing components (`CheckoutButton`, `NavigationHeader`, `StatusScreenLayout`) all use the `useTheme()` hook returning `PrimerTokens`. Pattern is `createStyles(tokens)` with `StyleSheet.create()`. Outlined buttons use `tokens.colors.background`, `tokens.colors.border`, `tokens.colors.textPrimary`. Color buttons use `resource.paymentMethodBackgroundColor.colored` for background and logo image for content.

**Alternatives considered**:
- Hackathon's custom theme object — rejected because the project now has a proper design token system.

## R4: Button Style Determination

**Decision**: Determine style from resource data. If resource has `paymentMethodBackgroundColor.colored` AND `paymentMethodLogo.colored`, use color style. Otherwise use outlined style.

**Rationale**: The Figma design shows Apple Pay, Google Pay, PayPal, Klarna as color-filled buttons (each with API-provided background + logo). Card uses outlined style (white bg, border, icon + text). The resource types `PrimerPaymentMethodAsset` has `paymentMethodLogo` and `paymentMethodBackgroundColor`; `PrimerPaymentMethodNativeView` has only `nativeViewName`. This maps naturally to color vs outlined.

**Alternatives considered**:
- Explicit style prop per method — rejected because the API data already determines the style.
- Hackathon's native view detection — partially adopted; native views may need special handling.

## R5: Expand/Collapse Implementation

**Decision**: Use internal `useState` for expanded state with optional `collapsedCount` prop. Default behavior: show all (no collapse).

**Rationale**: The hackathon reference has no expand/collapse. The spec requires it for checkout flows with many methods. Making it opt-in via `collapsedCount` prop means existing usage shows all methods (simpler), and consumers opt into collapse when needed.

**Alternatives considered**:
- Always collapsed with default count — rejected because most checkouts have 3-5 methods where collapse adds unnecessary friction.
- External state control — rejected because it's internal UI state, not business state.

## R6: FlatList vs View.map()

**Decision**: Use FlatList per Jira requirement.

**Rationale**: Jira explicitly states "Use FlatList (not .map())". Even though hackathon used `.map()` and typical method counts (3-10) don't need virtualization, FlatList provides scroll behavior, empty state support, and is the idiomatic React Native approach.

**Alternatives considered**:
- View + .map() (hackathon approach) — rejected per Jira requirement.
