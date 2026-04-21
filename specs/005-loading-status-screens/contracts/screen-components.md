# Screen Component Contracts

**Feature**: 005-loading-status-screens  
**Date**: 2026-04-02

## Internal Components (not exported to SDK consumers)

These components live in `src/Components/internal/screens/` and are registered in the navigation system's `screenMap`. They are not part of the public API.

### LoadingScreen

```typescript
// No props — reads route via useRoute<CheckoutRoute.loading>()
function LoadingScreen(): React.ReactElement
```

**Renders**: ActivityIndicator (56px, `colors.primary`), "Loading" title, "This may take a few seconds." subtitle.
**Route**: `CheckoutRoute.loading` and `CheckoutRoute.splash` (both map to this component)

### SuccessScreen

```typescript
// No props — reads route via useRoute<CheckoutRoute.success>()
function SuccessScreen(): React.ReactElement
```

**Renders**: Green checkmark icon (56px, `colors.iconPositive`), "Payment successful" title, "You'll be redirected to the order confirmation page soon." subtitle.
**Route**: `CheckoutRoute.success`

### ErrorScreen

```typescript
// No props — reads route via useRoute<CheckoutRoute.error>()
function ErrorScreen(): React.ReactElement
```

**Renders**: Red warning icon (56px, `colors.iconNegative`), "Payment failed" title, "There was a network issue." subtitle, "Retry" button (primary), "Choose other payment method" button (outlined).
**Route**: `CheckoutRoute.error`

## Shared Internal Components

### StatusScreenLayout

```typescript
interface StatusScreenLayoutProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode; // slot for buttons or additional content below the message
}

function StatusScreenLayout(props: StatusScreenLayoutProps): React.ReactElement
```

### CheckoutButton

```typescript
interface CheckoutButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'outlined';
}

function CheckoutButton(props: CheckoutButtonProps): React.ReactElement
```

## Icon Components

### CheckCircleIcon

```typescript
function CheckCircleIcon(props: { size: number; color: string }): React.ReactElement
```

Built from RN View primitives (circle background + checkmark via borders/transforms). No SVG dependency.

### WarningTriangleIcon

```typescript
function WarningTriangleIcon(props: { size: number; color: string }): React.ReactElement
```

Built from RN View primitives. No SVG dependency.

## Screen Map Registration

Screens are registered in the `screenMap` passed to `NavigationContainer`:

```typescript
const screenMap: Partial<Record<CheckoutRoute, React.ComponentType>> = {
  // ... existing screens ...
  [CheckoutRoute.splash]: LoadingScreen,
  [CheckoutRoute.loading]: LoadingScreen,
  [CheckoutRoute.processing]: LoadingScreen, // same component, potentially different text later
  [CheckoutRoute.success]: SuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
};
```
