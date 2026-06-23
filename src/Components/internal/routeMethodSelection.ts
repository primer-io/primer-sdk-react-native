/**
 * How a payment method is driven, decided by **manager category** (mirrors RN Headless), not by
 * payment-method type. `usePrimerPaymentMethod` and the prebuilt method list share this map.
 *
 * - `nativeUi` — a native-sheet / browser-redirect method (Google Pay today), started via
 *   `startNativeUI(type)`.
 * - `card` — the card form (`PAYMENT_CARD`, and any other `RAW_DATA` method for now).
 * - `unsupported` — not yet wired into Components.
 *
 * Availability (e.g. Google Pay's Android-only rule) is deliberately NOT part of routing — it lives
 * with the consumer. Later PRs extend the kinds (bank selection, Klarna, raw-data forms, QR).
 */
export type PaymentMethodKind = 'nativeUi' | 'card' | 'unsupported';

const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';

export function routeMethodSelection(type: string, categories: readonly string[]): PaymentMethodKind {
  if (type === PAYMENT_CARD_TYPE) {
    return 'card';
  }
  if (categories.includes('NATIVE_UI')) {
    return 'nativeUi';
  }
  if (categories.includes('RAW_DATA')) {
    return 'card';
  }
  return 'unsupported';
}
