---
paths:
  - "example/**"
---

# Example app

The only yarn workspace member, and the vehicle for actually running the SDK. Nothing here ships.

**Nothing checks this directory.** `eslint.config.mjs` ignores `**/example/`, `tsconfig.json`
excludes it, and Danger lints only `src/`. A type error or lint violation here fails no gate — the
first signal is a broken build.

## Pods are never installed for you

`example/react-native.config.js` sets `automaticPodsInstallation: false`, so `yarn example ios`
will **not** run `pod install` — ever. `yarn bootstrap` (→ `pod install --repo-update`) is the only
pod install that happens, and it is slow because of the repo update.

CocoaPods comes from your machine, not from bundler. The `Gemfile` pins away from versions known to
break this project (`!= 1.15.0`, `!= 1.15.1`, plus bounds on `xcodeproj` and `concurrent-ruby`) and
CI installs through bundler. If pods misbehave: `bundle install && cd example/ios && bundle exec
pod install`. `.bundle/config` sets `BUNDLE_PATH: vendor/bundle`.

## The Podfile carries load-bearing hacks

It pins four pods outside the SDK podspec — `Primer3DS`, `PrimerIPay88MYSDK`,
`PrimerKlarnaSDK 1.3.1`, `PrimerStripeSDK 1.0.0` — and its `post_install` weak-links them, injects
`-fmodule-map-file` flags, patches `fmt`, and hardcodes `DEVELOPMENT_TEAM`. Adding a native
dependency without matching those blocks produces link errors a long way from the cause.

`ENV['RCT_NEW_ARCH_ENABLED'] = '1'` is the first line of the Podfile and
`example/android/gradle.properties` sets `newArchEnabled=true`. The app cannot exercise the
old-architecture path as configured.

## `Keys.ts`

`example/src/Keys.ts` is gitignored and written by CI from a secret, so it is absent on a fresh
clone and the app will not build without it:

```ts
export const STRIPE_ACH_PUBLISHABLE_KEY = '…';
```

## Naming and layout oddities

- The Xcode project and scheme are `example_0_70_6` — a leftover from RN 0.70.6. The project is on
  RN 0.81.1.
- Swift tests live in `example/ios/example_0_70_6Tests/`. `example/ios/ReactNativeExampleTests/`
  holds one stale file; ignore it.
- `example/_ruby-version` (2.7.5) and `example/_node-version` (16) are disabled by the underscore
  prefix and are both wrong — the real versions are `.nvmrc` v20.19.0 and Ruby 3.2 in CI.
- `.yarnrc.yml` sets `nmHoistingLimits: workspaces`, so this workspace's dependencies are **not**
  hoisted to the root `node_modules`. `example/metro.config.js` compensates via
  `react-native-monorepo-config`. Relevant if an import resolves here but not in `src/`, or vice
  versa.
