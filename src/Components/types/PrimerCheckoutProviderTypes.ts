import type { ReactNode } from 'react';
import type { PrimerSettings } from '../../models/PrimerSettings';
import type { PrimerError } from '../../models/PrimerError';
import type { PrimerAddress, PrimerClientSession } from '../../models/PrimerClientSession';
import type { PrimerCheckoutData } from '../../models/PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../../models/PrimerCheckoutPaymentMethodData';
import type { PrimerPaymentMethodTokenData } from '../../models/PrimerPaymentMethodTokenData';
import type { PrimerRawData } from '../../models/PrimerRawData';
import type { PrimerBinData } from '../../models/PrimerBinData';
import type { PrimerInputElementType } from '../../models/PrimerInputElementType';
import type {
  PrimerHeadlessUniversalCheckoutResumeHandler,
  PrimerPaymentCreationHandler,
} from '../../models/PrimerHandlers';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../models/PrimerPaymentMethodResource';
import type { PrimerThemeOverride } from '../internal/theme/types';
import type { CardFormErrors } from './CardFormTypes';

export interface PrimerCheckoutProviderProps {
  clientToken: string;
  settings?: PrimerSettings;
  theme?: PrimerThemeOverride;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizationSuccess?: (
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    handler: PrimerHeadlessUniversalCheckoutResumeHandler
  ) => void;
  onBeforePaymentCreate?: (
    checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData,
    handler: PrimerPaymentCreationHandler
  ) => void;
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null) => void;
  children?: ReactNode;
}

/** Outcome of the most recent payment attempt within a checkout session. */
export type PaymentOutcome =
  | { status: 'success'; data: PrimerCheckoutData }
  | { status: 'error'; error: PrimerError; data: PrimerCheckoutData | null };

/** Validation + metadata state surfaced by the active raw-data manager. */
export interface CardFormState {
  isValid: boolean;
  errors: CardFormErrors;
  binData: PrimerBinData | null;
  metadata: unknown;
  requiredFields: PrimerInputElementType[];
}

export interface PrimerCheckoutContextValue {
  // --- Session state ---
  isReady: boolean;
  /** Init-time errors only (before `isReady`). Payment-time errors land in `paymentOutcome`. */
  error: PrimerError | null;
  clientSession: PrimerClientSession | null;
  availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[];
  paymentMethodResources: Array<PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView>;
  isLoadingResources: boolean;
  resourcesError: Error | null;
  /** Settings the merchant passed to the provider. Needed for UI-option toggles. */
  settings: PrimerSettings | undefined;

  // --- Active payment attempt ---
  /** Outcome of the most recent payment attempt; `null` before any submit. */
  paymentOutcome: PaymentOutcome | null;
  /** The payment method whose raw-data manager is currently active. */
  activeMethod: string | null;
  /** Validation + metadata state from the active raw-data manager. */
  cardFormState: CardFormState;

  // --- Actions ---
  /** Register/deregister the active payment method. Pass `null` to tear down. */
  setActiveMethod: (method: string | null) => void;
  /** Forward raw data to the active native manager. */
  setRawData: (data: PrimerRawData) => Promise<void>;
  /**
   * Forward a billing address to the active native manager. Dispatched as a separate
   * client-session action, independent of raw card data, before submit.
   */
  setBillingAddress: (address: PrimerAddress) => Promise<void>;
  /** Fire the active manager's submit. First-attempt path. */
  submit: () => Promise<void>;
  /**
   * Retry the last submit. Reconfigures the manager, re-sends the last raw data, then submits.
   * The reconfigure is defensive for iOS: `RawDataManager.swift:237` nullifies the delegate on
   * successful tokenization, so any post-tokenize failure would otherwise have no delegate
   * to surface a retry's outcome. Reconfigure rebuilds the delegate binding. Harmless on Android.
   */
  retry: () => Promise<void>;
  /** Clear the last payment outcome (e.g., when leaving the error screen). */
  clearPaymentOutcome: () => void;
}
