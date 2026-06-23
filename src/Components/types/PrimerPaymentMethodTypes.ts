import type { PaymentOutcome } from './PrimerCheckoutProviderTypes';

/**
 * Why a payment method is unavailable. Coarse `{ code, message }`; the codes are method-specific
 * (e.g. Google Pay: `NOT_READY` / `PLATFORM_NOT_SUPPORTED`).
 */
export interface PaymentMethodAvailabilityError {
  code: string;
  message: string;
}

/**
 * A native-UI method (Google Pay today; Apple Pay / PayPal / web-redirect APMs later). `start()`
 * presents the native sheet / browser; the outcome arrives via `paymentOutcome`. Render nothing
 * when `!isAvailable`.
 */
export interface NativeUiPaymentMethod {
  kind: 'nativeUi';
  readonly isAvailable: boolean;
  /** True from `start()` until a terminal outcome (a cancel counts as an error). */
  readonly isLoading: boolean;
  readonly paymentOutcome: PaymentOutcome | null;
  readonly availabilityError: PaymentMethodAvailabilityError | null;
  /** Present the native UI. Rejects if `!isAvailable`. Outcome arrives via `paymentOutcome`. */
  start(): Promise<void>;
  /** Cancel an in-flight attempt (best-effort; cannot force-close a system sheet). */
  cancel(): void;
  clearPaymentOutcome(): void;
}

/**
 * The card method. `start()` opens the default card form; the field-level surface (custom layouts,
 * validation, co-badge) lives on `usePrimerCardForm` / `PrimerCardForm`. Use one or the other for a
 * given card on screen — not both.
 */
export interface CardPaymentMethod {
  kind: 'card';
  readonly isAvailable: boolean;
  /** Activate the card form's raw-data manager. Does not navigate — render the form yourself. */
  start(): void;
  clearPaymentOutcome(): void;
}

/**
 * Can't be driven here: either a type not wired into Components yet, OR a known method that isn't
 * in the current session (its category is unknown). Either way it can't be started — render
 * nothing / disabled.
 */
export interface UnsupportedPaymentMethod {
  kind: 'unsupported';
  readonly isAvailable: false;
}

/** Return value of {@link usePrimerPaymentMethod}; narrow on `kind`. */
export type UsePrimerPaymentMethodReturn = NativeUiPaymentMethod | CardPaymentMethod | UnsupportedPaymentMethod;
