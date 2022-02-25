import type { HeadlessCheckout } from 'src/headless_checkout';
import type { PrimerConfig } from './primer-config';
import type { PrimerPaymentMethodIntent } from './primer-intent';

export interface IPrimer {
  /**
   * Launch Primer's Universal Checkout
   * This will enable users to generate a payment instrument token with any configured payment method.
   * The token is returned to the app through `onTokenizeSuccess` listener. Use this token with Primer's
   * Payment API to capture or authorize a payment.
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param config Configuration object for the SDK. Use this to set listeners, theme,
   * and payment method specific settings.
   */
  showUniversalCheckout(token: String, config: PrimerConfig): void;

  /**
   * Launch Primer's Vault Manager.
   * This will enable users to save new payment methods without performing a checkout.
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param config Configuration object for the SDK. Use this to set listeners, theme,
   * and payment method specific settings.
   */
  showVaultManager(token: String, config: PrimerConfig): void;

  /**
   * Launch checkout with a specific payment method
   * @param token Primer client token in Base64 format generated with a Primer API key.
   * @param intent Intent object for specifying payment method and toggle vaulting.
   * @param config Configuration for the SDK.
   */
  showPaymentMethod(
    token: String,
    intent: PrimerPaymentMethodIntent,
    config: PrimerConfig
  ): void;

  /**
   * remove all listeners & callbacks.
   */
  dispose(): void;

  /**
   * headless checkout object for running Primer SDK with your own UI
   */
  headlessCheckout: HeadlessCheckout;
}
