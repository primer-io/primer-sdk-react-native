import { NativeModules } from 'react-native';
import {
  InitOptions,
  IUniversalCheckout,
  CheckoutEvent,
  CheckoutEventType,
} from './types';

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
      }),
      (nativeEvent: unknown) =>
        options.onEvent(nativeEventToCheckoutEvent(nativeEvent))
    );
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

function nativeEventToCheckoutEvent(_nativeEvent: unknown): CheckoutEvent {
  /**
   * TODO: map these correctly
   */
  return {
    type: CheckoutEventType.EXIT,
    data: {
      reason: 'Dunno',
    },
  };
}
