import type { ReactNode } from 'react';
import type { KeyboardTypeOptions, StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import type { UseCardFormReturn } from './CardFormTypes';

export interface PrimerTextInputTheme {
  primaryColor?: string;
  textColor?: string;
  labelColor?: string;
  placeholderColor?: string;
  backgroundColor?: string;
  disabledBackgroundColor?: string;
  borderColor?: string;
  disabledBorderColor?: string;
  /** Border color used when the input has an error. Falls back to the semantic `colors.borderError` token. */
  errorColor?: string;
  /** Color for the helper/error text below the input. Falls back to the semantic `colors.textNegative` token. */
  errorTextColor?: string;
  borderWidth?: number;
  focusedBorderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  labelFontSize?: number;
  fontFamily?: string;
  fieldHeight?: number;
}

export type CardInputTheme = PrimerTextInputTheme;

export interface PrimerTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  /**
   * Error message shown below the input. When present, the input border adopts the error color
   * (even over the focused state) and the accessibility tree marks the field invalid. Pass `undefined`
   * to clear the error state.
   */
  error?: string;
  trailingContent?: ReactNode;
  onSelectionChange?: TextInputProps['onSelectionChange'];
  selectionColor?: string;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  theme?: PrimerTextInputTheme;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  /** Style override for the error helper text below the input. */
  errorStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export interface PrimerTextInputRef {
  setCaret: (start: number, end?: number) => void;
  focus: () => void;
  blur: () => void;
}

export interface CardInputBaseProps {
  cardForm: UseCardFormReturn;
  theme?: PrimerTextInputTheme;
  editable?: boolean;
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export type CardNumberInputProps = CardInputBaseProps;

export type ExpiryDateInputProps = CardInputBaseProps;

export type CVVInputProps = CardInputBaseProps;

export type CardholderNameInputProps = CardInputBaseProps;
