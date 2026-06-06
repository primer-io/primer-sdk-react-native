/**
 * Contract test C4 (FR-006 / SC-006): a prefixed card input rendered with no
 * `PrimerCardFormProvider` ancestor throws a descriptive error that names the
 * provider. The guard lives in `usePrimerCardForm()`, which every input calls.
 *
 * `PrimerCardholderNameInput` is used because it pulls in no image assets — its
 * module graph loads under the react-native mock without an asset transform.
 */

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../specs/NativePrimer', () => ({ __esModule: true, default: {} }), { virtual: true });

jest.mock(
  'react-native',
  () => ({
    NativeModules: {},
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeAllListeners: jest.fn(),
    })),
    StyleSheet: { create: (s: unknown) => s, hairlineWidth: 1 },
    Platform: { OS: 'ios', select: (o: { ios: unknown }) => o.ios },
    Image: 'Image',
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    Pressable: 'Pressable',
  }),
  { virtual: true }
);

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCardholderNameInput } from '../../Components/inputs/PrimerCardholderNameInput';

describe('C4: card input outside PrimerCardFormProvider', () => {
  it('throws an error that names PrimerCardFormProvider', () => {
    // Silence React's render-error console noise for the expected throw.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => {
        act(() => {
          create(createElement(PrimerCardholderNameInput));
        });
      }).toThrow(/PrimerCardFormProvider/);
    } finally {
      spy.mockRestore();
    }
  });
});
