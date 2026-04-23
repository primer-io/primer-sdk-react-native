# Research: usePaymentMethods Hook

## R1: Context Data Availability

**Decision**: Extend `PrimerCheckoutContextValue` to include `paymentMethodResources` and `isLoadingResources`, following the hackathon branch pattern.

**Rationale**: The current context only exposes `availablePaymentMethods` (availability data). The hook needs display resources (logos, names, colors) to produce display-ready `PaymentMethodItem` objects. The hackathon branch already proved this approach by eagerly fetching resources via `AssetsManager.getPaymentMethodResources()` in the provider.

**Alternatives considered**:
- Fetch resources inside the hook itself — rejected because multiple hook instances would duplicate fetches, and the provider already has the initialization lifecycle.

## R2: Surcharge Data Source

**Decision**: Surcharge data is NOT available from the native bridge's payment method or resource APIs. It lives in the `clientSession.paymentMethodOptions` which is configured at the API level when creating the client session. The hook will need to access `clientSession` from context and extract per-method surcharge amounts.

**Rationale**: Examined the example app's `SettingsScreen.tsx` — surcharge amounts are set via `paymentMethodOptions[TYPE].surcharge.amount` (and `networks[NETWORK].surcharge.amount` for card networks). The `clientSession` is already in context. The hook can look up surcharge for each method type from `clientSession.order?.paymentMethodOptions` or equivalent.

**Open question**: The `PrimerClientSession` TypeScript type doesn't model `paymentMethodOptions`. This field exists at the API level and is passed through by native SDKs, but isn't typed in the RN layer. We'll need to check if the native bridge passes this through in the `onClientSessionUpdate` callback, or if surcharge needs to be sourced differently. For now, model the surcharge as `optional` on `PaymentMethodItem` since not all sessions have surcharges configured.

## R3: Currency Formatting Dependency

**Decision**: Currency formatting utilities (`formatCurrency`, `getMinorUnitDigits`) exist on branch `ov/feat/ACC-6926` but are NOT on the current branch. This hook's branch will need to merge or cherry-pick those utilities before implementing formatted surcharge display.

**Rationale**: The currency utilities are at `src/Components/internal/currency/` and use `Intl.NumberFormat` with ISO 4217 data. They're required for converting surcharge minor unit amounts to display strings.

**Alternatives considered**:
- Expose only raw surcharge amount (no formatting) — partially acceptable, but the spec clarification says "display-ready data including formatted surcharge amounts."

## R4: Hook Naming Convention

**Decision**: Name the hook `usePaymentMethods` (not `usePaymentMethodList` as in hackathon).

**Rationale**: The hackathon used `usePaymentMethodList` because it was tightly coupled to the `PaymentMethodList` component. The new hook is a general-purpose data hook that any component can consume. `usePaymentMethods` is more generic and appropriate.

## R5: Provider Context Extension Pattern

**Decision**: Extend the provider to fetch resources eagerly (on init), matching the hackathon branch approach.

**Rationale**: The hackathon branch calls `AssetsManager.getPaymentMethodResources()` after `startWithClientToken()` resolves, storing results in context. This is the right time because:
1. Resources can only be fetched after the headless checkout is initialized
2. Eager fetching means the hook doesn't need async logic
3. Single fetch shared across all hook consumers

**Files to modify**: `PrimerCheckoutProvider.tsx`, `PrimerCheckoutProviderTypes.ts`, `PrimerCheckoutContext.ts`
