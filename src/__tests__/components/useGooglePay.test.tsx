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
import { useGooglePay } from '../../Components/hooks/useGooglePay';
import type { GooglePayController } from '../../Components/types/PrimerGooglePayTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const nativeUiManager = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;
const mockAddListener: jest.Mock = rnMock.__mockAddListener;

function findListener(eventName: string): ((...args: any[]) => void) | undefined {
  const call = mockAddListener.mock.calls.find((c: any[]) => c[0] === eventName);
  return call?.[1];
}

function GooglePayConsumer({ onController }: { onController: (c: GooglePayController) => void }) {
  onController(useGooglePay());
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

function resolveMethods(methods: Array<{ paymentMethodType: string }>) {
  nativeModule.startWithClientToken.mockResolvedValue({
    availablePaymentMethods: methods.map((m) => ({
      ...m,
      paymentMethodManagerCategories: ['NATIVE_UI'],
      supportedPrimerSessionIntents: ['CHECKOUT'],
    })),
  });
}

async function mountWithMethods(methods: Array<{ paymentMethodType: string }>) {
  resolveMethods(methods);
  const captures: GooglePayController[] = [];
  await act(async () => {
    renderer.create(
      createElement(
        PrimerCheckoutProvider,
        { clientToken: 'token-1' },
        createElement(GooglePayConsumer, { onController: (c: GooglePayController) => captures.push(c) })
      )
    );
    await flushPromises();
  });
  return captures;
}

describe('useGooglePay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
          {
            onError: (e: Error) => {
              caught = e;
            },
          },
          createElement(GooglePayConsumer, { onController: () => {} })
        )
      );
    });
    spy.mockRestore();
    expect(caught?.message).toMatch(/PrimerCheckoutProvider/);
  });

  it('isAvailable is true when GOOGLE_PAY is among available methods (H2)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
    const last = captures[captures.length - 1]!;
    expect(last.isAvailable).toBe(true);
    expect(last.availabilityError).toBeNull();
  });

  it('isAvailable is false with a coarse error when GOOGLE_PAY is absent (H2)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'PAYMENT_CARD' }]);
    const last = captures[captures.length - 1]!;
    expect(last.isAvailable).toBe(false);
    expect(last.availabilityError?.code).toBe('NOT_READY');
  });

  it('startPayment rejects and makes no native call when unavailable (H3)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'PAYMENT_CARD' }]);
    const ctrl = captures[captures.length - 1]!;
    await expect(ctrl.startPayment()).rejects.toBeTruthy();
    expect(nativeUiManager.showPaymentMethod).not.toHaveBeenCalled();
  });

  it('startPayment configures and shows GOOGLE_PAY when available (H4)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
    const ctrl = captures[captures.length - 1]!;
    await act(async () => {
      await ctrl.startPayment();
    });
    expect(nativeUiManager.configure).toHaveBeenCalledWith('GOOGLE_PAY');
    expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
  });

  it('ignores a re-entrant startPayment while a flow is already in flight', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
    const ctrl = captures[captures.length - 1]!;
    await act(async () => {
      await ctrl.startPayment();
    });
    await act(async () => {
      await ctrl.startPayment(); // in flight → no-op, must not start a second native flow
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
    const last = captures[captures.length - 1]!;
    expect(last.paymentOutcome).toEqual({ status: 'success', data: checkoutData });
    expect(last.isLoading).toBe(false);
  });

  it('routes a Google Pay cancel (payment-cancelled) to an error outcome with that errorId (H7, FR-008)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
    await act(async () => {
      findListener('onError')!({
        error: { errorId: 'payment-cancelled', errorCode: null, description: 'Cancelled by user' },
        checkoutData: null,
      });
    });
    const outcome = captures[captures.length - 1]!.paymentOutcome;
    // Cancel is delivered as an error outcome; merchants discriminate it via the errorId.
    expect(outcome?.status === 'error' && outcome.error.errorId).toBe('payment-cancelled');
    expect(captures[captures.length - 1]!.isLoading).toBe(false);
  });

  it('routes a payment failure into an error outcome (H6, FR-009)', async () => {
    const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
    await act(async () => {
      findListener('onError')!({
        error: { errorId: 'declined', errorCode: 'E01', description: 'Card declined' },
        checkoutData: null,
      });
    });
    const last = captures[captures.length - 1]!;
    expect(last.paymentOutcome?.status).toBe('error');
  });
});
