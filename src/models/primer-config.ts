import type {
  OnDismissCallback,
  OnPrimerErrorCallback,
  OnSavedPaymentInstrumentsFetchedCallback,
  OnTokenAddedToVaultCallback,
  OnTokenizeSuccessCallback,
} from './primer-callbacks';
import type { PrimerSettings } from './primer-settings';
import type { PrimerTheme } from './primer-theme';

export type PrimerConfig = IPrimerConfig;
interface IPrimerConfig {
  /**
   * Include data for different payment methods (e.g. amount or business details)
   */
  settings?: PrimerSettings;
  /**
   * Set colors and dimensions for the Primer UI.
   */
  theme?: PrimerTheme;
  /**
   * Use this callback to grab a Primer payment instrument token and complete a payment.
   */
  onTokenizeSuccess?: OnTokenizeSuccessCallback;

  onResumeSuccess?: OnTokenizeSuccessCallback;

  /**
   * Use this callback to perform some action when a payment instrument was saved to Primer.
   */
  onTokenAddedToVault?: OnTokenAddedToVaultCallback;
  /**
   * Use this callback to perform some action when the Primer UI is dismissed.
   */
  onDismiss?: OnDismissCallback;
  /**
   * Use this callback to perform some action when the SDK throws an error.
   */
  onError?: OnPrimerErrorCallback;
  /**
   * Use this to receive saved payment instruments fetch result.
   */
  onSavedPaymentInstrumentsFetched?: OnSavedPaymentInstrumentsFetchedCallback;
}
