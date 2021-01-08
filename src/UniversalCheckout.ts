import { NativeModules } from 'react-native';
import type {
  CheckoutEventListener,
  PaymentMethod,
  ShowCheckoutOptions,
} from './types';

export const UniversalCheckout = {
  initialize(clientToken: string): void {
    NativeModules.UniversalCheckout.initialize(clientToken);
  },

  loadPaymentMethods(paymentMethods: PaymentMethod[]): void {
    NativeModules.UniversalCheckout.loadPaymentMethods(
      JSON.stringify(paymentMethods)
    );
  },

  showProgressIndicator(visible: boolean): void {
    NativeModules.UniversalCheckout.showProgressIndicator(visible);
  },

  dismiss(): void {
    NativeModules.UniversalCheckout.dismiss();
  },

  showSuccess(): void {
    NativeModules.UniversalCheckout.showSuccess();
  },

  show(
    onEvent: CheckoutEventListener,
    options: ShowCheckoutOptions = {}
  ): void {
    NativeModules.UniversalCheckout.show(JSON.stringify(options), onEvent);
  },

  destroy(): void {
    NativeModules.UniversalCheckout.destroy();
  },
};
