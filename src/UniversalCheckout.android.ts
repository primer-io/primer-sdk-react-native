import { NativeModules } from 'react-native';
import {
  InitOptions,
  IUniversalCheckout,
  CheckoutEvent,
  CheckoutEventType,
  PaymentMethodToken,
} from './types';

interface NativeAndroidSDKEvent {
  type:
    | 'TOKENIZE_SUCCESS'
    | 'TOKENIZE_ERROR'
    | 'TOKEN_ADDED_TO_VAULT'
    | 'TOKEN_REMOVED_FROM_VAULT'
    | 'EXIT'
    | 'API_ERROR';
  data: { [x: string]: string };
}

const { UniversalCheckout: AndroidModule } = NativeModules;

export const UniversalCheckout: IUniversalCheckout = {
  /**
   * Initialize the Android SDK
   * adapt any callbacks to call `options.onEvent` with the appropriate event payload
   * @param _options
   */
  initialize(options: InitOptions): void {
    AndroidModule.initialize(
      JSON.stringify({
        clientToken: options.clientToken,
        uxMode: options.uxMode,
        paymentMethods: options.paymentMethods,
        theme: options.theme || null,
        amount: options.amount || null,
        currency: options.currency || null,
      })
    );
    setEventCallback(options.onEvent);
  },

  /**
   * Show the checkout sheet
   */
  show(): void {
    AndroidModule.show();
  },

  /**
   * Show the success screen
   */
  showSuccess(): void {
    AndroidModule.showSuccess();
  },

  /**
   * Show the loadinng indicator
   * @param _visible
   */
  showProgressIndicator(visible: boolean): void {
    AndroidModule.showProgressIndicator(visible);
  },

  /**
   * Dismiss the sheet
   */
  dismiss(): void {
    AndroidModule.dismiss();
  },

  /**
   * Clean up any resources here
   */
  destroy(): void {
    AndroidModule.destroy();
  },
};

function nativeEventToCheckoutEvent(
  nativeEvent: NativeAndroidSDKEvent
): CheckoutEvent | null {
  switch (nativeEvent.type) {
    case 'EXIT':
      return {
        type: CheckoutEventType.EXIT,
        data: { reason: nativeEvent.data.reason },
      };
    case 'TOKENIZE_SUCCESS':
      return {
        type: CheckoutEventType.TOKENIZE_SUCCESS,
        data: toPaymentToken(nativeEvent.data),
      };
    case 'TOKEN_ADDED_TO_VAULT':
      return {
        type: CheckoutEventType.TOKEN_ADDED_TO_VAULT,
        data: toPaymentToken(nativeEvent.data),
      };
    case 'TOKEN_REMOVED_FROM_VAULT':
      return {
        type: CheckoutEventType.TOKEN_REMOVED_FROM_VAULT,
        data: toPaymentToken(nativeEvent.data),
      };
    case 'TOKENIZE_ERROR':
      return {
        type: CheckoutEventType.TOKENIZE_ERROR,
        data: {
          errorId: nativeEvent.data.errorId,
          diagnosticsId: nativeEvent.data.diagnosticsId,
          message: nativeEvent.data.message,
        },
      };
    default:
      return null;
  }
}

function toPaymentToken(data: { [x: string]: string }): PaymentMethodToken {
  const paymentInstrumentData = JSON.parse(data.paymentInstrumentData);
  return { ...data, paymentInstrumentData } as PaymentMethodToken;
}

/**
 * The event callback has to be continuously replaced in android
 * The native side queues events and will emit them as soon as new callbacks become available
 */
function setEventCallback(onEvent: (e: CheckoutEvent) => void): void {
  AndroidModule.setEventCallback((serialized: string) => {
    let nativeEvent: NativeAndroidSDKEvent | null = null;

    try {
      nativeEvent = JSON.parse(serialized);
    } catch (e) {}

    if (nativeEvent !== null) {
      const event = nativeEventToCheckoutEvent(nativeEvent);

      if (event !== null) {
        onEvent(event);
      }

      setImmediate(() => {
        setEventCallback(onEvent);
      });
    }
  });
}
