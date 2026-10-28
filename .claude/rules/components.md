---
paths:
  - "src/Components/**"
  - "src/__tests__/components/**"
  - "src/index.tsx"
---

# Checkout Components

Built on `ov/feat/components`, reaching `master` through umbrella PR #331. Not released.

TypeScript here is **UI only** — payment logic lives in the native Headless SDKs, so what the native
side supports is the hard ceiling on what can be built.

## Layout

```
src/Components/
  Primer*.tsx     # most public components are loose files at this level,
                  #   not inside a subdirectory
  hooks/          # 8 of the 10 public hooks
  inputs/  status/  types/
  internal/       # implementation — but see the boundary note below
  analytics.ts    # PrimerAnalytics
  index.ts        # the Components barrel; re-exported by src/index.tsx
```

`internal/` also holds ~14 loose files (`cardNetwork.ts`, `routeMethodSelection.ts`,
`PrimerCheckoutContext.ts`, …) alongside its subdirectories.

**Generated — do not hand-edit**: `internal/localization/strings/` holds 58 locale JSON files
(~1 MB) pulled from Phrase (`phrase_config.yml`) and overwritten wholesale by the
`sync-phrase-translations` workflow. Add a string in Phrase, then dispatch the sync — an edit here
is lost on the next pull.

## Public surface

`src/index.tsx` is the only barrel that ships. Seventeen values come out of Components:

**Components** — `PrimerCheckoutProvider` (the root every integration needs first) ·
`PrimerCheckoutSheet` · `PrimerCardForm` · `PrimerCardFormProvider` · `PrimerPaymentMethodList` ·
`PrimerCardNetworkSelector` · `PrimerBillingAddressForm` · `PrimerAcceptedCardNetworks`

**Inputs** — `PrimerTextInput` · `PrimerCardNumberInput` · `PrimerExpiryDateInput` ·
`PrimerCVVInput` · `PrimerCardholderNameInput`

**Status screens** — `PrimerLoadingScreen` · `PrimerSuccessScreen` · `PrimerErrorScreen` ·
`PrimerStatusScreenLayout`

**Hooks** — `usePrimerCheckout` · `usePrimerCardForm` · `usePrimerPaymentMethod` ·
`usePrimerPaymentMethods` · `usePrimerCardNetwork` · `usePrimerCardNetworkSelection` ·
`usePrimerBillingAddressForm` · `usePrimerVaultManager` · `usePrimerTheme` · `usePrimerLocalization`

Plus `PrimerAnalytics`, the `Primer*Tokens` theme types, and the status/input prop types.

### The `internal/` boundary is real but already breached

Four public exports resolve through `internal/`, and they are not mistakes to "fix":

- `usePrimerTheme` and its `Primer*Tokens` types → `internal/theme`
- `usePrimerLocalization`, `TranslationParams`, `LocalizationResult` → `internal/localization`
- `PrimerCardFormProvider` → `internal/form-state`
- `CardNetworkId`, `CardNetworkDescriptor`, `CvvLabel` → `internal/cardNetwork`

Treat those as grandfathered. For **new** work, put anything public in `hooks/`, `inputs/`,
`status/`, `types/`, or a top-level `Primer*.tsx` — not in `internal/`. Everything else under
`internal/` is genuinely private; exporting from it turns an implementation detail into a contract.

## Conventions

- **One generic `usePrimerPaymentMethod(type)` serves every APM.** Cards use `usePrimerCardForm`.
  Per-method hooks were tried and removed (`9752c711` unified Google Pay) — don't reintroduce them.
- **Naming follows the Web SDK**: `Primer*` components, `usePrimer*` hooks, bare domain types with
  no prefix (`CardNetworkId`, `CardNetworkDetails`).
- The example app demonstrates the **prebuilt sheet only** — `PrimerCheckoutProvider` wrapping
  `PrimerCheckoutSheet`. No custom-hook UI screens.

### What the public API test does and doesn't cover

`src/__tests__/components/publicApi.test.tsx` reads `src/index.tsx` as text and asserts every
Checkout Components value and type it exports today against its `export { … } from` and
`export type { … } from` statements, plus one PCI guard: `PrimerCardInputProps` declares no
`value`, `onChange`, `onChangeText`, `cardForm` or `binData` member.

It checks names, not shapes — a changed prop or return type passes it. The list is the test's own:
a **new** public name is unguarded until you add it there, and an export written without `from`
(`export { X };`) is invisible to it.

## Native dependencies

Three Maven artifacts move together in `android/build.gradle` and must share a version:

```gradle
io.primer:android
io.primer:components-analytics
io.primer:components-bridge
```

Bumping one alone silently resolves the others from whatever is already in `mavenLocal()` — which
is also how you build against a local `primer-sdk-android` checkout. The failure surfaces later as
`Unresolved reference` on symbols like `ComponentsAnalyticsLoggingBridge`, not as a dependency
error. iOS pins `PrimerSDK` in `primer-io-react-native.podspec`.

Both are currently unreleased betas. Nothing in the PR gates checks that a pinned native version
actually exists — only the tag-time publish job does, so a bad pin stays green until release.
