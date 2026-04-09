import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../PrimerPaymentMethodResource';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../PrimerHeadlessUniversalCheckoutPaymentMethod';

export interface PaymentMethodItem {
  type: string;
  name: string;
  logo?: string;
  backgroundColor?: string;
  isNativeView: boolean;
  nativeViewName?: string;
  categories: string[];
  intents: string[];
  surcharge?: number;
  resource: PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;
  paymentMethod: IPrimerHeadlessUniversalCheckoutPaymentMethod;
}

export interface UsePaymentMethodsOptions {
  include?: string[];
  exclude?: string[];
  showCardFirst?: boolean;
  onLoad?: (methods: PaymentMethodItem[]) => void;
}

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethodItem[];
  isLoading: boolean;
  error: Error | null;
  selectedMethod: PaymentMethodItem | null;
  selectMethod: (method: PaymentMethodItem | null) => void;
  clearSelection: () => void;
}
