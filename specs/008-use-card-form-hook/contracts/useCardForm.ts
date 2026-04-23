// Public API contract for useCardForm() hook
// This defines the interface merchants will consume

import type { PrimerBinData } from '../../../src/models/PrimerBinData';
import type { PrimerInputElementType } from '../../../src/models/PrimerInputElementType';

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
  // Field values (formatted for display)
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;

  // Field updaters
  updateCardNumber: (value: string) => void;
  updateExpiryDate: (value: string) => void;
  updateCVV: (value: string) => void;
  updateCardholderName: (value: string) => void;

  // Validation
  isValid: boolean;
  errors: CardFormErrors;
  markFieldTouched: (field: CardFormField) => void;

  // Submission
  submit: () => Promise<void>;
  isSubmitting: boolean;

  // Configuration
  requiredFields: PrimerInputElementType[];

  // Card detection
  binData: PrimerBinData | null;

  // Reset
  reset: () => void;
}

export declare function useCardForm(options?: UseCardFormOptions): UseCardFormReturn;
