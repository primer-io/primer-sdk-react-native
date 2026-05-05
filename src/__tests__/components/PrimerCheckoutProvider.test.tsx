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
      NativeModules: {
        PrimerHeadlessUniversalCheckout: {
          startWithClientToken: jest.fn(),
          cleanUp: jest.fn(),
          setImplementedRNCallbacks: jest.fn().mockResolvedValue(undefined),
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

function findListener(eventName: string): ((...args: any[]) => void) | undefined {
  const call = mockAddListener.mock.calls.find((c: any[]) => c[0] === eventName);
  return call?.[1];
}

function TestConsumer({ onContext }: { onContext: (ctx: PrimerCheckoutContextValue) => void }) {
  const ctx = usePrimerCheckout();
  onContext(ctx);
  return null;
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('PrimerCheckoutProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nativeModule.startWithClientToken.mockResolvedValue({
      availablePaymentMethods: [
        {
          paymentMethodType: 'PAYMENT_CARD',
          paymentMethodManagerCategories: ['RAW_DATA'],
          supportedPrimerSessionIntents: ['CHECKOUT'],
        },
      ],
    });
    nativeModule.cleanUp.mockResolvedValue(undefined);
    nativeModule.setImplementedRNCallbacks.mockResolvedValue(undefined);
  });

  it('provides isReady=false initially then true after init', async () => {
    const captures: PrimerCheckoutContextValue[] = [];

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captures.push(ctx);
            },
          })
        )
      );
      await flushPromises();
    });

    expect(captures[0]!.isReady).toBe(false);
    expect(captures[0]!.error).toBeNull();
    expect(captures[0]!.availablePaymentMethods).toEqual([]);

    const last = captures[captures.length - 1]!;
    expect(last.isReady).toBe(true);
    expect(last.availablePaymentMethods).toHaveLength(1);
    expect(last.availablePaymentMethods[0]!.paymentMethodType).toBe('PAYMENT_CARD');
  });

  it('sets error on init failure', async () => {
    nativeModule.startWithClientToken.mockRejectedValue(new Error('init failed'));

    let captured: PrimerCheckoutContextValue | undefined;

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    expect(captured!.isReady).toBe(false);
    expect(captured!.error).toBeTruthy();
  });

  it('calls cleanUp on unmount', async () => {
    let root: renderer.ReactTestRenderer;

    await act(async () => {
      root = renderer.create(createElement(PrimerCheckoutProvider, { clientToken: 'token-1' }, null));
      await flushPromises();
    });

    await act(async () => {
      root!.unmount();
    });

    expect(nativeModule.cleanUp).toHaveBeenCalled();
  });

  it('re-initializes when clientToken changes', async () => {
    let captured: PrimerCheckoutContextValue | undefined;
    let root: renderer.ReactTestRenderer;

    await act(async () => {
      root = renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    expect(nativeModule.startWithClientToken).toHaveBeenCalledTimes(1);
    expect(captured!.isReady).toBe(true);

    await act(async () => {
      root!.update(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-2' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    expect(nativeModule.startWithClientToken).toHaveBeenCalledTimes(2);
    expect(nativeModule.cleanUp).toHaveBeenCalled();
  });

  it('does not re-initialize when only callbacks change', async () => {
    let root: renderer.ReactTestRenderer;

    await act(async () => {
      root = renderer.create(
        createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onCheckoutComplete: () => {} }, null)
      );
      await flushPromises();
    });

    expect(nativeModule.startWithClientToken).toHaveBeenCalledTimes(1);

    await act(async () => {
      root!.update(
        createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onCheckoutComplete: () => {} }, null)
      );
      await flushPromises();
    });

    expect(nativeModule.startWithClientToken).toHaveBeenCalledTimes(1);
  });

  it('clears isLoadingResources when no payment methods are configured', async () => {
    // startWithClientToken resolves with an empty list — nothing to fetch.
    nativeModule.startWithClientToken.mockResolvedValue({ availablePaymentMethods: [] });

    let captured: PrimerCheckoutContextValue | undefined;

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    // Should settle — not hang on isLoadingResources: true forever.
    expect(captured!.isReady).toBe(true);
    expect(captured!.availablePaymentMethods).toEqual([]);
    expect(captured!.isLoadingResources).toBe(false);
    expect(captured!.paymentMethodResources).toEqual([]);
  });

  it('sets isLoadingResources: true atomically when onAvailablePaymentMethodsLoad fires post-ready', async () => {
    const captures: PrimerCheckoutContextValue[] = [];

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captures.push(ctx);
            },
          })
        )
      );
      await flushPromises();
    });

    // Simulate native firing onAvailablePaymentMethodsLoad with a new list (e.g. after a
    // client-session update). Assert no frame has the combination of new methods +
    // previous resources + isLoadingResources: false (which would render stale data).
    const listener = findListener('onAvailablePaymentMethodsLoad');
    expect(listener).toBeDefined();

    captures.length = 0;
    await act(async () => {
      listener!({
        availablePaymentMethods: [
          {
            paymentMethodType: 'KLARNA',
            paymentMethodManagerCategories: ['NATIVE_UI'],
            supportedPrimerSessionIntents: ['CHECKOUT'],
          },
          {
            paymentMethodType: 'PAYPAL',
            paymentMethodManagerCategories: ['NATIVE_UI'],
            supportedPrimerSessionIntents: ['CHECKOUT'],
          },
        ],
      });
    });

    // Every captured frame where the new method list is present should have
    // isLoadingResources: true — no stale-data window.
    const framesWithNewList = captures.filter((c) =>
      c.availablePaymentMethods.some((m) => m.paymentMethodType === 'KLARNA')
    );
    expect(framesWithNewList.length).toBeGreaterThan(0);
    for (const frame of framesWithNewList) {
      if (frame.isLoadingResources) continue; // fetch in flight — fine
      // If loading is false, the resources must correspond to the new list
      // (no stale state from before the list changed).
      expect(frame.paymentMethodResources.length).toBeLessThanOrEqual(frame.availablePaymentMethods.length);
    }
    // And the first frame after the list change must be in the loading state.
    expect(framesWithNewList[0]!.isLoadingResources).toBe(true);
  });
});

describe('PrimerCheckoutProvider native event callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nativeModule.startWithClientToken.mockResolvedValue({
      availablePaymentMethods: [
        {
          paymentMethodType: 'PAYMENT_CARD',
          paymentMethodManagerCategories: ['RAW_DATA'],
          supportedPrimerSessionIntents: ['CHECKOUT'],
        },
      ],
    });
    nativeModule.cleanUp.mockResolvedValue(undefined);
    nativeModule.setImplementedRNCallbacks.mockResolvedValue(undefined);
  });

  it('forwards onCheckoutComplete to merchant callback', async () => {
    const onCheckoutComplete = jest.fn();

    await act(async () => {
      renderer.create(createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onCheckoutComplete }, null));
      await flushPromises();
    });

    const listener = findListener('onCheckoutComplete');
    expect(listener).toBeDefined();

    const checkoutData = { payment: { id: 'pay_123' } };
    await act(async () => {
      listener!(checkoutData);
    });

    expect(onCheckoutComplete).toHaveBeenCalledWith(checkoutData);
  });

  it('forwards onError to merchant callback and sets error in context', async () => {
    const onError = jest.fn();
    let captured: PrimerCheckoutContextValue | undefined;

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1', onError },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    expect(captured!.error).toBeNull();

    const listener = findListener('onError');
    expect(listener).toBeDefined();

    const errorData = {
      error: {
        errorId: 'err-1',
        errorCode: 'E001',
        description: 'Something went wrong',
        recoverySuggestion: 'Try again',
        diagnosticsId: 'diag-1',
      },
      checkoutData: null,
    };

    await act(async () => {
      listener!(errorData);
    });

    expect(onError).toHaveBeenCalled();
    // Post-init errors land in paymentOutcome; `error` is reserved for init failures.
    expect(captured!.paymentOutcome).toEqual({
      status: 'error',
      error: expect.objectContaining({ errorId: 'err-1' }),
      data: null,
    });
    expect(captured!.error).toBeNull();
  });

  it('updates clientSession in context on onClientSessionUpdate', async () => {
    let captured: PrimerCheckoutContextValue | undefined;

    await act(async () => {
      renderer.create(
        createElement(
          PrimerCheckoutProvider,
          { clientToken: 'token-1' },
          createElement(TestConsumer, {
            onContext: (ctx: PrimerCheckoutContextValue) => {
              captured = ctx;
            },
          })
        )
      );
      await flushPromises();
    });

    expect(captured!.clientSession).toBeNull();

    const listener = findListener('onClientSessionUpdate');
    expect(listener).toBeDefined();

    const session = { customerId: 'cust_123', currencyCode: 'USD', totalAmount: 1000 };

    await act(async () => {
      listener!({ clientSession: session });
    });

    expect(captured!.clientSession).toEqual(session);
  });

  it('forwards onTokenizationSuccess to merchant callback', async () => {
    const onTokenizationSuccess = jest.fn();

    await act(async () => {
      renderer.create(createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onTokenizationSuccess }, null));
      await flushPromises();
    });

    const listener = findListener('onTokenizationSuccess');
    expect(listener).toBeDefined();

    const tokenData = { paymentMethodTokenData: { token: 'tok_123', paymentInstrumentType: 'PAYMENT_CARD' } };

    await act(async () => {
      listener!(tokenData);
    });

    expect(onTokenizationSuccess).toHaveBeenCalled();
  });

  it('forwards onBeforePaymentCreate to merchant callback', async () => {
    const onBeforePaymentCreate = jest.fn();

    await act(async () => {
      renderer.create(createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onBeforePaymentCreate }, null));
      await flushPromises();
    });

    const listener = findListener('onBeforePaymentCreate');
    expect(listener).toBeDefined();

    const paymentMethodData = { paymentMethodType: 'PAYMENT_CARD', paymentMethod: 'PAYMENT_CARD' };

    await act(async () => {
      listener!(paymentMethodData);
    });

    expect(onBeforePaymentCreate).toHaveBeenCalled();
  });

  it('uses latest callback ref without re-initializing', async () => {
    const onCheckoutComplete1 = jest.fn();
    const onCheckoutComplete2 = jest.fn();
    let root: renderer.ReactTestRenderer;

    await act(async () => {
      root = renderer.create(
        createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onCheckoutComplete: onCheckoutComplete1 }, null)
      );
      await flushPromises();
    });

    await act(async () => {
      root!.update(
        createElement(PrimerCheckoutProvider, { clientToken: 'token-1', onCheckoutComplete: onCheckoutComplete2 }, null)
      );
      await flushPromises();
    });

    expect(nativeModule.startWithClientToken).toHaveBeenCalledTimes(1);

    const listener = findListener('onCheckoutComplete');
    const checkoutData = { payment: { id: 'pay_456' } };

    await act(async () => {
      listener!(checkoutData);
    });

    expect(onCheckoutComplete1).not.toHaveBeenCalled();
    expect(onCheckoutComplete2).toHaveBeenCalledWith(checkoutData);
  });
});

describe('usePrimerCheckout', () => {
  it('throws when called outside React render cycle', () => {
    expect(() => usePrimerCheckout()).toThrow();
  });
});
