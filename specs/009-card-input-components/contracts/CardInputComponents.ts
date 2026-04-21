/**
 * Card Input Components — Public API Contract
 *
 * These components are Tier 2 of the SDK integration:
 * SDK input components + useCardForm() hook.
 *
 * All components require `cardForm` prop (UseCardFormReturn).
 * No standalone/manual mode.
 */

import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { UseCardFormReturn } from '../../../src/models/components/CardFormTypes';

// ─── Theme ───────────────────────────────────────────────────────

/**
 * Optional visual overrides for card input components.
 * When omitted, values come from PrimerTokens (via useTheme()).
 */
export interface CardInputTheme {
  primaryColor?: string;
  errorColor?: string;
  textColor?: string;
  placeholderColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fieldHeight?: number;
}

// ─── Shared Props ────────────────────────────────────────────────

export interface CardInputBaseProps {
  /** Required — return value of useCardForm() */
  cardForm: UseCardFormReturn;

  /** Optional theme overrides (layers on top of SDK PrimerTokens) */
  theme?: CardInputTheme;

  /** Label text above the input */
  label?: string;
  /** Whether to show the label. Default: true */
  showLabel?: boolean;
  /** Placeholder text */
  placeholder?: string;

  /** Style overrides */
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;

  /** Test ID for automated testing */
  testID?: string;
}

// ─── Component Props ─────────────────────────────────────────────

export interface CardNumberInputProps extends CardInputBaseProps {
  /** Show card network icon (Visa, Mastercard, etc.) based on BIN detection.
   *  Default: true */
  showCardNetworkIcon?: boolean;
}

export interface ExpiryDateInputProps extends CardInputBaseProps {}

export interface CVVInputProps extends CardInputBaseProps {}

export interface CardholderNameInputProps extends CardInputBaseProps {}

// ─── Component Signatures ────────────────────────────────────────

export declare function CardNumberInput(props: CardNumberInputProps): JSX.Element;
export declare function ExpiryDateInput(props: ExpiryDateInputProps): JSX.Element;
export declare function CVVInput(props: CVVInputProps): JSX.Element;
export declare function CardholderNameInput(props: CardholderNameInputProps): JSX.Element;
