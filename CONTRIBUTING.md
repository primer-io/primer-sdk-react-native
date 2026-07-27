# Contributing

We want this community to be friendly and respectful to each other. Please keep that in mind in all your interactions with the project.

## Development workflow

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

While developing, you can run the [example app](/example/) to test your changes.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

To edit the Objective-C files, open `example/ios/example_0_70_6.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > primer-io-react-native`. (The `example_0_70_6` name is a leftover from RN 0.70.6; the project is on RN 0.81.1.)

To edit the Kotlin files, open `example/android` in Android Studio. The bridge sources live at `android/src/main/java/com/primerioreactnative/`.

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

A `commit-msg` hook runs `commitlint` against this format, so a non-conforming commit message is
rejected locally. Danger also fails the pull request when the **PR title** does not start with one
of the prefixes above, or with `ci`, `perf`, `build`, `revert`, `style`, or `BREAKING CHANGE`.
Branches starting `release` are exempt from the title check.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

A `pre-commit` hook runs `lint-staged`, which applies `eslint --fix` to staged `*.{ts,tsx}` files.
That only covers what you stage, so still run the commands above before pushing — Danger fails the
pull request on any ESLint finding in `src/`, warnings included. Note Danger lints only `src/`,
while `yarn lint` covers the whole repo, so a violation elsewhere fails locally but not in Danger.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn bootstrap`: run `pod install` in `example/ios` (alias for `yarn example pods`). Run `yarn` first for dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Give the pull request a conventional-commit title and reference the Jira ticket, e.g. `fix: prevent crash on dismiss (ORC-1234)`.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
