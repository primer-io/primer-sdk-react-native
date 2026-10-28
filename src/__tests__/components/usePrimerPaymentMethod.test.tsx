// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Pin the locale so error-copy assertions don't depend on the host's device locale.
jest.mock('../../Components/internal/localization/locale-resolver', () => ({
  resolveLocale: () => ({ locale: 'en', source: 'fallback' }),
}));

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
      useColorScheme: () => 'light',
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
        RNTPrimerHeadlessUniversalCheckoutRawDataManager: {
          configure: jest.fn(),
          listRequiredInputElementTypes: jest.fn(),
          setRawData: jest.fn(),
          cleanUp: jest.fn(),
        },
        RNTPrimerHeadlessUniversalCheckoutBanksComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onBankSelected: jest.fn(),
          onBankFilterChange: jest.fn(),
        },
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onSetPaymentOptions: jest.fn(),
          onFinalizePayment: jest.fn(),
          cleanUp: jest.fn().mockResolvedValue(undefined),
        },
        // Provider init effects touch these — mock them so init resolves cleanly instead of
        // throwing async (unhandled rejections otherwise leak across parallel test suites).
        RNTPrimerHeadlessUniversalCheckoutAssetsManager: {
          getPaymentMethodResources: jest.fn().mockResolvedValue({ paymentMethodResources: [] }),
          getPaymentMethodResource: jest.fn().mockResolvedValue({ paymentMethodResource: null }),
          getOrderedAllowedCardNetworks: jest.fn().mockResolvedValue([]),
          getCardNetworkImage: jest.fn().mockResolvedValue({}),
          getCardNetworkTraits: jest.fn().mockResolvedValue({}),
        },
        RNPrimerHeadlessUniversalCheckoutVaultManager: {
          configure: jest.fn().mockResolvedValue(undefined),
          fetchVaultedPaymentMethods: jest.fn().mockResolvedValue({ paymentMethods: [] }),
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

import { Component, createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCheckoutProvider } from '../../Components/PrimerCheckoutProvider';
import { usePrimerPaymentMethod } from '../../Components/hooks/usePrimerPaymentMethod';
import { PrimerError } from '../../models/PrimerError';
import type {
  BankSelectionPaymentMethod,
  KlarnaPaymentMethod,
  NativeUiPaymentMethod,
  RawDataFormPaymentMethod,
  UsePrimerPaymentMethodReturn,
} from '../../Components/types/PrimerPaymentMethodTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const nativeUiManager = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;
const banksNative = rnMock.NativeModules.RNTPrimerHeadlessUniversalCheckoutBanksComponent;
const klarnaNative = rnMock.NativeModules.RNTPrimerHeadlessUniversalCheckoutKlarnaComponent;
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

/** Asserts the captured controller is the `bankSelection` variant and returns it typed. */
function asBankSelection(c: UsePrimerPaymentMethodReturn): BankSelectionPaymentMethod {
  if (c.kind !== 'bankSelection') {
    throw new Error(`expected kind 'bankSelection', got '${c.kind}'`);
  }
  return c;
}

/** Asserts the captured controller is the `klarna` variant and returns it typed. */
function asKlarna(c: UsePrimerPaymentMethodReturn): KlarnaPaymentMethod {
  if (c.kind !== 'klarna') {
    throw new Error(`expected kind 'klarna', got '${c.kind}'`);
  }
  return c;
}

function asRawDataForm(c: UsePrimerPaymentMethodReturn): RawDataFormPaymentMethod {
  if (c.kind !== 'rawDataForm') {
    throw new Error(`expected kind 'rawDataForm', got '${c.kind}'`);
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
    banksNative.configure.mockResolvedValue(undefined);
    klarnaNative.configure.mockResolvedValue(undefined);
    klarnaNative.cleanUp.mockResolvedValue(undefined);
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

    it('a native start() failure sets an error outcome, resets loading, and rejects', async () => {
      nativeUiManager.showPaymentMethod.mockRejectedValueOnce(
        new PrimerError('native-ui-failed', undefined, 'native sheet failed', undefined, undefined)
      );
      const captures = await mountWithMethods([{ paymentMethodType: 'GOOGLE_PAY' }]);
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await expect(ctrl.start()).rejects.toBeTruthy();
        await flushPromises();
      });
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.paymentOutcome?.status).toBe('error');
      expect(last.isLoading).toBe(false);
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

  describe('Apple Pay (nativeUi) on iOS', () => {
    it('isAvailable is true when APPLE_PAY is among available methods', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods([{ paymentMethodType: 'APPLE_PAY' }], 'APPLE_PAY');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(true);
      expect(last.availabilityError).toBeNull();
    });
  });

  describe('Apple Pay (nativeUi) on Android', () => {
    // The Android SDK can list APPLE_PAY, so the method routes to `nativeUi`, but the RN layer's
    // own iOS-only guard reports it unavailable regardless of SDK behaviour.
    it('reports unavailable with PLATFORM_NOT_SUPPORTED even when the SDK lists it', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'APPLE_PAY' }], 'APPLE_PAY');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(false);
      expect(last.availabilityError?.code).toBe('PLATFORM_NOT_SUPPORTED');
    });

    it('start rejects and makes no native call on Android', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'APPLE_PAY' }], 'APPLE_PAY');
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await expect(ctrl.start()).rejects.toBeTruthy();
      expect(nativeUiManager.showPaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe('PayPal (nativeUi) — both platforms, no gate', () => {
    it('isAvailable is true on Android and on iOS when PAYPAL is listed (unlike Google/Apple Pay, no platform gate)', async () => {
      const android = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      const androidLast = asNativeUi(android[android.length - 1]!);
      expect(androidLast.isAvailable).toBe(true);
      expect(androidLast.availabilityError).toBeNull();
      rnMock.Platform.OS = 'ios';
      const ios = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      const iosLast = asNativeUi(ios[ios.length - 1]!);
      expect(iosLast.isAvailable).toBe(true);
      expect(iosLast.availabilityError).toBeNull();
    });
  });

  it.each([
    ['GOOGLE_PAY', 'android'],
    ['APPLE_PAY', 'ios'],
    ['PAYPAL', 'android'],
  ])('start configures and shows %s when available on %s', async (type, os) => {
    rnMock.Platform.OS = os;
    const captures = await mountWithMethods([{ paymentMethodType: type }], type);
    const ctrl = asNativeUi(captures[captures.length - 1]!);
    await act(async () => {
      await ctrl.start();
    });
    expect(nativeUiManager.configure).toHaveBeenCalledWith(type);
    expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
  });

  describe('bank selection (COMPONENT_WITH_REDIRECT) — iDEAL / Dotpay', () => {
    const ideal = [{ paymentMethodType: 'ADYEN_IDEAL', categories: ['COMPONENT_WITH_REDIRECT'] }];

    it('routes a COMPONENT_WITH_REDIRECT method to kind "bankSelection"', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      const last = captures[captures.length - 1]!;
      expect(last.kind).toBe('bankSelection');
      expect(last.isAvailable).toBe(true);
    });

    it('filter and selectBank forward to native, selectBank tracks the selection; submit tokenises', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      await act(async () => {
        asBankSelection(captures[captures.length - 1]!).filter('rabo');
      });
      expect(banksNative.onBankFilterChange).toHaveBeenCalledWith('rabo');
      await act(async () => {
        asBankSelection(captures[captures.length - 1]!).selectBank('ing');
      });
      expect(banksNative.onBankSelected).toHaveBeenCalledWith('ing');
      expect(asBankSelection(captures[captures.length - 1]!).selectedBankId).toBe('ing');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).submit();
      });
      expect(banksNative.submit).toHaveBeenCalled();
    });

    // submit() holds isLoading until a terminal outcome, but the redirect outcome arrives through
    // the SHARED onCheckoutComplete/onError — not the component-level onError — so those handlers
    // must clear isBanksLoading, else isLoading is stuck true and the Pay button never re-enables.
    it('clears isLoading when a successful checkout arrives via the shared onCheckoutComplete', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      await act(async () => {
        asBankSelection(captures[captures.length - 1]!).selectBank('ing');
      });
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).submit();
      });
      expect(asBankSelection(captures[captures.length - 1]!).isLoading).toBe(true);
      const checkoutData = { payment: { id: 'pay_123', status: 'SUCCESS' } };
      await act(async () => {
        findListener('onCheckoutComplete')!(checkoutData);
      });
      const last = asBankSelection(captures[captures.length - 1]!);
      expect(last.paymentOutcome).toEqual({ status: 'success', data: checkoutData });
      expect(last.isLoading).toBe(false);
    });

    it('clears isLoading when a payment failure arrives via the shared onError', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      await act(async () => {
        asBankSelection(captures[captures.length - 1]!).selectBank('ing');
      });
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).submit();
      });
      await act(async () => {
        findListener('onError')!({
          error: { errorId: 'declined', errorCode: 'E01', description: 'Card declined' },
          checkoutData: null,
        });
      });
      const last = asBankSelection(captures[captures.length - 1]!);
      expect(last.paymentOutcome?.status).toBe('error');
      expect(last.isLoading).toBe(false);
    });
  });

  describe('raw-data form methods (Bancontact/MBWay/BLIK)', () => {
    const mbway = [{ paymentMethodType: 'ADYEN_MBWAY', categories: ['RAW_DATA'] }];

    // The one line that carries native's messages to the form. Without it the shopper gets a
    // disabled Pay button and no stated reason, which is the whole bug this contract exists for.
    it('surfaces native validation messages as validationErrors', async () => {
      const captures = await mountWithMethods(mbway, 'ADYEN_MBWAY');
      await act(async () => {
        await asRawDataForm(captures[captures.length - 1]!).start();
        await flushPromises();
      });

      await act(async () => {
        findListener('onValidation')!({
          isValid: false,
          errors: [{ errorId: 'invalid-phone-number', inputElementType: 'PHONE_NUMBER' }],
        });
        await flushPromises();
      });

      expect(asRawDataForm(captures[captures.length - 1]!).validationErrors).toEqual(['Enter a valid phone number']);
    });
  });

  describe('Klarna (KLARNA)', () => {
    const klarna = [{ paymentMethodType: 'KLARNA', categories: ['KLARNA'] }];

    it('auto-finalizes exactly once on paymentSessionAuthorized; a later manual finalize() is a no-op', async () => {
      const captures = await mountWithMethods(klarna, 'KLARNA');
      await act(async () => {
        await asKlarna(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      // SDK authorized but not finalized (Headless autoFinalize=false) → provider finalizes once.
      await act(async () => {
        findListener('onStep')!({ stepName: 'paymentSessionAuthorized', isFinalized: false });
        await flushPromises();
      });
      expect(klarnaNative.onFinalizePayment).toHaveBeenCalledTimes(1);
      // The guard must stop a manual finalize() from double-firing (native errors on double-finalize).
      await act(async () => {
        await asKlarna(captures[captures.length - 1]!).finalize();
      });
      expect(klarnaNative.onFinalizePayment).toHaveBeenCalledTimes(1);
    });

    it('does not finalize when the authorized step is already finalized', async () => {
      const captures = await mountWithMethods(klarna, 'KLARNA');
      await act(async () => {
        await asKlarna(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      await act(async () => {
        findListener('onStep')!({ stepName: 'paymentSessionAuthorized', isFinalized: true });
        await flushPromises();
      });
      expect(klarnaNative.onFinalizePayment).not.toHaveBeenCalled();
    });
  });
});
