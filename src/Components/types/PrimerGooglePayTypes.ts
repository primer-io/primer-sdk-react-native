import type { ViewProps } from 'react-native';
import type { PaymentOutcome } from './PrimerCheckoutProviderTypes';

/**
 * Why Google Pay is unavailable. Coarse on Android: `isReadyToPay` returns only a boolean,
 * so the individual causes (no Play services, no eligible card, config) aren't distinguished.
 */
export interface GooglePayAvailabilityError {
  /** `'PLATFORM_NOT_SUPPORTED'` (iOS) or `'NOT_READY'` (Android). */
  code: string;
  message: string;
}

/** Return value of {@link useGooglePay}. */
export interface GooglePayController {
  /** `false` on iOS and on Android when not ready. */
  readonly isAvailable: boolean;
  /** True from `startPayment()` until a terminal outcome (a cancel counts as an error). */
  readonly isLoading: boolean;
  readonly availabilityError: GooglePayAvailabilityError | null;
  readonly paymentOutcome: PaymentOutcome | null;
  /**
   * Present the native Google Pay sheet. Resolves once the call has taken effect, NOT when the
   * payment finishes — the outcome arrives via `paymentOutcome`. Rejects if `!isAvailable`.
   */
  startPayment(): Promise<void>;
  /** Cancel an in-flight attempt (no-op when idle). Best-effort — can't force-close an open sheet. */
  cancel(): void;
  clearPaymentOutcome(): void;
}

/**
 * Props for `<PrimerGooglePayButton />`. Appearance (theme/type/corner radius) comes from
 * `googlePayOptions.buttonOptions`; per-instance overrides are a future enhancement.
 */
export interface PrimerGooglePayButtonProps extends ViewProps {
  /** Override the default tap behaviour (`startPayment`) — for custom "slot" integrations. */
  onPress?: () => void;
}
