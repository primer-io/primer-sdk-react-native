// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../specs/NativePrimer', () => ({
  __esModule: true,
  default: {
    setupAnalyticsLoggingBridge: jest.fn().mockResolvedValue(undefined),
    trackAnalyticsEvent: jest.fn().mockResolvedValue(undefined),
    sendLog: jest.fn().mockResolvedValue(undefined),
    sendErrorLog: jest.fn().mockResolvedValue(undefined),
  },
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
        RNTPrimerHeadlessUniversalCheckoutRawDataManager: {
          configure: jest.fn().mockResolvedValue(undefined),
          listRequiredInputElementTypes: jest.fn().mockResolvedValue([]),
          setRawData: jest.fn(),
          submit: jest.fn().mockResolvedValue(undefined),
          cleanUp: jest.fn().mockResolvedValue(undefined),
        },
        RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager: {
          configure: jest.fn().mockResolvedValue(undefined),
          showPaymentMethod: jest.fn().mockResolvedValue(undefined),
        },
        RNPrimerHeadlessUniversalCheckoutVaultManager: {
          configure: jest.fn().mockResolvedValue(undefined),
          fetchVaultedPaymentMethods: jest.fn().mockResolvedValue({ paymentMethods: [] }),
          deleteVaultedPaymentMethod: jest.fn(),
          startPaymentFlow: jest.fn().mockResolvedValue(undefined),
          startPaymentFlowWithAdditionalData: jest.fn().mockResolvedValue(undefined),
          requiresVaultedCardCvv: jest.fn().mockResolvedValue(false),
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

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCheckoutProvider } from '../../Components/PrimerCheckoutProvider';
import { usePrimerCheckout } from '../../Components/hooks/usePrimerCheckout';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const mockAddListener: jest.Mock = rnMock.__mockAddListener;

const NativePrimer = require('../../specs/NativePrimer').default;
const setup: jest.Mock = NativePrimer.setupAnalyticsLoggingBridge;
const track: jest.Mock = NativePrimer.trackAnalyticsEvent;
const sendLog: jest.Mock = NativePrimer.sendLog;
const sendErrorLog: jest.Mock = NativePrimer.sendErrorLog;

const trackedNames = () => track.mock.calls.map((c: any[]) => c[0] as string);
const trackedMeta = (name: string): Record<string, string> | undefined => {
  const call = track.mock.calls.find((c: any[]) => c[0] === name);
  return call?.[1] ? JSON.parse(call[1]) : undefined;
};

function findListener(eventName: string): ((...args: any[]) => void) | undefined {
  const call = mockAddListener.mock.calls.find((c: any[]) => c[0] === eventName);
  return call?.[1];
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

const CARD_METHOD = {
  paymentMethodType: 'PAYMENT_CARD',
  paymentMethodManagerCategories: ['RAW_DATA'],
  supportedPrimerSessionIntents: ['CHECKOUT'],
};
const GOOGLE_PAY_METHOD = {
  paymentMethodType: 'GOOGLE_PAY',
  paymentMethodManagerCategories: ['NATIVE_UI'],
  supportedPrimerSessionIntents: ['CHECKOUT'],
};

async function renderProvider(): Promise<{
  root: renderer.ReactTestRenderer;
  ctx: () => PrimerCheckoutContextValue;
}> {
  let latest: PrimerCheckoutContextValue | undefined;
  let root: renderer.ReactTestRenderer;
  function Consumer() {
    latest = usePrimerCheckout();
    return null;
  }
  await act(async () => {
    root = renderer.create(createElement(PrimerCheckoutProvider, { clientToken: 'token-1' }, createElement(Consumer)));
    await flushPromises();
  });
  return { root: root!, ctx: () => latest! };
}

describe('PrimerCheckoutProvider analytics contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nativeModule.startWithClientToken.mockResolvedValue({
      availablePaymentMethods: [CARD_METHOD, GOOGLE_PAY_METHOD],
    });
    nativeModule.cleanUp.mockResolvedValue(undefined);
    nativeModule.setImplementedRNCallbacks.mockResolvedValue(undefined);
  });

  it('sets up the bridge after native init, then emits the init pair, the init log, and CHECKOUT_FLOW_STARTED', async () => {
    await renderProvider();

    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith('token-1');
    expect(trackedNames()).toEqual(['SDK_INIT_START', 'SDK_INIT_END', 'CHECKOUT_FLOW_STARTED']);
    expect(sendLog).toHaveBeenCalledTimes(1);
    const [message, event, initDurationMs] = sendLog.mock.calls[0]!;
    expect(message).toBe('Checkout components initialized');
    expect(event).toBe('checkout-initialized');
    expect(typeof initDurationMs).toBe('number');
  });

  it('sends a checkout-init-failed error log and no events when init fails', async () => {
    nativeModule.startWithClientToken.mockRejectedValue(new Error('init failed'));

    await renderProvider();

    expect(track).not.toHaveBeenCalled();
    expect(sendErrorLog).toHaveBeenCalledWith(
      'Checkout initialization failed',
      'checkout-init-failed',
      'init failed',
      expect.any(String)
    );
  });

  it('emits PAYMENT_METHOD_SELECTION once per method for the card form', async () => {
    const { ctx } = await renderProvider();

    await act(async () => {
      ctx().setActiveMethod('PAYMENT_CARD');
      await flushPromises();
    });
    await act(async () => {
      ctx().setActiveMethod(null);
      ctx().setActiveMethod('PAYMENT_CARD');
      await flushPromises();
    });

    const selections = trackedNames().filter((n) => n === 'PAYMENT_METHOD_SELECTION');
    expect(selections).toHaveLength(1);
    expect(trackedMeta('PAYMENT_METHOD_SELECTION')).toEqual({ paymentMethod: 'PAYMENT_CARD' });
  });

  it('emits PAYMENT_DETAILS_ENTERED once on the first valid card form', async () => {
    const { ctx } = await renderProvider();
    await act(async () => {
      ctx().setActiveMethod('PAYMENT_CARD');
      await flushPromises();
    });

    const onValidation = findListener('onValidation');
    expect(onValidation).toBeDefined();
    await act(async () => {
      onValidation!({ isValid: true, errors: undefined });
      onValidation!({ isValid: true, errors: undefined });
    });

    const fired = trackedNames().filter((n) => n === 'PAYMENT_DETAILS_ENTERED');
    expect(fired).toHaveLength(1);
    expect(trackedMeta('PAYMENT_DETAILS_ENTERED')).toEqual({ paymentMethod: 'PAYMENT_CARD' });
  });

  it('emits SELECTION and PROCESSING_STARTED (no SUBMITTED) for a native-UI handoff', async () => {
    const { ctx } = await renderProvider();

    await act(async () => {
      await ctx().startNativeUI('GOOGLE_PAY');
      await flushPromises();
    });

    expect(trackedNames()).toContain('PAYMENT_METHOD_SELECTION');
    expect(trackedNames()).toContain('PAYMENT_PROCESSING_STARTED');
    expect(trackedNames()).not.toContain('PAYMENT_SUBMITTED');
    expect(trackedMeta('PAYMENT_PROCESSING_STARTED')).toEqual({ paymentMethod: 'GOOGLE_PAY' });
  });

  it('logs unable-to-present and emits FAILURE when a native-UI handoff fails to present', async () => {
    const nativeUi = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;
    nativeUi.configure.mockRejectedValueOnce(new Error('sheet unavailable'));

    const { ctx } = await renderProvider();
    await act(async () => {
      await ctx()
        .startNativeUI('GOOGLE_PAY')
        .catch(() => {});
      await flushPromises();
    });

    const presentLog = sendErrorLog.mock.calls.find((c: any[]) => c[1] === 'unable-to-present-payment-method');
    expect(presentLog).toBeDefined();
    expect(presentLog![0]).toBe('Unable to present payment method');
    expect(presentLog![2]).toContain('GOOGLE_PAY');
    expect(trackedMeta('PAYMENT_FAILURE')).toEqual({ paymentMethod: 'GOOGLE_PAY' });
  });

  it('emits SUBMITTED + PROCESSING on card submit, then SUCCESS with the payment id', async () => {
    const { root, ctx } = await renderProvider();
    await act(async () => {
      ctx().setActiveMethod('PAYMENT_CARD');
      await flushPromises();
    });

    await act(async () => {
      await ctx().submit();
      await flushPromises();
    });
    expect(trackedMeta('PAYMENT_SUBMITTED')).toEqual({ paymentMethod: 'PAYMENT_CARD' });
    expect(trackedMeta('PAYMENT_PROCESSING_STARTED')).toEqual({ paymentMethod: 'PAYMENT_CARD' });

    const onCheckoutComplete = findListener('onCheckoutComplete');
    await act(async () => {
      onCheckoutComplete!({ payment: { id: 'pay_123', status: 'SUCCESS' } });
      await flushPromises();
    });
    expect(trackedMeta('PAYMENT_SUCCESS')).toEqual({
      paymentMethod: 'PAYMENT_CARD',
      paymentId: 'pay_123',
    });

    // A completed payment is not a funnel exit.
    await act(async () => {
      root.unmount();
    });
    expect(trackedNames()).not.toContain('PAYMENT_FLOW_EXITED');
  });

  it('emits FAILURE with an error log, then REATTEMPTED on the next submit', async () => {
    const { ctx } = await renderProvider();
    await act(async () => {
      ctx().setActiveMethod('PAYMENT_CARD');
      await flushPromises();
    });
    await act(async () => {
      await ctx().submit();
      await flushPromises();
    });

    const onCheckoutComplete = findListener('onCheckoutComplete');
    await act(async () => {
      onCheckoutComplete!({ payment: { id: 'pay_9', status: 'FAILED' } });
      await flushPromises();
    });
    expect(trackedMeta('PAYMENT_FAILURE')).toEqual({
      paymentMethod: 'PAYMENT_CARD',
      paymentId: 'pay_9',
    });
    expect(sendErrorLog).toHaveBeenCalledWith('Payment failed', 'failed-payment', expect.any(String), undefined);

    await act(async () => {
      await ctx().submit();
      await flushPromises();
    });
    const names = trackedNames();
    const reattemptIndex = names.indexOf('PAYMENT_REATTEMPTED');
    expect(reattemptIndex).toBeGreaterThan(-1);
    expect(names[reattemptIndex + 1]).toBe('PAYMENT_SUBMITTED');
    expect(names[reattemptIndex + 2]).toBe('PAYMENT_PROCESSING_STARTED');
    expect(trackedMeta('PAYMENT_REATTEMPTED')).toEqual({ paymentMethod: 'PAYMENT_CARD' });
  });

  it('emits PAYMENT_FLOW_EXITED when the session ends without a completed payment', async () => {
    const { root } = await renderProvider();

    await act(async () => {
      root.unmount();
    });

    expect(trackedNames()).toContain('PAYMENT_FLOW_EXITED');
  });
});
