import type {
  OnDismissCallback,
  OnPrimerErrorCallback,
  OnTokenAddedToVaultCallback,
  OnTokenizeSuccessCallback,
} from './primer-callbacks';
import type { PrimerFlow } from './primer-flow';
import type { IPrimerSettings } from './primer-settings';
import type { IPrimerTheme } from './primer-theme';

export interface IPrimerConfig {
  /**
   * Determine whether checkout or vault should be opened.
   */
  flow?: PrimerFlow;
  /**
   * Include data for different payment methods (e.g. amount or business details)
   */
  settings?: IPrimerSettings;
  /**
   * Set colors and dimensions for the Primer UI.
   */
  theme?: IPrimerTheme;
  /**
   * Use this callback to grab a Primer payment instrument token and complete a payment.
   */
  onTokenizeSuccess: OnTokenizeSuccessCallback;
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
  onPrimerError?: OnPrimerErrorCallback;
}
