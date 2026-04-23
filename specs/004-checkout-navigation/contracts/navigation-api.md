# Navigation API Contract

**Feature**: 004-checkout-navigation | **Date**: 2026-03-27

This document defines the public API surface of the checkout navigation system. These are the types, hooks, and components that screen developers will use.

## Navigation Provider

```typescript
// Wraps checkout content to provide navigation context
<NavigationProvider initialRoute={CheckoutRoute} initialParams={RouteParamMap[route]}>
  {children}
</NavigationProvider>
```

**Props**:
- `initialRoute: CheckoutRoute` — The root screen to start with
- `initialParams?: RouteParamMap[route]` — Optional params for the root screen
- `children: React.ReactNode` — The checkout content tree

## useNavigation Hook

```typescript
const { push, pop, replace, popToRoot, canGoBack } = useNavigation();
```

**Returns**:
- `push<R extends CheckoutRoute>(route: R, params: RouteParamMap[R]): void` — Push a new screen
- `pop(): void` — Go back (no-op at root)
- `replace<R extends CheckoutRoute>(route: R, params: RouteParamMap[R]): void` — Replace current screen
- `popToRoot(): void` — Return to root screen
- `canGoBack: boolean` — `true` if stack has more than one entry

## useRoute Hook

```typescript
const { route, params } = useRoute<CheckoutRoute.cardForm>();
```

**Returns**:
- `route: CheckoutRoute` — Current route name
- `params: RouteParamMap[R]` — Type-safe parameters for this route

## NavigationContainer Component

```typescript
// Renders the current screen with transition animations
<NavigationContainer screenMap={screenMap} />
```

**Props**:
- `screenMap: Record<CheckoutRoute, React.ComponentType>` — Maps routes to screen components

## NavigationHeader Component

```typescript
<NavigationHeader
  showBackButton={true}
  leftLargeTitle="Payment"
  centerTitle="Enter Card"
  rightComponent={<CloseButton />}
  onBackPress={customBackHandler}  // optional, defaults to pop()
/>
```

**Props** (all optional):
- `showBackButton?: boolean` — Show/hide back arrow (default: `false`)
- `onBackPress?: () => void` — Custom back handler (default: calls `pop()`)
- `leftLargeTitle?: string` — Large title on the left
- `centerTitle?: string` — Centered title text
- `rightComponent?: React.ReactNode` — Custom right-side element

## CheckoutRoute Enum

```typescript
enum CheckoutRoute {
  splash = 'splash',
  loading = 'loading',
  methodSelection = 'methodSelection',
  cardForm = 'cardForm',
  processing = 'processing',
  success = 'success',
  error = 'error',
  countrySelector = 'countrySelector',
  vaultedMethods = 'vaultedMethods',
  deleteConfirmation = 'deleteConfirmation',
  cvvRecapture = 'cvvRecapture',
}
```
