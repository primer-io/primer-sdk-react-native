# Data Model: Checkout Navigation & Route System

**Feature**: 004-checkout-navigation | **Date**: 2026-03-27

## Entities

### CheckoutRoute (Enum)

Represents the set of known checkout screens.

| Value                | Description                          |
| -------------------- | ------------------------------------ |
| `splash`             | Initial loading/splash screen        |
| `loading`            | Generic loading state                |
| `methodSelection`    | Payment method list                  |
| `cardForm`           | Card data entry                      |
| `processing`         | Payment processing indicator         |
| `success`            | Payment success confirmation         |
| `error`              | Payment error display                |
| `countrySelector`    | Country picker                       |
| `vaultedMethods`     | Saved payment methods list           |
| `deleteConfirmation` | Confirm deletion of vaulted method   |
| `cvvRecapture`       | Re-enter CVV for vaulted card        |

### RouteParamMap (Type Map)

Maps each `CheckoutRoute` to its parameter type. Routes with no parameters map to `undefined`.

| Route                | Params                                                    |
| -------------------- | --------------------------------------------------------- |
| `splash`             | `undefined`                                               |
| `loading`            | `undefined`                                               |
| `methodSelection`    | `undefined`                                               |
| `cardForm`           | `{ paymentMethodType: string }`                           |
| `processing`         | `undefined`                                               |
| `success`            | `{ checkoutData?: unknown }`                              |
| `error`              | `{ error: PrimerError }`                                  |
| `countrySelector`    | `{ selectedCountryCode?: string }`                        |
| `vaultedMethods`     | `undefined`                                               |
| `deleteConfirmation` | `{ paymentMethodId: string }`                             |
| `cvvRecapture`       | `{ paymentMethodId: string; last4: string }`              |

*Note: Param shapes will be refined as individual screens are implemented. The navigation system accepts the types generically; it does not inspect parameter contents.*

### RouteEntry

A single entry on the navigation stack.

| Field    | Type                        | Description                              |
| -------- | --------------------------- | ---------------------------------------- |
| `route`  | `CheckoutRoute`             | Which screen to display                  |
| `params` | `RouteParamMap[route]`      | Parameters for that screen               |
| `key`    | `string`                    | Unique identifier for this stack entry   |

**Identity rule**: Each `RouteEntry` has a unique `key` (generated on push/replace). Two entries may share the same `route` but always differ in `key`.

### NavigationState

The full navigation state managed by the reducer.

| Field        | Type           | Description                                   |
| ------------ | -------------- | --------------------------------------------- |
| `stack`      | `RouteEntry[]` | Ordered route stack; last = currently visible  |
| `isAnimating`| `boolean`      | True during a transition animation             |

**Invariants**:
- `stack` always has at least one entry (the root).
- `isAnimating` is `true` only during the animated transition window (~250ms).
- No navigation actions dispatched while `isAnimating === true`.

## State Transitions (Navigation Actions)

| Action       | Input                              | Effect                                                    |
| ------------ | ---------------------------------- | --------------------------------------------------------- |
| `push`       | `route`, `params`                  | Append new `RouteEntry` to end of stack                   |
| `pop`        | none                               | Remove last entry (no-op if stack length === 1)           |
| `replace`    | `route`, `params`                  | Replace last entry with new `RouteEntry`                  |
| `popToRoot`  | none                               | Remove all entries except the first                       |
| `setAnimating` | `boolean`                        | Set the `isAnimating` flag                                |

## Relationships

```
NavigationProvider (Context)
  └── provides: NavigationState + dispatch actions
       ├── NavigationContainer (renders current screen with transitions)
       └── Screens (consume params via useRoute hook)
            └── NavigationHeader (optional, placed by each screen)
                 ├── back button slot → calls pop action
                 ├── left large title slot
                 ├── center title slot
                 └── right component slot
```
