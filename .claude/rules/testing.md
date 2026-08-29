---
paths:
  - "src/__tests__/**"
  - "__mocks__/**"
  - "jest.config.js"
---

# Tests

```bash
yarn test        # jest src/__tests__ --coverage
```

`src/__tests__` is a **path argument**, not a config default. A test placed anywhere else is
silently never run — it won't fail, it won't appear, and Sonar will report the source as uncovered.
Keep tests under `src/__tests__/`.

Config is `jest.config.js`: node environment, `example/` and `lib/` ignored, image imports mapped to
`jest.assetMock.js`.

## The global react-native mock

`__mocks__/react-native.js` is a **manual mock Jest applies to every test automatically** — no
`jest.mock()` call anywhere. It exists because `node_modules` isn't transformed, so the real
`react-native` arrives as raw ESM; the moment a test pulls in a component whose `react-native`
import isn't intercepted, Node throws *"Cannot use import statement outside a module"*.

Everything a test sees from `react-native` comes from that file — `Platform.OS`, `useColorScheme()`,
and a `TurboModuleRegistry` proxy whose methods resolve `null`. Two consequences:

- **Don't hand-mock `react-native` per file.** That's what this replaced; it leaks on CI once the
  component graph gets deep.
- **If your test needs different platform or theme behaviour, extend the shared mock** rather than
  overriding locally, or you reintroduce the drift it was written to remove.

## Native tests are separate

The Kotlin and Swift bridge tests are not part of `yarn test`. They run through fastlane and can be
run locally — see `.claude/rules/native-bridge.md`.
