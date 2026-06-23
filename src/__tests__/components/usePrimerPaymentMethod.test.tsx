// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../specs/NativePrimer', () => ({
  __esModule: true,
  default: {},
}));

jest.mock(
  'react-native',
  () => {
    const mockAddListener = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));
    return {
      Platform: { OS: 'android', select: (o: any) => o.android ?? o.default },
      NativeModules: {
        PrimerHeadlessUniversalCheckout: {
          startWithClientToken: jest.fn(),
          cleanUp: jest.fn(),
          setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
        },
        RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager: {
          configure: jest.fn().mockResolvedValue(undefined),
          showPaymentMethod: jest.fn().mockResolvedValue(undefined),
        },
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => ({
        addListener: mockAddListener,
        removeAllListeners: jest.fn(),
      })),
      __mockAddListener: mockAddListener,
    };
  },
  { virtual: true }
);

import { Component, createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCheckoutProvider } from '../../Components/PrimerCheckoutProvider';
import { usePrimerPaymentMethod } from '../../Components/hooks/usePrimerPaymentMethod';
import type {
  NativeUiPaymentMethod,
  UsePrimerPaymentMethodReturn,
} from '../../Components/types/PrimerPaymentMethodTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const nativeUiManager = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;
const mockAddListener: jest.Mock = rnMock.__mockAddListener;

function findListener(eventName: string): ((...args: any[]) => void) | undefined {
  const call = mockAddListener.mock.calls.find((c: any[]) => c[0] === eventName);
  return call?.[1];
}

/** Asserts the captured controller is the `nativeUi` variant and returns it typed. */
function asNativeUi(c: UsePrimerPaymentMethodReturn): NativeUiPaymentMethod {
  if (c.kind !== 'nativeUi') {
    throw new Error(`expected kind 'nativeUi', got '${c.kind}'`);
  }
  return c;
}

function Consumer({ type, onController }: { type: string; onController: (c: UsePrimerPaymentMethodReturn) => void }) {
  onController(usePrimerPaymentMethod(type));
  return null;
}

class ErrorBoundary extends Component<{ onError: (e: Error) => void; children?: any }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

function resolveMethods(methods: Array<{ paymentMethodType: string; categories?: string[] }>) {
  nativeModule.startWithClientToken.mockResolvedValue({
    availablePaymentMethods: methods.map((m) => ({
      paymentMethodType: m.paymentMethodType,
      paymentMethodManagerCategories: m.categories ?? ['NATIVE_UI'],
      supportedPrimerSessionIntents: ['CHECKOUT'],
    })),
  });
}

async function mountWithMethods(
  methods: Array<{ paymentMethodType: string; categories?: string[] }>,
  type = 'GOOGLE_PAY'
) {
  resolveMethods(methods);
  const captures: UsePrimerPaymentMethodReturn[] = [];
  await act(async () => {
    renderer.create(
      createElement(
        PrimerCheckoutProvider,
        { clientToken: 'token-1' },
        createElement(Consumer, { type, onController: (c: UsePrimerPaymentMethodReturn) => captures.push(c) })
      )
    );
    await flushPromises();
  });
  return captures;
}

describe('usePrimerPaymentMethod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rnMock.Platform.OS = 'android';
    nativeModule.cleanUp.mockResolvedValue(undefined);
    nativeModule.setImplementedRNCallbacks.mockResolvedValue(undefined);
  });

  it('throws when used outside <PrimerCheckoutProvider> (FR-019)', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let caught: Error | undefined;
    await act(async () => {
      renderer.create(
        createElement(
          ErrorBoundary,
          { onError: (e: Error) => (caught = e) },
          createElement(Consumer, { type: 'GOOGLE_PAY', onController: () => {} })
        )
      );
    });
    spy.mockRestore();
    expect(caught?.message).toMatch(/PrimerCheckoutProvider/);
  });

  describe('kind routing', () => {
    it('routes a NATIVE_UI method (Google Pay) to kind "nativeUi"', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      expect(captures[captures.length - 1]!.kind).toBe('nativeUi');
    });

    it('routes PAYMENT_CARD to kind "card"', async () => {
      const captures = await mountWithMethods(
        [{ paymentMethodType: 'PAYMENT_CARD', categories: ['RAW_DATA'] }],
        'PAYMENT_CARD'
      );
      const last = captures[captures.length - 1]!;
      expect(last.kind).toBe('card');
      expect(last.isAvailable).toBe(true);
    });

    it('routes a type not in the session to kind "unsupported"', async () => {
      const captures = await mountWithMethods(
        [{ paymentMethodType: 'PAYMENT_CARD', categories: ['RAW_DATA'] }],
        'NOPE'
      );
      const last = captures[captures.length - 1]!;
      expect(last.kind).toBe('unsupported');
      expect(last.isAvailable).toBe(false);
    });
  });

  describe('Google Pay (nativeUi) on Android', () => {
    it('isAvailable is true when GOOGLE_PAY is among available methods (H2)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(true);
      expect(last.availabilityError).toBeNull();
    });

    it('start configures and shows GOOGLE_PAY when available (H4)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await ctrl.start();
      });
      expect(nativeUiManager.configure).toHaveBeenCalledWith('GOOGLE_PAY');
      expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
    });

    it('ignores a re-entrant start while a flow is already in flight', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await ctrl.start();
      });
      await act(async () => {
        await ctrl.start(); // in flight → no-op, must not start a second native flow
      });
      expect(nativeUiManager.configure).toHaveBeenCalledTimes(1);
      expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledTimes(1);
    });

    it('routes a successful checkout into paymentOutcome (H5, FR-007)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const checkoutData = { payment: { id: 'pay_123', status: 'SUCCESS' } };
      await act(async () => {
        findListener('onCheckoutComplete')!(checkoutData);
      });
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.paymentOutcome).toEqual({ status: 'success', data: checkoutData });
      expect(last.isLoading).toBe(false);
    });

    it('routes a cancel (payment-cancelled) to an error outcome with that errorId (H7, FR-008)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      await act(async () => {
        findListener('onError')!({
          error: { errorId: 'payment-cancelled', errorCode: null, description: 'Cancelled by user' },
          checkoutData: null,
        });
      });
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.paymentOutcome?.status === 'error' && last.paymentOutcome.error.errorId).toBe('payment-cancelled');
      expect(last.isLoading).toBe(false);
    });

    it('routes a payment failure into an error outcome (H6, FR-009)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      await act(async () => {
        findListener('onError')!({
          error: { errorId: 'declined', errorCode: 'E01', description: 'Card declined' },
          checkoutData: null,
        });
      });
      expect(asNativeUi(captures[captures.length - 1]!).paymentOutcome?.status).toBe('error');
    });
  });

  describe('Google Pay (nativeUi) on iOS', () => {
    // The iOS SDK can list GOOGLE_PAY, so the method routes to `nativeUi`, but the RN layer's
    // own Android-only guard reports it unavailable (FR-010) regardless of SDK behaviour.
    it('reports unavailable with PLATFORM_NOT_SUPPORTED even when the SDK lists it', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(false);
      expect(last.availabilityError?.code).toBe('PLATFORM_NOT_SUPPORTED');
    });

    it('start rejects and makes no native call on iOS (FR-010, H3)', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await expect(ctrl.start()).rejects.toBeTruthy();
      expect(nativeUiManager.showPaymentMethod).not.toHaveBeenCalled();
    });
  });
});
