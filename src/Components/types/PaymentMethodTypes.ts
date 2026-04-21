import type {
  IPrimerAsset,
  PrimerPaymentMethodAsset,
  PrimerPaymentMethodNativeView,
} from '../../models/PrimerPaymentMethodResource';
import type {
  IPrimerHeadlessUniversalCheckoutPaymentMethod,
  PrimerPaymentMethodManagerCategoryName,
  PrimerSessionIntentName,
} from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';

// Mirrors the Android SDK's `Surcharge` sealed interface.
// - `flat`: single amount on non-card methods (PAYPAL, APPLE_PAY, …)
// - `perNetwork`: PAYMENT_CARD surcharge keyed by card network (VISA, MASTERCARD, …)
export type PaymentMethodSurcharge =
  | { kind: 'flat'; amount: number }
  | { kind: 'perNetwork'; amounts: Record<string, number> };

export interface PaymentMethodItem {
  type: string;
  name: string;
  // Theme-aware URL picked for the current color scheme (colored → dark/light).
  // For all variants, read `resource.paymentMethodLogo` (see `IPrimerAsset`).
  logo?: string;
  backgroundColor?: string;
  nativeViewName?: string;
  categories: PrimerPaymentMethodManagerCategoryName[];
  intents: PrimerSessionIntentName[];
  surcharge?: PaymentMethodSurcharge;
  resource?: PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;
  paymentMethod: IPrimerHeadlessUniversalCheckoutPaymentMethod;
}

// Re-exported so `IPrimerAsset` is reachable for consumers that want all logo variants.
export type { IPrimerAsset };

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
