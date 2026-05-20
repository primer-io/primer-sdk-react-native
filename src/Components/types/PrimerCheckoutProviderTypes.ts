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
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';
import type { PrimerThemeOverride } from '../internal/theme/types';
import type { CardFormErrors } from './CardFormTypes';
import type { CardNetworkId } from '../internal/cardNetwork';

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

/** Session lifecycle, available methods, and resource loading. Read-only state. */
export interface PrimerSessionController {
  isReady: boolean;
  /** Init-time errors only (before `isReady`). Payment-time errors land in `paymentOutcome`. */
  error: PrimerError | null;
  clientSession: PrimerClientSession | null;
  /**
   * Ordered list of card networks the merchant accepts for the session, e.g. `['VISA', 'MASTERCARD']`.
   * `null` until the bridge resolves or when the session has no `paymentMethod`; `[]` when explicitly empty.
   */
  acceptedCardNetworks: string[] | null;
  availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[];
  paymentMethodResources: Array<PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView>;
  isLoadingResources: boolean;
  resourcesError: Error | null;
  /** Settings the merchant passed to the provider. Needed for UI-option toggles. */
  settings: PrimerSettings | undefined;
}

/** Card form state and active-payment actions for the in-flight attempt. */
export interface PrimerCardController {
  /** Outcome of the most recent payment attempt; `null` before any submit. */
  paymentOutcome: PaymentOutcome | null;
  /** The payment method whose raw-data manager is currently active. */
  activeMethod: string | null;
  /** Validation + metadata state from the active raw-data manager. */
  cardFormState: CardFormState;
  /** Register/deregister the active payment method. Pass `null` to tear down. */
  setActiveMethod: (method: string | null) => void;
  /**
   * Shopper-picked card network for co-badged cards. `null` until the shopper makes
   * a choice in the popover. Persists across re-renders / hook callers (lives on the
   * provider, not on individual hook instances).
   */
  selectedCardNetwork: CardNetworkId | null;
  /** Forward raw data to the active native manager. */
  setRawData: (data: PrimerRawData) => Promise<void>;
  /**
   * Forward a billing address to the active native manager. Dispatched as a separate
   * client-session action, independent of raw card data, before submit.
   */
  setBillingAddress: (address: PrimerAddress) => Promise<void>;
  /**
   * Set the shopper-chosen card network on the active card form (co-badged cards).
   * The provider merges the pick into every subsequent `setRawData` payload, so the
   * choice survives keystroke updates.
   */
  selectCardNetwork: (identifier: CardNetworkId) => Promise<void>;
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

/** Vaulted payment methods state and actions. */
export interface PrimerVaultController {
  vaultedMethods: PrimerVaultedPaymentMethod[];
  /** Brand-icon URIs keyed by vaulted-method id, resolved via AssetsManager at fetch time. */
  vaultedIconUrisById: Record<string, string | undefined>;
  isLoadingVaulted: boolean;
  vaultedError: Error | null;
  /** Id of the user-selected vaulted method, or `null` to fall back to the first method. */
  activeVaultedMethodId: string | null;
  /** When set to `'expanded'`, force the method-selection view to show APMs even after the shopper has switched vaulted method. Cleared automatically on subsequent selection changes. */
  vaultDisplayOverride: 'expanded' | null;
  /** Start the payment flow for a vaulted payment method by id. */
  payFromVault: (vaultedPaymentMethodId: string) => Promise<void>;
  /** Make `id` the active vaulted method. No-op if it already matches the current active id. */
  selectVaultedMethodId: (id: string) => void;
  /** Force the method-selection view back to expanded layout while preserving the user's selection. */
  requestExpandedVaultDisplay: () => void;
  /**
   * Delete a vaulted payment method server-side, refresh the local list, and promote the first
   * remaining method into the active slot if the deleted one was active. Matches iOS / Android
   * Checkout Components behaviour. Rejects with `{ errorId, description }` on bridge failure.
   */
  deleteVaultedPaymentMethod: (id: string) => Promise<void>;
}

/**
 * Aggregate context value exposed by `PrimerCheckoutProvider`. Prefer the focused
 * `usePrimerSession` / `usePrimerCard` / `usePrimerVault` hooks for new code; this
 * intersection is the legacy shape returned by `usePrimerCheckout`.
 */
export type PrimerCheckoutContextValue = PrimerSessionController & PrimerCardController & PrimerVaultController;
