# TurboModule Codegen Patch for `@primer-io/react-native`

Some versions of `@primer-io/react-native` can trigger a TypeScript codegen error in React Native when TurboModule interfaces define `EventEmitter` properties that reference type aliases. This patch converts those `EventEmitter` properties to **plain callback functions**, ensuring compatibility with stricter TurboModule codegen rules in React Native 0.79+ and preventing build failures.


## The Problem

During build, you might see an error like this:

```
UnsupportedModulePropertyParserError: Module NativePrimer: TypeScript interfaces extending TurboModule must only contain 'FunctionTypeAnnotation's or non nullable 'EventEmitter's. Property 'onEvent' refers to a 'TSTypeReference'.
```

This happens because the React Native codegen parser **does not accept type aliases** inside `EventEmitter` properties on TurboModule interfaces.


## The Solution

If possible, update to a newer version of `@primer-io/react-native` that supports your React Native version.

If updating is not an option, this patch replaces `EventEmitter` properties with **plain callback methods**, which are fully compatible with TurboModule codegen in RN 0.79+ and newer versions.

## How to Apply

### Option 1: Manual patch

```bash
cd node_modules/@primer-io/react-native
patch -p0 < patches/turbomodule-codegen-fix.patch
```

### Option 2: Using patch-package (Recommended)

1. Install `patch-package` as a dev dependency:

```bash
npm install --save-dev patch-package
```

2. Apply the patch manually:

```bash
cd node_modules/@primer-io/react-native
patch -p0 < ../../patches/turbomodule-codegen-fix.patch
```

3. Generate a patch-package patch:

```bash
npx patch-package @primer-io/react-native
```

4. Add a postinstall script to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

This ensures the patch is applied automatically whenever dependencies are installed.
