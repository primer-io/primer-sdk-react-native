---
paths:
  - "src/specs/**"
  - "ios/Sources/**"
  - "android/src/**"
---

# Native bridge

The TypeScript layer forwards to the native Primer SDKs; these are the two sides it talks to.

- **iOS** — `ios/Sources/`, entry `NativePrimer/RCTNativePrimer.mm`
- **Android** — `android/src/main/java/com/primerioreactnative/`, entry `PrimerSdkPackage.kt`

## Codegen

`src/specs/` holds the TurboModule specs (`NativePrimer.ts`, `NativePrimerViewUtils.ts`).
`codegenConfig` in `package.json` emits `NativePrimerSpec` from them.

**Edit the spec, never the generated bindings.** Regeneration is automatic on both platforms —
iOS during `pod install`, Android via the React Native gradle plugin, which hooks the codegen task
onto `preBuild`. You do not need to invoke it by hand; a normal build picks up spec changes.

## The old-architecture path is not locally testable

`android/src/newarch/` and `android/src/oldarch/` hold architecture-specific shims, selected by the
`sourceSets` switch in `android/build.gradle`. The example app hard-enables the new architecture —
`RCT_NEW_ARCH_ENABLED = '1'` in `example/ios/Podfile`, `newArchEnabled=true` in
`example/android/gradle.properties`.

So if you change anything under `oldarch/`, nothing you can run locally will compile it. The only
coverage is the `rn-compat-build-*` matrix, which scaffolds a fresh app. Expect the first signal on
the PR.

## Adding to the bridge

A new method needs all of: the spec in `src/specs/`, the Swift/Obj-C side, the Kotlin side, and the
TypeScript wrapper in `src/`, exported from `src/index.tsx`.

## Native tests — you can run these locally

They are ordinary fastlane lanes, not CI-only:

```bash
bundle exec fastlane ios tests                      # example/ios/example_0_70_6Tests
bundle exec fastlane android run_unit_tests_coverage # driven from example/android/
```

`yarn test` does not touch either. Note the Android lane runs from `example/android/`, not the
library module. `bundle install` first — `.bundle/config` sets `BUNDLE_PATH: vendor/bundle`.

Ignore `example/ios/ReactNativeExampleTests/`; it holds one stale file. The real Swift tests are in
`example/ios/example_0_70_6Tests/`.

## Lint gates

`Dangerfile.df.kts` fails the PR on **any** detekt finding (`android/tooling/code-analysis/detekt.yml`,
plus detekt-formatting for ktlint rules). `Dangerfile.swift` fails on **any** SwiftLint finding
(`ios/.swiftlint.yml`). Neither has a documented local command, so the PR is usually where you find
out. Both also warn if the PR touches no test file.
