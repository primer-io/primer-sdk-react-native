/**
 * Public API contract for usePaymentMethods hook.
 *
 * This file defines the types and signatures that merchant developers
 * interact with. Implementation details are internal.
 */

import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../../src/models/PrimerPaymentMethodResource';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../../src/models/PrimerHeadlessUniversalCheckoutPaymentMethod';

// --- Primary data type ---

export interface PaymentMethodItem {
  /** Payment method type identifier (e.g., "PAYMENT_CARD", "PAYPAL") */
  type: string;
  /** Human-readable display name */
  name: string;
  /** Logo URL (colored preferred, light fallback) */
  logo?: string;
  /** Background color for payment method button */
  backgroundColor?: string;
  /** Whether this method uses a native platform view */
  isNativeView: boolean;
  /** Native view identifier (when isNativeView is true) */
  nativeViewName?: string;
  /** Implementation categories: "NATIVE_UI", "RAW_DATA", "CARD_COMPONENTS" */
  categories: string[];
  /** Supported session intents: "CHECKOUT", "VAULT" */
  intents: string[];
  /** Per-method surcharge amount in minor units (if configured) */
  surcharge?: number;
  /** Full resource object for advanced customization */
  resource: PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;
  /** Full payment method object for technical details */
  paymentMethod: IPrimerHeadlessUniversalCheckoutPaymentMethod;
}

// --- Hook options ---

export interface UsePaymentMethodsOptions {
  /** Whitelist: only show these payment method types */
  include?: string[];
  /** Blacklist: hide these payment method types */
  exclude?: string[];
  /** Sort PAYMENT_CARD to top of list (default: true) */
  showCardFirst?: boolean;
  /** Called when payment methods are resolved */
  onLoad?: (methods: PaymentMethodItem[]) => void;
}

// --- Hook return ---

export interface UsePaymentMethodsReturn {
  /** Filtered and sorted payment methods with display data */
  paymentMethods: PaymentMethodItem[];
  /** True while SDK configuration or resources are loading */
  isLoading: boolean;
  /** Error during payment method resolution, null if none */
  error: Error | null;
  /** Currently selected payment method */
  selectedMethod: PaymentMethodItem | null;
  /** Set the selected payment method */
  selectMethod: (method: PaymentMethodItem | null) => void;
  /** Clear selection (sets selectedMethod to null) */
  clearSelection: () => void;
}

// --- Hook signature ---

export declare function usePaymentMethods(
  options?: UsePaymentMethodsOptions
): UsePaymentMethodsReturn;
