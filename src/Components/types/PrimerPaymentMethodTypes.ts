import type { PaymentOutcome } from './PrimerCheckoutProviderTypes';
import type { IssuingBank } from '../../models/IssuingBank';
import type { PrimerInputElementType } from '../../models/PrimerInputElementType';
import type { PrimerRawData } from '../../models/PrimerRawData';
import type { KlarnaPaymentCategory } from '../../models/klarna/KlarnaPaymentCategory';

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
 * A bank-selection redirect method (`COMPONENT_WITH_REDIRECT` — iDEAL; Android Dotpay). `start()`
 * fetches the issuer list; pick a bank with `selectBank`, then `submit()` launches the bank
 * redirect. The outcome arrives via `paymentOutcome`. Render nothing when `!isAvailable`.
 */
export interface BankSelectionPaymentMethod {
  kind: 'bankSelection';
  readonly isAvailable: boolean;
  /** True while the issuer list loads, and from `submit()` until a terminal outcome. */
  readonly isLoading: boolean;
  readonly paymentOutcome: PaymentOutcome | null;
  /** Issuer list; empty until `start()` resolves, re-emitted on `filter`. */
  readonly banks: IssuingBank[];
  /** The shopper's current selection, or `null`. */
  readonly selectedBankId: string | null;
  /** Fetch the issuer list (emits loading, then the retrieved banks). */
  start(): Promise<void>;
  /** Filter the issuer list by name. */
  filter(text: string): void;
  /** Select an issuer (required before `submit`). */
  selectBank(bankId: string): void;
  /** Tokenise the selection and launch the bank redirect. */
  submit(): Promise<void>;
  clearPaymentOutcome(): void;
}

/**
 * A non-card `RAW_DATA` form method that collects a small, method-specific input before tokenising
 * — Bancontact (card fields), MBWay (phone), BLIK (OTP). `start()` activates the method's raw-data
 * manager; render `requiredInputs`, push entries via `setData`, then `submit()`. The outcome arrives
 * via `paymentOutcome`. Render nothing when `!isAvailable`.
 */
export interface RawDataFormPaymentMethod {
  kind: 'rawDataForm';
  readonly isAvailable: boolean;
  /** The fields this method requires, from the SDK — drives the form (never the card form). */
  readonly requiredInputs: PrimerInputElementType[];
  /** Current validation messages (card-field methods populate these; `isValid` is the reliable gate). */
  readonly validationErrors: string[];
  /** Whether the entered data is valid and ready to submit. */
  readonly isValid: boolean;
  readonly paymentOutcome: PaymentOutcome | null;
  /** Activate this method's raw-data manager (configure + fetch required inputs). */
  start(): Promise<void>;
  /** Forward the method's raw data (`PrimerPhoneNumberData` / `PrimerBancontactCardData` / `PrimerOtpData`). */
  setData(data: PrimerRawData): Promise<void>;
  /** Tokenise and proceed (some methods then redirect; the native SDK owns it). */
  submit(): Promise<void>;
  clearPaymentOutcome(): void;
}

/**
 * A Klarna method (`KLARNA`). `start()` begins the session and emits `paymentCategories`;
 * `selectCategory` loads the embedded view (render the exported `PrimerKlarnaPaymentView` when
 * `isViewLoaded`); `authorize()` authorises and the SDK auto-finalizes when required (call
 * `finalize()` only for custom layouts that manage it). Outcome arrives via `paymentOutcome`.
 */
export interface KlarnaPaymentMethod {
  kind: 'klarna';
  readonly isAvailable: boolean;
  /** Available Klarna payment categories (Pay Now / Pay Later / …); empty until `start()` resolves. */
  readonly paymentCategories: KlarnaPaymentCategory[];
  /** The shopper's currently selected category id, or `null`. */
  readonly selectedCategoryId: string | null;
  /** True once the embedded Klarna view has loaded — render `<PrimerKlarnaPaymentView/>`. */
  readonly isViewLoaded: boolean;
  /** True while the session is starting or an authorize/finalize is in flight. */
  readonly isLoading: boolean;
  readonly paymentOutcome: PaymentOutcome | null;
  /** Start the Klarna session; emits the payment categories. */
  start(): Promise<void>;
  /** Select a payment category by id (loads the embedded view). */
  selectCategory(categoryId: string): void;
  /** Authorize the payment (after a category is selected and the view has loaded). */
  authorize(): Promise<void>;
  /** Manually finalize (the prebuilt flow finalizes automatically when the SDK requires it). */
  finalize(): Promise<void>;
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
export type UsePrimerPaymentMethodReturn =
  | NativeUiPaymentMethod
  | BankSelectionPaymentMethod
  | RawDataFormPaymentMethod
  | KlarnaPaymentMethod
  | CardPaymentMethod
  | UnsupportedPaymentMethod;
