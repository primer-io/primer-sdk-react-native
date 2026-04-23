# Data Model: PrimerPaymentMethodList Component

## Entities

### PaymentMethodItem (existing — from ACC-6917)

Provided by the `usePaymentMethods()` hook. Represents a single payment method with merged availability + resource data.

| Field            | Type                                    | Description                          |
|------------------|-----------------------------------------|--------------------------------------|
| type             | string                                  | Payment method identifier (e.g., "PAYMENT_CARD") |
| name             | string                                  | Display name (e.g., "Card", "PayPal") |
| logo             | string \| undefined                     | Logo image URI from resource         |
| backgroundColor  | string \| undefined                     | Brand background color hex           |
| isNativeView     | boolean                                 | Whether method uses a native view    |
| nativeViewName   | string \| undefined                     | Native view component name           |
| categories       | string[]                                | Manager categories (NATIVE_UI, etc.) |
| intents          | string[]                                | Supported intents (CHECKOUT, VAULT)  |
| surcharge        | number \| undefined                     | Surcharge amount in minor units      |
| resource         | PrimerPaymentMethodAsset \| PrimerPaymentMethodNativeView | Raw resource |
| paymentMethod    | IPrimerHeadlessUniversalCheckoutPaymentMethod | Raw availability data |

### PrimerPaymentMethodListProps (new)

Props interface for the `PrimerPaymentMethodList` component.

| Field            | Type                                    | Description                          |
|------------------|-----------------------------------------|--------------------------------------|
| include          | string[] \| undefined                   | Whitelist of payment method types    |
| exclude          | string[] \| undefined                   | Blacklist of payment method types    |
| showCardFirst    | boolean \| undefined                    | Sort card to top (default: true)     |
| collapsedCount   | number \| undefined                     | Methods visible when collapsed (undefined = show all) |
| onSelect         | (method: PaymentMethodItem) => void     | Called when a method is tapped       |
| onLoad           | (methods: PaymentMethodItem[]) => void \| undefined | Called when methods are ready |
| style            | ViewStyle \| undefined                  | Container style override             |

### PaymentMethodButtonProps (new — internal)

Props for the internal `PaymentMethodButton` component.

| Field            | Type                                    | Description                          |
|------------------|-----------------------------------------|--------------------------------------|
| item             | PaymentMethodItem                       | The payment method to render         |
| onPress          | () => void                              | Tap handler                          |

## Button Style Logic

```
if item.backgroundColor AND item.logo:
  → COLOR style (filled background + centered logo)
else:
  → OUTLINED style (white bg + border + icon + "Pay with [name]" text)
```

## State

| State            | Type     | Scope    | Description                     |
|------------------|----------|----------|---------------------------------|
| isExpanded       | boolean  | Internal | Whether full list is shown      |

All other state (paymentMethods, isLoading, selectedMethod) comes from `usePaymentMethods()` hook.
