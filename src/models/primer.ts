import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { IPrimerConfig } from './primer-config';
import type { ISinglePrimerPaymentMethodIntent } from './primer-intent';

export interface IPrimer {
  /**
   * launch Primer's Universal Checkout
   * This will enable users to generate a payment instrument token with any configured payment method.
   * The token is returned to the app through `onTokenizeSuccess` listener. Use this token with Primer's
   * Payment API to capture or authorize a payment.
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param config Configuration object for the SDK. Use this to set listeners, theme,
   * and payment method specific settings.
   */
  showUniversalCheckout(token: String, config: IPrimerConfig): void;

  /**
   * launch Primer's Vault Manager.
   * This will enable users to save new payment methods without performing a checkout.
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param config Configuration object for the SDK. Use this to set listeners, theme,
   * and payment method specific settings.
   */
  showVaultManager(token: String, config: IPrimerConfig): void;

  /**
   * launch Primer's Universal Checkout
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param intent Intent object for specifying payment method and toggle vaulting.
   * @param config Configuration for the SDK.
   */
  showSinglePaymentMethod(
    token: String,
    intent: ISinglePrimerPaymentMethodIntent,
    config: IPrimerConfig
  ): void;

  /**
   * fetch saved payment instruments from Primer's vault.
   * @param callback callback with array of saved payment instruments as argument.
   */
  fetchSavedPaymentInstruments(
    token: String,
    callback: (data: [PaymentInstrumentToken]) => void
  ): void;

  /**
   * remove all listeners & callbacks.
   */
  dispose(): void;
}
