import { NativeModules } from 'react-native';
import type { IOSUniversalCheckout, IOSInitOptions } from './types';

const { UniversalCheckoutRN: IOSModule } = NativeModules;

export const UniversalCheckout: IOSUniversalCheckout = {
  /**
   * Initialize the iOS SDK
   * @param _options
   */
  initialize(
    options: IOSInitOptions,
    onTokenizeSuccess: (any: any) => void
  ): void {
    IOSModule.initialize(options, onTokenizeSuccess);
  },

  /**
   * Present the direct debit cehckout view
   * @param _options
   */
  loadDirectDebitView(): void {},

  /**
   * Fetch tokenised payment methods and direct debit
   * @param _options
   */
  loadPaymentMethods(completion: (any: any) => {}): void {
    IOSModule.loadPaymentMethods(completion);
  },

  /**
   * Dismiss the checkout view
   * @param _options
   */
  dismissCheckout(): void {
    IOSModule.dismissCheckout();
  },
};
