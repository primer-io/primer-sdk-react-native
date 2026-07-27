---
paths:
  - "src/specs/**"
  - "ios/Sources/**"
  - "android/src/**"
---

# Native bridge

The TypeScript layer forwards to the native Primer SDKs; these are the two sides it talks to.

- **iOS** — `ios/Sources/`, entry `NativePrimer/RCTNativePrimer.mm`
- **Android** — `android/src/main/java/com/primerioreactnative/`, entry `PrimerSdkPackage.kt`.
  `android/src/newarch/` and `android/src/oldarch/` hold the architecture-specific shims

## Codegen — the part that bites

`src/specs/` holds the TurboModule specs (`NativePrimer.ts`, `NativePrimerViewUtils.ts`).
`codegenConfig` in `package.json` emits `NativePrimerSpec` from them.

**Edit the spec, never the generated bindings.** Then regenerate:

- **iOS** picks it up during `pod install` (`yarn bootstrap`)
- **Android** needs `./gradlew generateCodegenArtifactsFromSchema`

Skip the regeneration and you get a stale native interface. It still compiles — the mismatch only
shows up at runtime, as a method that silently does nothing or a bridge error with no obvious
cause. This is the most expensive mistake available in this directory.

## Adding to the bridge

A new method needs all of: the spec in `src/specs/`, the Swift/Obj-C side, the Kotlin side, the
TypeScript wrapper in `src/`, and an export from `src/index.tsx`. Miss the export and the code
ships but is unreachable.

## Native tests

The bridge unit tests (`example/ios/example_0_70_6Tests/`, `android/src/test/`) run in CI only,
through fastlane — `yarn test` does not touch them. If you change bridge code, the first signal you
get is on the PR, not locally.
