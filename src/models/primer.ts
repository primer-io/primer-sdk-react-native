import type { PaymentMethodToken } from 'lib/typescript/types';
import type { IPrimerConfig } from './primer-config';

export interface IPrimer {
  /**
   * launch the checkout
   * @param token Primer client token in Base64 format generated with a PrimerAPI key.
   * @param config Configuration for the SDK.
   */
  init(token: String, config: IPrimerConfig): void;
  /**
   * fetch saved payment instruments from Primer's vault.
   * @param callback callback with array of saved payment instruments as argument.
   */
  fetchSavedPaymentInstruments(
    callback: (data: [PaymentMethodToken]) => void
  ): void;
  /**
   * remove all listeners & callbacks.
   */
  dispose(): void;
}
