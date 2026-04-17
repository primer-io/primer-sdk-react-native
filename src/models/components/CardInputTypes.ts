import type { ReactNode } from 'react';
import type { KeyboardTypeOptions, StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import type { UseCardFormReturn } from './CardFormTypes';

export interface PrimerTextInputTheme {
  primaryColor?: string;
  errorColor?: string;
  errorTextColor?: string;
  textColor?: string;
  labelColor?: string;
  placeholderColor?: string;
  backgroundColor?: string;
  disabledBackgroundColor?: string;
  borderColor?: string;
  disabledBorderColor?: string;
  borderWidth?: number;
  focusedBorderWidth?: number;
  errorBorderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  labelFontSize?: number;
  errorFontSize?: number;
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
  error?: string;
  trailingContent?: ReactNode;
  onSelectionChange?: TextInputProps['onSelectionChange'];
  selectionColor?: string;
  theme?: PrimerTextInputTheme;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
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
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export interface CardNumberInputProps extends CardInputBaseProps {
  showCardNetworkIcon?: boolean;
}

export type ExpiryDateInputProps = CardInputBaseProps;

export type CVVInputProps = CardInputBaseProps;

export type CardholderNameInputProps = CardInputBaseProps;
