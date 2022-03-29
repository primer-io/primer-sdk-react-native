import type { IClientSessionAction } from 'src/Primer';
import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerResumeHandler } from './primer-request';
import type { PrimerSettings } from './primer-settings';
import type { PrimerTheme } from './primer-theme';

export interface IPrimerConfig {
  /**
   * Include data for different payment methods (e.g. amount or business details)
   */
  settings?: PrimerSettings;

  /**
   * Set colors and dimensions for the Primer UI.
   */
  theme?: PrimerTheme;

  onClientTokenCallback?: (resumeHandler: PrimerResumeHandler) => void;

  /**
   * Use this callback to grab a Primer payment instrument and complete a payment.
   */
  onTokenizeSuccess?: (paymentInstrument: PaymentInstrumentToken, resumeHandler: PrimerResumeHandler) => void;

  /**
   * Use this callback to resume a PENDING payment with the token provided.
   */
  onResumeSuccess?: (resumeToken: string, resumeHandler: PrimerResumeHandler | null) => void;

  /**
   * Use this callback to perform some action when a payment instrument was saved to Primer.
   */
  onTokenAddedToVault?: (paymentInstrument: PaymentInstrumentToken) => void;

  /**
   * Use this callback to perform some action when the Primer UI is dismissed.
   */
  onDismiss?: () => void;

  /**
   * Use this callback to perform some action when the SDK throws an error.
   */
  onError?: (err: Error, resumeHandler: PrimerResumeHandler) => void;

  /**
   * Use this callback to perform actions on payment methods, like surcharging.
   */
  onClientSessionActions?: (clientSessionActions: IClientSessionAction[], resumeHandler: PrimerResumeHandler | null) => void;
}
