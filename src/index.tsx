import { Platform } from 'react-native';
import { UniversalCheckout as AndroidImpl } from './UniversalCheckout.android';
import { UniversalCheckout as IOSImpl } from './UniversalCheckout.ios';
import {
  UXMode,
  IUniversalCheckout,
  PaymentCard,
  PayPal,
  GooglePay,
  ApplePay,
  GoCardless,
  GoCardlessOptions,
} from './types';

const UniversalCheckout: IUniversalCheckout =
  Platform.OS === 'ios' ? IOSImpl : AndroidImpl;

export { UniversalCheckout, UXMode };

export const PaymentMethod = {
  Card(): PaymentCard {
    return { type: 'PAYMENT_CARD' };
  },
  PayPal(): PayPal {
    return { type: 'PAYPAL' };
  },
  GooglePay(): GooglePay {
    return { type: 'GOOGLE_PAY' };
  },
  ApplePay(): ApplePay {
    return { type: 'APPLE_PAY' };
  },
  GoCardless(opts: GoCardlessOptions): GoCardless {
    return { type: 'GOCARDLESS', ...opts };
  },
};
