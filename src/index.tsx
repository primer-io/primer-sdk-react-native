import { Platform } from 'react-native';
import { UniversalCheckout as AndroidImpl } from './UniversalCheckout.android';
import { UniversalCheckout as IOSImpl } from './UniversalCheckout.ios';
import {
  UXMode,
  IUniversalCheckout,
  PaymentCard,
  PaymentMethodType,
  PayPal,
  GooglePay,
  ApplePay,
  GoCardless,
  GoCardlessOptions,
  IOSUniversalCheckout,
} from './types';

const UniversalCheckout: IUniversalCheckout | IOSUniversalCheckout =
  Platform.OS === 'ios' ? IOSImpl : AndroidImpl;

export { UniversalCheckout, UXMode };

export const PaymentMethod = {
  Card(): PaymentCard {
    return { type: PaymentMethodType.PAYMENT_CARD };
  },
  PayPal(): PayPal {
    return { type: PaymentMethodType.PAYPAL };
  },
  GooglePay(): GooglePay {
    return { type: PaymentMethodType.GOOGLE_PAY };
  },
  ApplePay(): ApplePay {
    return { type: PaymentMethodType.APPLE_PAY };
  },
  GoCardless(opts: GoCardlessOptions): GoCardless {
    return { type: PaymentMethodType.GO_CARDLESS, ...opts };
  },
};
