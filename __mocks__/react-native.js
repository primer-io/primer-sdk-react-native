// Global manual mock for react-native. Jest auto-applies manual mocks placed in a
// __mocks__ dir adjacent to node_modules to EVERY test — no jest.mock() call needed.
//
// Why this exists: this repo doesn't transform node_modules, so the real react-native
// ships as raw ESM. The moment a test loads a real component whose react-native import
// isn't intercepted, Node throws "Cannot use import statement outside a module". Tests
// used to guard against this by hand-mocking react-native in every file, but that leaks
// on CI once the component graph is deep enough. This canonical mock means the real
// react-native is never loaded. Tests that need specific behaviour still override it with
// their own jest.mock('react-native', () => ...).
const React = require('react');

const makeComponent = (name) => {
  const Component = ({ children, ...props }) => React.createElement(name, props, children);
  Component.displayName = name;
  return Component;
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) =>
    Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style,
  compose: (a, b) => [a, b],
  hairlineWidth: 1,
  absoluteFill: {},
  absoluteFillObject: {},
};

const Platform = {
  OS: 'ios',
  Version: 17,
  select: (spec) => (spec ? (spec.ios !== undefined ? spec.ios : spec.default) : undefined),
};

const subscription = { remove: () => {} };

class NativeEventEmitter {
  addListener() {
    return subscription;
  }
  removeAllListeners() {}
  removeSubscription() {}
  emit() {}
}

const Animated = {
  View: makeComponent('Animated.View'),
  Text: makeComponent('Animated.Text'),
  Image: makeComponent('Animated.Image'),
  ScrollView: makeComponent('Animated.ScrollView'),
  Value: class {
    setValue() {}
    interpolate() {
      return this;
    }
  },
  timing: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  spring: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  loop: () => ({ start: () => {}, stop: () => {} }),
  parallel: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  sequence: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  subtract: (a, b) => ({ __sub: [a, b] }),
};

const reactNative = {
  // Components
  ActivityIndicator: makeComponent('ActivityIndicator'),
  FlatList: makeComponent('FlatList'),
  Image: makeComponent('Image'),
  Modal: makeComponent('Modal'),
  Pressable: makeComponent('Pressable'),
  ScrollView: makeComponent('ScrollView'),
  Text: makeComponent('Text'),
  TextInput: makeComponent('TextInput'),
  TouchableOpacity: makeComponent('TouchableOpacity'),
  View: makeComponent('View'),
  // APIs
  Alert: { alert: () => {} },
  Animated,
  BackHandler: { addEventListener: () => subscription, exitApp: () => {} },
  Keyboard: { addListener: () => subscription, removeAllListeners: () => {}, dismiss: () => {} },
  NativeEventEmitter,
  NativeModules: {},
  Platform,
  StyleSheet,
  // Every TurboModule method resolves as an async no-op so a new spec method can never
  // crash tests; suites that assert calls spy on the JS wrappers (e.g. PrimerAnalytics).
  TurboModuleRegistry: {
    get: () => null,
    getEnforcing: () =>
      new Proxy(
        {},
        {
          get: (target, prop) => (prop === 'then' ? undefined : () => Promise.resolve(null)),
        }
      ),
  },
  requireNativeComponent: (name) => makeComponent(name),
  useColorScheme: () => 'light',
  useWindowDimensions: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
};

// Fallback: any react-native export we didn't list explicitly resolves to a host-style
// component stand-in (for capitalised names) so a new RN import can't reintroduce the crash.
module.exports = new Proxy(reactNative, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop === 'string' && /^[A-Z]/.test(prop)) return makeComponent(prop);
    return undefined;
  },
});
