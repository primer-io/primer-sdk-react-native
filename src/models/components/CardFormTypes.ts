import type { StyleProp, ViewStyle } from 'react-native';
import type { PrimerError } from '../PrimerError';
import type { PrimerInputElementType } from '../PrimerInputElementType';

/**
 * Options for useCardForm hook
 */
export interface UseCardFormOptions {
  /**
   * Called when validation state changes
   */
  onValidationChange?: (isValid: boolean, errors?: PrimerError[]) => void;

  /**
   * Called when card metadata changes (e.g., card brand detected)
   */
  onMetadataChange?: (metadata: CardMetadata) => void;

  /**
   * Whether to collect cardholder name
   * @default false
   */
  collectCardholderName?: boolean;
}

/**
 * Return value from useCardForm hook
 */
export interface UseCardFormReturn {
  // Field values
  /**
   * Current card number value
   */
  cardNumber: string;

  /**
   * Current expiry date value (MM/YY format)
   */
  expiryDate: string;

  /**
   * Current CVV value
   */
  cvv: string;

  /**
   * Current cardholder name value
   */
  cardholderName: string;

  // Validation state
  /**
   * Whether the current form state is valid
   */
  isValid: boolean;

  /**
   * Validation errors by field
   */
  errors: CardFormErrors;

  // Metadata
  /**
   * Card metadata (e.g., detected card network)
   */
  metadata: CardMetadata | null;

  /**
   * Required input fields from the native SDK
   */
  requiredFields: PrimerInputElementType[];

  // Field updaters
  /**
   * Update card number field
   */
  updateCardNumber: (value: string) => void;

  /**
   * Update expiry date field
   */
  updateExpiryDate: (value: string) => void;

  /**
   * Update CVV field
   */
  updateCVV: (value: string) => void;

  /**
   * Update cardholder name field
   */
  updateCardholderName: (value: string) => void;

  // Actions
  /**
   * Submit the card form
   */
  submit: () => Promise<void>;

  /**
   * Reset form to initial state
   */
  reset: () => void;
}

/**
 * Individual field names in the card form
 */
export type CardFormField = 'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName';

/**
 * Validation errors keyed by field name
 */
export type CardFormErrors = Partial<Record<CardFormField, string>>;

/**
 * Card metadata from the native SDK
 */
export interface CardMetadata {
  /**
   * Detected card network (e.g., 'VISA', 'MASTERCARD')
   */
  cardNetwork?: string;

  /**
   * Whether the detected network is supported
   */
  isNetworkSupported?: boolean;

  /**
   * Additional metadata from native SDK
   */
  [key: string]: any;
}

/**
 * Props for CardForm component
 */
export interface CardFormProps {
  /**
   * Called when validation state changes
   */
  onValidationChange?: (isValid: boolean) => void;

  /**
   * Called when form data changes
   */
  onStateChange?: (state: CardFormState) => void;

  /**
   * Called when validation errors occur
   */
  onValidationError?: (errors: PrimerError[]) => void;

  /**
   * Theme configuration for styling the card form
   */
  theme?: CardFormTheme;

  /**
   * Style for the container view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Whether to show the cardholder name field
   * @default false
   */
  showCardholderName?: boolean;

  /**
   * Whether to show a submit button
   * @default true
   */
  showSubmitButton?: boolean;

  /**
   * Custom text for the submit button
   * @default "Pay"
   */
  submitButtonText?: string;

  /**
   * Called when user attempts to submit the form (only if valid)
   */
  onSubmit?: () => void;
}

/**
 * Current state of the card form
 */
export interface CardFormState {
  /**
   * Current field values
   */
  values: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };

  /**
   * Whether the form is valid
   */
  isValid: boolean;

  /**
   * Current validation errors
   */
  errors: CardFormErrors;

  /**
   * Card metadata
   */
  metadata: CardMetadata | null;
}

/**
 * Theme configuration for CardForm component
 */
export interface CardFormTheme {
  // Colors
  /**
   * Primary color for focus states
   * @default '#0066FF'
   */
  primaryColor?: string;

  /**
   * Color for error states
   * @default '#FF3B30'
   */
  errorColor?: string;

  /**
   * Text color for inputs
   * @default '#000000'
   */
  textColor?: string;

  /**
   * Placeholder text color
   * @default '#999999'
   */
  placeholderColor?: string;

  /**
   * Background color for inputs
   * @default '#FFFFFF'
   */
  backgroundColor?: string;

  // Border
  /**
   * Border color for inputs
   * @default '#E0E0E0'
   */
  borderColor?: string;

  /**
   * Border width
   * @default 1
   */
  borderWidth?: number;

  /**
   * Border radius for inputs
   * @default 8
   */
  borderRadius?: number;

  /**
   * Border color when input is focused
   * @default primaryColor
   */
  focusedBorderColor?: string;

  // Typography
  /**
   * Font size for input text
   * @default 16
   */
  fontSize?: number;

  /**
   * Font family for inputs
   */
  fontFamily?: string;

  // Spacing
  /**
   * Height of input fields
   * @default 48
   */
  fieldHeight?: number;

  /**
   * Spacing between fields
   * @default 16
   */
  fieldSpacing?: number;
}
