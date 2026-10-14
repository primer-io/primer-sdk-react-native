import type { StyleProp, ViewStyle } from 'react-native';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';
import type { PrimerVaultedPaymentMethodAdditionalData } from '../../models/PrimerVaultedPaymentMethodAdditionalData';

const CARD_PAYMENT_METHOD_TYPE = 'PAYMENT_CARD';

// New bank rails (SEPA, BACS, ACSS…) join this set — no new union arm needed.
const BANK_INSTRUMENT_TYPES: ReadonlySet<string> = new Set(['AUTOMATED_CLEARING_HOUSE']);

interface VaultBase {
  id: string;
  paymentMethodType: string;
  paymentInstrumentType: string;
  /** Card-network logo OR payment-method glyph. */
  iconUri?: string;
  displayName?: string;
  rawMethod: PrimerVaultedPaymentMethod;
}

export type VaultedPaymentMethodItem =
  | (VaultBase & {
      kind: 'card';
      cardholderName?: string;
      last4?: string;
      expiryMonth?: string;
      expiryYear?: string;
      network?: string;
      brandName?: string;
    })
  | (VaultBase & { kind: 'bank'; bankName?: string; accountLast4?: string })
  | (VaultBase & { kind: 'other'; detail?: string });

export type VaultKind = VaultedPaymentMethodItem['kind'];

// The single place a vaulted method's kind is decided.
export function classifyVault(method: PrimerVaultedPaymentMethod): VaultKind {
  if (method.paymentMethodType === CARD_PAYMENT_METHOD_TYPE) return 'card';
  if (BANK_INSTRUMENT_TYPES.has(method.paymentInstrumentType)) return 'bank';
  return 'other';
}

/** UI mode for the vault block on the method-selection surface. */
export type VaultDisplayMode = 'expanded' | 'lite';

export interface UsePrimerVaultManagerReturn {
  vaultedMethods: VaultedPaymentMethodItem[];
  /** The method that should be displayed when only one row is rendered. `null` when none exist. */
  primaryMethod: VaultedPaymentMethodItem | null;
  /** First method on the session — the "default" — independent of any user override. */
  originalDefault: VaultedPaymentMethodItem | null;
  /** The method the Pay button should charge — user-selected if any, else originalDefault. */
  activeMethod: VaultedPaymentMethodItem | null;
  /** `'lite'` once the shopper has actively switched off the default, unless they revert via Show other ways to pay. */
  vaultDisplayMode: VaultDisplayMode;
  isLoading: boolean;
  error: Error | null;
  /**
   * Whether the merchant's session has CVV-recapture enabled for vaulted cards
   * (`paymentMethods.PAYMENT_CARD.options.captureVaultedCardCvv = true`).
   */
  requiresVaultedCardCvv: boolean;
  /** Whether the inline CVV input row is currently rendered inside the active vault tile. */
  cvvInputVisible: boolean;
  /**
   * Start payment for `activeMethod`. No-op when none is available.
   * If `additionalData` is supplied (e.g. `{ cvv }` for CVV-recapture), it is forwarded to the
   * native vault-payment bridge.
   */
  pay: (additionalData?: PrimerVaultedPaymentMethodAdditionalData) => Promise<void>;
  /** Start payment for a specific vaulted method id, with optional CVV-recapture additional data. */
  payById: (id: string, additionalData?: PrimerVaultedPaymentMethodAdditionalData) => Promise<void>;
  /** Make `id` the active method. No-op when `id` matches the current active method id. */
  selectVaultedMethodId: (id: string) => void;
  /** Override `vaultDisplayMode` to `'expanded'` while preserving `activeMethod`. */
  requestExpandedVaultDisplay: () => void;
  /**
   * Delete a vaulted payment method. On success the local list refreshes and, if the deleted
   * method was active, the first remaining method becomes the new active selection. Rejects
   * with `{ errorId, description }` on bridge failure so callers can show a toast.
   */
  deleteVaultedPaymentMethod: (id: string) => Promise<void>;
}

export interface PrimerVaultedPaymentMethodProps {
  /** Optional override for the row data. Defaults to `usePrimerVaultManager().primaryMethod`. */
  data?: VaultedPaymentMethodItem | null;
  /** Optional override for the Pay handler. Defaults to the hook's `pay`. */
  onPay?: (method: VaultedPaymentMethodItem) => void;
  style?: StyleProp<ViewStyle>;
}
