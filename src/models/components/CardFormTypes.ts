import type { PrimerBinData } from '../PrimerBinData';
import type { PrimerInputElementType } from '../PrimerInputElementType';

export type CardFormField = 'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName';

export type CardFormErrors = Partial<Record<CardFormField, string>>;

export interface UseCardFormOptions {
  /** Whether to collect cardholder name. Default: false */
  collectCardholderName?: boolean;
  /** Called when validation state changes */
  onValidationChange?: (isValid: boolean, errors: CardFormErrors) => void;
  /** Called when card metadata changes (e.g., network detection) */
  onMetadataChange?: (metadata: any) => void;
  /** Called when BIN data changes */
  onBinDataChange?: (binData: PrimerBinData) => void;
}

export interface UseCardFormReturn {
  /** Formatted card number (with spaces) */
  cardNumber: string;
  /** Formatted expiry (MM/YY) */
  expiryDate: string;
  /** CVV digits */
  cvv: string;
  /** Cardholder name */
  cardholderName: string;

  /** Update card number (auto-formats with spaces) */
  updateCardNumber: (value: string) => void;
  /** Update expiry date (auto-formats MM/YY) */
  updateExpiryDate: (value: string) => void;
  /** Update CVV */
  updateCVV: (value: string) => void;
  /** Update cardholder name */
  updateCardholderName: (value: string) => void;

  /** Overall form validity from native SDK */
  isValid: boolean;
  /** Per-field errors (only for touched fields) */
  errors: CardFormErrors;
  /** Mark a field as touched (show errors after blur) */
  markFieldTouched: (field: CardFormField) => void;

  /** Trigger tokenization. No-op if invalid or already submitting. */
  submit: () => Promise<void>;
  /** Whether submission is in progress */
  isSubmitting: boolean;

  /** Required fields from merchant configuration */
  requiredFields: PrimerInputElementType[];

  /** Card network detection data */
  binData: PrimerBinData | null;

  /** Clear all fields and state */
  reset: () => void;
}
