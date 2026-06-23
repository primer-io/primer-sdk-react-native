import type { UsePrimerPaymentMethodReturn } from '../types/PrimerPaymentMethodTypes';
import type { PrimerPaymentMethodManagerCategoryName } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';

/**
 * How a payment method is driven, decided by **manager category** (mirrors RN Headless), not by
 * payment-method type. `usePrimerPaymentMethod` and the prebuilt method list share this map.
 *
 * - `nativeUi` — a native-sheet / browser-redirect method (Google/Apple Pay, PayPal), started via
 *   `startNativeUI(type)`.
 * - `bankSelection` — a `COMPONENT_WITH_REDIRECT` bank-redirect method (iDEAL; Android Dotpay).
 * - `rawDataForm` — a non-card `RAW_DATA` method that collects a small input (Bancontact/MBWay/BLIK).
 * - `card` — the card form (`PAYMENT_CARD` only).
 * - `unsupported` — not yet wired into Components.
 *
 * Availability (e.g. Google Pay's Android-only rule) is deliberately NOT part of routing — it lives
 * with the consumer. Later PRs extend the kinds (Klarna, QR).
 */
// Single source of truth — derived from the hook's union so the two can't drift as variants land.
export type PaymentMethodKind = UsePrimerPaymentMethodReturn['kind'];

const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';

export function routeMethodSelection(
  type: string,
  categories: readonly PrimerPaymentMethodManagerCategoryName[]
): PaymentMethodKind {
  if (type === PAYMENT_CARD_TYPE) {
    return 'card';
  }
  if (categories.includes('NATIVE_UI')) {
    return 'nativeUi';
  }
  if (categories.includes('COMPONENT_WITH_REDIRECT')) {
    return 'bankSelection';
  }
  if (categories.includes('RAW_DATA')) {
    return 'rawDataForm';
  }
  return 'unsupported';
}
