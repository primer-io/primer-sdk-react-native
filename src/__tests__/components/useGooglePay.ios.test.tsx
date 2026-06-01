// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../specs/NativePrimer', () => ({
  __esModule: true,
  default: {},
}));

// iOS platform mock. Crucially, the available-methods list below INCLUDES GOOGLE_PAY —
// so this proves the RN layer skips Google Pay on iOS by its own guard, not merely
// because the iOS SDK happens to filter it (FR-010 must hold regardless of SDK version).
jest.mock(
  'react-native',
  () => {
    const mockAddListener = jest.fn().mockImplementation(() => ({ remove: jest.fn() }));
    return {
      Platform: { OS: 'ios', select: (o: any) => o.ios ?? o.default },
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

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCheckoutProvider } from '../../Components/PrimerCheckoutProvider';
import { useGooglePay } from '../../Components/hooks/useGooglePay';
import type { GooglePayController } from '../../Components/types/PrimerGooglePayTypes';

const rnMock = require('react-native');
const nativeModule = rnMock.NativeModules.PrimerHeadlessUniversalCheckout;
const nativeUiManager = rnMock.NativeModules.RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager;

function GooglePayConsumer({ onController }: { onController: (c: GooglePayController) => void }) {
  onController(useGooglePay());
  return null;
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function mount() {
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
  return captures[captures.length - 1]!;
}

describe('useGooglePay on iOS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nativeModule.cleanUp.mockResolvedValue(undefined);
    nativeModule.setImplementedRNCallbacks.mockResolvedValue(undefined);
    nativeModule.startWithClientToken.mockResolvedValue({
      availablePaymentMethods: [
        {
          paymentMethodType: 'GOOGLE_PAY',
          paymentMethodManagerCategories: ['NATIVE_UI'],
          supportedPrimerSessionIntents: ['CHECKOUT'],
        },
      ],
    });
  });

  it('reports Google Pay unavailable on iOS even if the SDK lists it (FR-010)', async () => {
    const ctrl = await mount();
    expect(ctrl.isAvailable).toBe(false);
    expect(ctrl.availabilityError?.code).toBe('PLATFORM_NOT_SUPPORTED');
  });

  it('startPayment rejects and makes no native call on iOS (FR-010)', async () => {
    const ctrl = await mount();
    await expect(ctrl.startPayment()).rejects.toBeTruthy();
    expect(nativeUiManager.showPaymentMethod).not.toHaveBeenCalled();
  });
});
