# Data Model: usePaymentMethods Hook

## Entities

### PaymentMethodItem

Merged representation combining availability, display resources, and surcharge data.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `type` | `string` | `IPrimerHeadlessUniversalCheckoutPaymentMethod.paymentMethodType` | e.g., `"PAYMENT_CARD"`, `"PAYPAL"` |
| `name` | `string` | `IPrimerPaymentMethodResource.paymentMethodName` | Human-readable display name |
| `logo` | `string?` | `PrimerPaymentMethodAsset.paymentMethodLogo.colored \|\| .light` | Logo URL |
| `backgroundColor` | `string?` | `PrimerPaymentMethodAsset.paymentMethodBackgroundColor.colored` | Button background color |
| `isNativeView` | `boolean` | Derived from resource type | Whether method uses a native platform view |
| `nativeViewName` | `string?` | `PrimerPaymentMethodNativeView.nativeViewName` | Native view identifier |
| `categories` | `string[]` | `paymentMethodManagerCategories` | `"NATIVE_UI"`, `"RAW_DATA"`, `"CARD_COMPONENTS"` |
| `intents` | `string[]` | `supportedPrimerSessionIntents` | `"CHECKOUT"`, `"VAULT"` |
| `surcharge` | `number?` | `clientSession` (if available) | Surcharge amount in minor units |
| `resource` | `Resource` | Full resource object | For advanced customization |
| `paymentMethod` | `PaymentMethod` | Full availability object | For technical details |

### UsePaymentMethodsOptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `include` | `string[]?` | `undefined` | Whitelist of payment method types |
| `exclude` | `string[]?` | `undefined` | Blacklist of payment method types |
| `showCardFirst` | `boolean` | `true` | Sort PAYMENT_CARD to top |
| `onLoad` | `(methods: PaymentMethodItem[]) => void` | `undefined` | Callback when methods are resolved |

### UsePaymentMethodsReturn

| Field | Type | Description |
|-------|------|-------------|
| `paymentMethods` | `PaymentMethodItem[]` | Filtered, sorted list |
| `isLoading` | `boolean` | `true` while SDK or resources loading |
| `error` | `Error \| null` | Error during resolution |
| `selectedMethod` | `PaymentMethodItem \| null` | Currently selected method |
| `selectMethod` | `(method: PaymentMethodItem \| null) => void` | Set selection |
| `clearSelection` | `() => void` | Reset selection to null |

## Context Extension

`PrimerCheckoutContextValue` gains two fields:

| Field | Type | Description |
|-------|------|-------------|
| `paymentMethodResources` | `(PrimerPaymentMethodAsset \| PrimerPaymentMethodNativeView)[]` | Eagerly fetched on init |
| `isLoadingResources` | `boolean` | True while resources are being fetched |

## Data Flow

```
Native SDK
  │
  ├─ startWithClientToken() → availablePaymentMethods[]
  ├─ onClientSessionUpdate() → clientSession (with surcharge data)
  └─ AssetsManager.getPaymentMethodResources() → resources[]
  │
  ▼
PrimerCheckoutProvider (context)
  │
  ▼
usePaymentMethods(options)
  │
  ├─ Merge: availability + resources → PaymentMethodItem[]
  ├─ Enrich: attach surcharge from clientSession
  ├─ Filter: include/exclude
  ├─ Sort: showCardFirst
  └─ Return: { paymentMethods, isLoading, error, selectedMethod, ... }
```
