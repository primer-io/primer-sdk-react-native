import type { UsePrimerPaymentMethodReturn } from '../types/PrimerPaymentMethodTypes';
import type { PrimerPaymentMethodManagerCategoryName } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';

/**
 * How a payment method is driven, decided by **manager category** (mirrors RN Headless), not by
 * payment-method type. `usePrimerPaymentMethod` and the prebuilt method list share this map.
 *
 * - `nativeUi` — a native-sheet / browser-redirect method (Google/Apple Pay, PayPal); the variant's
 *   `start()` presents it.
 * - `bankSelection` — a `COMPONENT_WITH_REDIRECT` bank-redirect method (iDEAL; Android Dotpay).
 * - `rawDataForm` — a non-card `RAW_DATA` method that collects a small input (Bancontact/MBWay/BLIK).
 * - `klarna` — a `KLARNA` method (session → categories → embedded view → authorize → finalize).
 * - `card` — the card form (`PAYMENT_CARD` only).
 * - `unsupported` — not wired into Components, or a known method not in the current session.
 *
 * Availability (e.g. Google Pay's Android-only rule) is deliberately NOT part of routing — it lives
 * with the consumer.
 */
// Single source of truth — derived from the hook's union so the two can't drift as variants land.
export type PaymentMethodKind = UsePrimerPaymentMethodReturn['kind'];

const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';

// RAW_DATA methods with a working form here; others (e.g. XENDIT_RETAIL_OUTLETS, a list picker) stay unsupported.
const RAW_DATA_FORM_TYPES = new Set(['ADYEN_BANCONTACT_CARD', 'ADYEN_MBWAY', 'ADYEN_BLIK']);

export function routeMethodSelection(
  type: string,
  categories: readonly PrimerPaymentMethodManagerCategoryName[]
): PaymentMethodKind {
  // PAYMENT_CARD is routed by type here; its CARD_COMPONENTS category is intentionally not matched below.
  if (type === PAYMENT_CARD_TYPE) {
    return 'card';
  }
  if (categories.includes('NATIVE_UI')) {
    return 'nativeUi';
  }
  if (categories.includes('COMPONENT_WITH_REDIRECT')) {
    return 'bankSelection';
  }
  if (categories.includes('KLARNA')) {
    return 'klarna';
  }
  if (categories.includes('RAW_DATA') && RAW_DATA_FORM_TYPES.has(type)) {
    return 'rawDataForm';
  }
  return 'unsupported';
}
