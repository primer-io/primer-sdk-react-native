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
        RNTPrimerHeadlessUniversalCheckoutBanksComponent: {
          configure: jest.fn().mockResolvedValue(undefined),
          start: jest.fn(),
          submit: jest.fn(),
          onBankSelected: jest.fn(),
          onBankFilterChange: jest.fn(),
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
  NativeUiPaymentMethod,
  RawDataFormPaymentMethod,
  UsePrimerPaymentMethodReturn,
} from '../../Components/types/PrimerPaymentMethodTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const nativeUiManager = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;
const banksNative = rnMock.NativeModules.RNTPrimerHeadlessUniversalCheckoutBanksComponent;
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

/** Asserts the captured controller is the `rawDataForm` variant and returns it typed. */
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

    it('start configures and shows APPLE_PAY when available', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods([{ paymentMethodType: 'APPLE_PAY' }], 'APPLE_PAY');
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await ctrl.start();
      });
      expect(nativeUiManager.configure).toHaveBeenCalledWith('APPLE_PAY');
      expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
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
    it('routes a NATIVE_UI PayPal method to kind "nativeUi"', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      expect(captures[captures.length - 1]!.kind).toBe('nativeUi');
    });

    it('isAvailable is true on Android when PAYPAL is listed', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(true);
      expect(last.availabilityError).toBeNull();
    });

    it('isAvailable is also true on iOS when PAYPAL is listed (unlike Google/Apple Pay, no platform gate)', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.isAvailable).toBe(true);
      expect(last.availabilityError).toBeNull();
    });

    it('start configures and shows PAYPAL when available', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'PAYPAL' }], 'PAYPAL');
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await ctrl.start();
      });
      expect(nativeUiManager.configure).toHaveBeenCalledWith('PAYPAL');
      expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
    });
  });

  describe('web-redirect APMs (Twint/Sofort) — both platforms, no gate', () => {
    it('routes a NATIVE_UI web-redirect method (Twint) to kind "nativeUi"', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'ADYEN_TWINT' }], 'ADYEN_TWINT');
      expect(captures[captures.length - 1]!.kind).toBe('nativeUi');
    });

    it('Twint is available on both platforms when listed (no platform gate)', async () => {
      const android = await mountWithMethods([{ paymentMethodType: 'ADYEN_TWINT' }], 'ADYEN_TWINT');
      expect(asNativeUi(android[android.length - 1]!).isAvailable).toBe(true);
      rnMock.Platform.OS = 'ios';
      const ios = await mountWithMethods([{ paymentMethodType: 'ADYEN_TWINT' }], 'ADYEN_TWINT');
      const last = asNativeUi(ios[ios.length - 1]!);
      expect(last.isAvailable).toBe(true);
      expect(last.availabilityError).toBeNull();
    });

    it('start configures and shows the tapped method (Twint)', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'ADYEN_TWINT' }], 'ADYEN_TWINT');
      const ctrl = asNativeUi(captures[captures.length - 1]!);
      await act(async () => {
        await ctrl.start();
      });
      expect(nativeUiManager.configure).toHaveBeenCalledWith('ADYEN_TWINT');
      expect(nativeUiManager.showPaymentMethod).toHaveBeenCalledWith('CHECKOUT');
    });

    it('Sofort rides the same path — routes to nativeUi and is available when listed', async () => {
      const captures = await mountWithMethods([{ paymentMethodType: 'ADYEN_SOFORT' }], 'ADYEN_SOFORT');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.kind).toBe('nativeUi');
      expect(last.isAvailable).toBe(true);
    });
  });

  describe('bank selection (COMPONENT_WITH_REDIRECT) — iDEAL / Dotpay', () => {
    const ideal = [{ paymentMethodType: 'ADYEN_IDEAL', categories: ['COMPONENT_WITH_REDIRECT'] }];

    it('routes a COMPONENT_WITH_REDIRECT method to kind "bankSelection"', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      const last = captures[captures.length - 1]!;
      expect(last.kind).toBe('bankSelection');
      expect(last.isAvailable).toBe(true);
    });

    it('is available on both platforms when listed (no platform gate)', async () => {
      rnMock.Platform.OS = 'ios';
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      expect(asBankSelection(captures[captures.length - 1]!).isAvailable).toBe(true);
    });

    it('start() provides the component, configures the type, and fetches the issuer list', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      expect(banksNative.configure).toHaveBeenCalledWith('ADYEN_IDEAL');
      expect(banksNative.start).toHaveBeenCalled();
    });

    it('populates banks from a banksRetrieved step', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      const banks = [
        { id: 'ing', name: 'ING', iconUrl: '', disabled: false },
        { id: 'rabo', name: 'Rabobank', iconUrl: '', disabled: false },
      ];
      await act(async () => {
        findListener('onStep')!({ stepName: 'banksRetrieved', banks });
      });
      const last = asBankSelection(captures[captures.length - 1]!);
      expect(last.banks).toEqual(banks);
      expect(last.isLoading).toBe(false);
    });

    it('selectBank forwards to native and tracks the selection; submit tokenises', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
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

    it('filter forwards the query to the native bank filter', async () => {
      const captures = await mountWithMethods(ideal, 'ADYEN_IDEAL');
      await act(async () => {
        await asBankSelection(captures[captures.length - 1]!).start();
        await flushPromises();
      });
      await act(async () => {
        asBankSelection(captures[captures.length - 1]!).filter('rabo');
      });
      expect(banksNative.onBankFilterChange).toHaveBeenCalledWith('rabo');
    });
  });

  describe('raw-data form methods (Bancontact/MBWay/BLIK)', () => {
    it('routes a non-card RAW_DATA method (MBWay) to kind "rawDataForm" with the form contract', async () => {
      const captures = await mountWithMethods(
        [{ paymentMethodType: 'ADYEN_MBWAY', categories: ['RAW_DATA'] }],
        'ADYEN_MBWAY'
      );
      const form = asRawDataForm(captures[captures.length - 1]!);
      expect(form.isAvailable).toBe(true);
      expect(form.requiredInputs).toEqual([]); // populated once start() activates the raw-data manager
      expect(form.isValid).toBe(false);
    });

    it('Bancontact also routes to rawDataForm (not the card form)', async () => {
      const captures = await mountWithMethods(
        [{ paymentMethodType: 'ADYEN_BANCONTACT_CARD', categories: ['RAW_DATA'] }],
        'ADYEN_BANCONTACT_CARD'
      );
      expect(captures[captures.length - 1]!.kind).toBe('rawDataForm');
    });
  });

  describe('QR methods (PromptPay) — nativeUi + qrCode/isPending', () => {
    const qr = [{ paymentMethodType: 'OMISE_PROMPTPAY', categories: ['NATIVE_UI'] }];

    it('routes a QR method to kind "nativeUi"; qrCode null + isPending false initially', async () => {
      const captures = await mountWithMethods(qr, 'OMISE_PROMPTPAY');
      const last = asNativeUi(captures[captures.length - 1]!);
      expect(last.kind).toBe('nativeUi');
      expect(last.qrCode).toBeNull();
      expect(last.isPending).toBe(false);
    });

    it('captures the QR artifact from onCheckoutAdditionalInfo', async () => {
      const captures = await mountWithMethods(qr, 'OMISE_PROMPTPAY');
      await act(async () => {
        findListener('onCheckoutAdditionalInfo')!({ qrCodeBase64: 'QR_DATA_BASE64' });
      });
      expect(asNativeUi(captures[captures.length - 1]!).qrCode?.base64).toBe('QR_DATA_BASE64');
    });

    it('sets isPending on onCheckoutPending', async () => {
      const captures = await mountWithMethods(qr, 'OMISE_PROMPTPAY');
      await act(async () => {
        findListener('onCheckoutPending')!({});
      });
      expect(asNativeUi(captures[captures.length - 1]!).isPending).toBe(true);
    });
  });
});
