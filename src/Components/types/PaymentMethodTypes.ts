import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../models/PrimerPaymentMethodResource';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';

// Mirrors the Android SDK's `Surcharge` sealed interface.
// - `flat`: single amount on non-card methods (PAYPAL, APPLE_PAY, …)
// - `perNetwork`: PAYMENT_CARD surcharge keyed by card network (VISA, MASTERCARD, …)
export type PaymentMethodSurcharge =
  | { kind: 'flat'; amount: number }
  | { kind: 'perNetwork'; amounts: Record<string, number> };

export interface PaymentMethodItem {
  type: string;
  name: string;
  logo?: string;
  backgroundColor?: string;
  nativeViewName?: string;
  categories: string[];
  intents: string[];
  surcharge?: PaymentMethodSurcharge;
  resource?: PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;
  paymentMethod: IPrimerHeadlessUniversalCheckoutPaymentMethod;
}

export interface UsePaymentMethodsOptions {
  include?: string[];
  exclude?: string[];
  onLoad?: (methods: PaymentMethodItem[]) => void;
}

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethodItem[];
  isLoading: boolean;
  error: Error | null;
  resourcesError: Error | null;
  selectedMethod: PaymentMethodItem | null;
  selectMethod: (method: PaymentMethodItem | null) => void;
  clearSelection: () => void;
}
