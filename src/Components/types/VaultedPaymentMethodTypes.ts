import type { StyleProp, ViewStyle } from 'react-native';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';

/** View-model for a single vaulted payment method, with derived display fields. */
export interface VaultedPaymentMethodItem {
  id: string;
  paymentMethodType: string;
  paymentInstrumentType: string;
  /** Human-readable cardholder name (card vaults only). */
  cardholderName?: string;
  /** Last 4 digits as a string, masked-format ready. Card / bank-account vaults only. */
  last4?: string;
  /** Two-digit zero-padded expiry month. Card vaults only. */
  expiryMonth?: string;
  /** Two-digit expiry year (e.g. "26"). Card vaults only. */
  expiryYear?: string;
  /** Title-cased brand name for display (e.g. "Mastercard"). Card vaults only. */
  brandName?: string;
  /** Local file URI for the brand icon, resolved via AssetsManager. Card vaults only. */
  brandIconUri?: string;
  /** The underlying native method, preserved for consumers that need raw fields. */
  rawMethod: PrimerVaultedPaymentMethod;
}

/** UI mode for the vault block on the method-selection surface. */
export type VaultDisplayMode = 'expanded' | 'lite';

export interface UseVaultedPaymentMethodsReturn {
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
  /** Start payment for `activeMethod`. No-op when none is available. */
  pay: () => Promise<void>;
  /** Start payment for a specific vaulted method id. */
  payById: (id: string) => Promise<void>;
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
  /** Optional override for the row data. Defaults to `useVaultedPaymentMethods().primaryMethod`. */
  data?: VaultedPaymentMethodItem | null;
  /** Optional override for the Pay handler. Defaults to the hook's `pay`. */
  onPay?: (method: VaultedPaymentMethodItem) => void;
  style?: StyleProp<ViewStyle>;
}
