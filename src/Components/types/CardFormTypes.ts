import type { PrimerBinData } from '../../models/PrimerBinData';
import type { PrimerInputElementType } from '../../models/PrimerInputElementType';
import type { CardNetworkDescriptor } from '../internal/cardNetwork';

export type CardFormField = 'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName';

export type CardFormErrors = Partial<Record<CardFormField, string>>;

export interface UseCardFormOptions {
  /** Called when validation state changes */
  onValidationChange?: (isValid: boolean, errors: CardFormErrors) => void;
  /** Called when card metadata changes (e.g., network detection) */
  onMetadataChange?: (metadata: any) => void;
  /** Called when BIN data changes */
  onBinDataChange?: (binData: PrimerBinData) => void;
}

export interface UseCardFormReturn {
  /** Formatted card number (with spaces). */
  cardNumber: string;
  /** Formatted expiry as MM/YY. */
  expiryDate: string;
  cvv: string;
  cardholderName: string;

  /** Auto-formats with spaces. */
  updateCardNumber: (value: string) => void;
  /** Auto-formats as MM/YY. */
  updateExpiryDate: (value: string) => void;
  updateCVV: (value: string) => void;
  updateCardholderName: (value: string) => void;

  /** Overall form validity as reported by the native SDK. */
  isValid: boolean;
  /** Per-field errors, surfaced only for touched fields. */
  errors: CardFormErrors;
  /** Marks a field as touched so its error can appear on blur. */
  markFieldTouched: (field: CardFormField) => void;

  /** Trigger tokenization. No-op if invalid or already submitting. */
  submit: () => Promise<void>;
  isSubmitting: boolean;

  /** Fields the active client session requires. */
  requiredFields: PrimerInputElementType[];

  /** BIN / card network data from the native SDK. */
  binData: PrimerBinData | null;

  /**
   * Traits for the detected network (PAN lengths, gap pattern, CVV length/label).
   * Falls back to default traits when the network is unknown or BIN hasn't resolved yet.
   */
  descriptor: CardNetworkDescriptor;

  /**
   * Max length for the card-number TextInput (digits + gaps) derived from the
   * current network. Use this for `maxLength` on custom card-number inputs so
   * users can't type past the longest valid formatted PAN for their card.
   */
  cardNumberMaxLength: number;

  /** Clear all fields and reset local state. */
  reset: () => void;
}
