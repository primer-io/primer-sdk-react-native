---
paths:
  - "src/Components/**"
  - "src/__tests__/components/**"
---

# Checkout Components

The React Native Checkout Components surface, built on this branch (`ov/feat/components`) and
reaching `master` through umbrella PR #331. Not released yet.

TypeScript here is **UI only** — payment logic lives in the native Headless SDKs, so what the native
side supports is the hard ceiling on what can be built.

## Layout

```
src/Components/
  hooks/        # the public hooks (see below)
  inputs/       # field-level input components
  status/       # payment status surfaces
  types/        # shared public types
  internal/     # NOT public: theme, localization, navigation, screens,
                #   checkout-flow, checkout-sheet, form-state, currency, ui
```

## Public surface

`src/index.tsx` is still the only public barrel — nothing here ships unless exported there.

**Components**: `PrimerCheckoutSheet` · `PrimerCardForm` · `PrimerCardFormProvider` ·
`PrimerPaymentMethodList` · `PrimerCardNetworkSelector` · `PrimerBillingAddressForm` ·
`PrimerAcceptedCardNetworks`

**Hooks**: `usePrimerCheckout` · `usePrimerCardForm` · `usePrimerPaymentMethod` ·
`usePrimerPaymentMethods` · `usePrimerCardNetwork` · `usePrimerCardNetworkSelection` ·
`usePrimerBillingAddressForm` · `usePrimerVaultManager` · `usePrimerTheme` · `usePrimerLocalization`

**Also exported**: `PrimerAnalytics`, and the theme and status types.

**`internal/` is not API.** It holds the parts most likely to look reusable — theme, navigation,
form state — and exporting from it turns an implementation detail into a contract you then have to
keep. Anything genuinely public belongs in `hooks/`, `inputs/`, `status/` or `types/` first.

## Conventions

- **One generic `usePrimerPaymentMethod(type)` serves every APM.** Cards use `usePrimerCardForm`.
  Don't reintroduce per-method hooks — that was tried and removed.
- **Naming follows the Web SDK**: `Primer*` for components, `usePrimer*` for hooks, bare domain
  types with no prefix (`CardNetworkId`, `CardNetworkDetails`).
- **`src/__tests__/components/cardFormContracts.test.tsx` pins the public surface.** Rename or drop
  an export and it fails. That is deliberate — treat a failure there as "this is a breaking API
  change", not as a test to update.
- The example app demonstrates the **prebuilt sheet only**. No custom-hook UI screens.

## Native dependencies

Three Maven artifacts move together in `android/build.gradle`:

```gradle
io.primer:android
io.primer:components-analytics
io.primer:components-bridge
```

They must be pinned to the **same** version. Bumping one alone silently resolves the others from
whatever is already in `mavenLocal()`, and the failure surfaces later as `Unresolved reference` on
symbols like `ComponentsAnalyticsLoggingBridge` or `sendEvent` — not as a dependency error.

iOS pins `PrimerSDK` in `primer-io-react-native.podspec`, on the 3.x line.

## Tests

36 test files under `src/__tests__/`, most of them here in `components/`. Note the root
`yarn test` script passes `src/__tests__` as a **path argument**, so a test placed outside that
directory never runs.
