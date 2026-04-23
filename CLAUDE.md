# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@primer-io/react-native` is a thin bridge over the native Primer SDKs:
- iOS depends on CocoaPod `PrimerSDK` (version pinned in `primer-io-react-native.podspec`).
- Android depends on Maven artifact `io.primer:android` (version pinned in `android/build.gradle`).

The JS/TS layer surfaces two entry points: `Primer` (drop-in Universal Checkout) and `HeadlessUniversalCheckout` (plus per-payment-method managers: `RawDataManager`, `KlarnaManager`, `AchManager`, `ComponentWithRedirectManager`, `VaultManager`, `AssetsManager`, `NativeUIManager`).

## Commands

Yarn workspaces (root + `example/`). Package manager is pinned: `yarn@3.6.1` via Corepack. Node >= 20 (see `.nvmrc`).

```sh
yarn                       # install deps (root + example workspace)
yarn bootstrap             # install deps + iOS pods for example app
yarn typescript            # tsc --noEmit, type-check the SDK
yarn lint                  # ESLint over **/*.{js,ts,tsx}
yarn lint --fix
yarn test                  # Jest, runs src/__tests__ with coverage
yarn test -- <pattern>     # run a single test file, e.g. yarn test -- RawDataManager
yarn build                 # react-native-builder-bob: emits lib/module + lib/typescript
yarn clean                 # removes lib/ and android/ios build dirs

# Example app (workspace: @primer-io/react-native-example)
yarn example start         # Metro
yarn example ios           # run iOS example
yarn example android       # run Android example
yarn example pods          # cd example/ios && pod install --repo-update
```

Android unit tests (from the example app, via Fastlane — same command CI uses):

```sh
bundle exec fastlane android run_unit_tests_coverage
# which runs: gradle clean koverXmlReportRelease in example/android
```

iOS unit tests run through Fastlane / the `.github/actions/ios-sdk-tests` composite action; locally you typically test via the example Xcode workspace at `example/ios/example.xcworkspace`.

Coverage aggregation for SonarCloud: `yarn test:unit:coverage:lcov` (runs Jest, then `scripts/aggregate-coverage.js`, then nyc lcov report).

## Architecture

### Three-layer bridge

1. **TypeScript SDK (`src/`)** — public API consumers import.
   - `src/index.tsx` is the single export surface. Re-exports use short aliases (e.g. `PrimerHeadlessUniversalCheckout as HeadlessUniversalCheckout`). New exports belong here.
   - `src/Primer.ts` / `src/HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout.ts` implement the public classes. They wire JS-side decision handlers (tokenization / resume / payment creation / error) and subscribe to native events via `NativeEventEmitter`.
   - `src/RNPrimer.ts` and `src/HeadlessUniversalCheckout/RNPrimerHeadlessUniversalCheckout.ts` are the private wrappers that call into the TurboModule and manage event subscriptions.
   - `src/specs/NativePrimer.ts` is the **codegen spec** — `TurboModuleRegistry.getEnforcing<Spec>('NativePrimer')`. Any new native method must be added to this `Spec` interface first; codegen produces the Obj-C++ / Kotlin glue from it (see `codegenConfig` in `package.json`: module name `NativePrimerSpec`, package `com.primerioreactnative`, iOS modules provider `NativePrimer → RCTNativePrimer`).
   - `src/models/` holds all public TS types that mirror native data models. Domain-specific subfolders: `ach/`, `banks/`, `klarna/`.

2. **iOS native (`ios/Sources/`)** — Swift + Objective-C++.
   - `NativePrimer/RCTNativePrimer.mm` is the TurboModule entry point wired via `codegenConfig.ios.modulesProvider`.
   - `RNTPrimer.swift` implements the Universal Checkout methods; `Headless Universal Checkout/` mirrors it for headless, with per-manager Swift classes under `Headless Universal Checkout/Managers/`.
   - `DataModels/` contains `*+Extension.swift` files that convert between the Primer iOS SDK types and the dictionaries/strings passed over the RN bridge, plus `ImplementedRNCallbacks.swift` which tracks which JS callbacks the consumer registered.
   - Events are posted via `RCTEventEmitter`. Event names must match the `EventType` union in `src/RNPrimer.ts`.

3. **Android native (`android/src/main/java/com/primerioreactnative/`)** — Kotlin.
   - `DefaultNativePrimerModule.kt` is the core implementation; `NativePrimerModule.kt` exists twice — `src/newarch/java/.../NativePrimerModule.kt` for Fabric/TurboModules, `src/oldarch/java/.../NativePrimerModule.kt` for the old bridge. The active source set is selected in `android/build.gradle` via `isNewArchitectureEnabled()` / the `newArchEnabled` project property.
   - `PrimerRNEventListener.kt` and `PrimerRNHeadlessUniversalCheckoutListener.kt` adapt Primer Android callbacks to `DeviceEventManagerModule` events.
   - `datamodels/` holds Kotlin data classes (serialized via `kotlinx-serialization`); `extensions/` holds converters from Primer SDK types to these RN data classes. Keep the split: `datamodels` = RN-side shape, `extensions` = mapping from the native Primer SDK.
   - `components/manager/` mirrors the headless manager layer (Raw Data, Klarna, ACH, ComponentWithRedirect, NativeUI, Vault, Assets).

### Event + handler flow

Bridge communication is two-directional:
- **JS → native**: TurboModule methods on the `Spec` interface (promise-returning).
- **Native → JS**: `NativeEventEmitter` events. The set of supported events is the `EventType` union in `src/RNPrimer.ts`. On both native sides you must emit the exact same string name.

The native side learns which JS callbacks the consumer implemented via the `detectImplementedRNCallbacks` event + the `setImplementedRNCallbacks` TurboModule method — this is how e.g. `onBeforePaymentCreate` is only invoked when the consumer actually provides it. When adding a new optional consumer callback you need to update `PrimerImplementedRNCallbacks` on all three layers.

### Build / packaging

- SDK build uses `react-native-builder-bob` with targets `module` (ESM) + `typescript`, outputting to `lib/`. The `exports` field in `package.json` points `.` to `./src/index.tsx` (source), `./lib/typescript/src/index.d.ts` (types), and `./lib/module/index.js` (default).
- The `prepare` script runs `bob build`, so `yarn install` in a consumer also builds the library.
- Android uses Gradle 8.13 / AGP 8.13.0 / JDK 17 toolchain, `minSdkVersion 23`. Kotlin plugins: `kotlin-android`, `kotlinx-serialization`, `detekt`, `kover`.
- iOS minimum deployment target: 13.0. The podspec sets `SWIFT_ENABLE_EXPLICIT_MODULES = NO`.

### Versioning / release

- Bumping the SDK version: update `package.json` `version`, the Primer iOS SDK dep in `primer-io-react-native.podspec`, and the Primer Android SDK dep in `android/build.gradle`. There's a helper `scripts/update-ios-version.sh`.
- Release is driven by `release-it` + `@release-it/conventional-changelog` (angular preset). Commit messages follow Conventional Commits (`fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`) and are validated by commitlint.

### CI

- GitHub Actions under `.github/workflows/`: unit tests for RN/Android/iOS + SonarCloud aggregation, RN-version compatibility matrix, iOS and Android build-and-distribute (Appetize previews), Danger JS / Kotlin / Swift for PR feedback, and SDK validation.
- Jobs skip on draft PRs (`if: github.event_name == 'push' || github.event.pull_request.draft == false`).
- Secondary CI config exists in `.circleci/config.yml` and `.gitlab-ci.yml`.
- Danger files: `dangerfile.ts` (JS), `Dangerfile.df.kts` (Kotlin), `Dangerfile.swift` (Swift).

## Conventions

- This project does **not** use detekt locally; do not run it unless explicitly requested.
- Small, focused commits. Conventional Commits enforced by commitlint.
- Before committing: run `yarn typescript` and `yarn lint`.
- Prettier config (in `package.json`): single quotes, 2-space tabs, trailing comma `es5`, `printWidth: 120`, `quoteProps: consistent`.
- When adding a new native method: add to `src/specs/NativePrimer.ts` (Spec), implement in `RCTNativePrimer.mm` / `RNTPrimer.swift` (iOS) and `DefaultNativePrimerModule.kt` + both `NativePrimerModule.kt` arch variants (Android), expose through `RNPrimer.ts`, then surface on `Primer.ts` / the appropriate manager.
- When adding a new event: extend the `EventType` union in `src/RNPrimer.ts`, emit from both native sides with the identical string, and register the listener in `Primer.ts` or the relevant headless manager.
