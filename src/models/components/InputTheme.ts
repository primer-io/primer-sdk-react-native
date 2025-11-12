import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * Theme configuration for card input components
 */
export interface InputTheme {
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
}

/**
 * Props common to all card input components
 */
export interface BaseInputProps {
  /**
   * Current input value
   */
  value: string;

  /**
   * Called when the input value changes
   */
  onChangeText: (value: string) => void;

  /**
   * Called when the input loses focus
   */
  onBlur?: () => void;

  /**
   * Called when the input gains focus
   */
  onFocus?: () => void;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether the field is currently focused
   */
  isFocused?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean;

  /**
   * Theme configuration
   */
  theme?: InputTheme;

  /**
   * Style for the container view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Style for the input field
   */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Style for the label
   */
  labelStyle?: StyleProp<TextStyle>;

  /**
   * Style for the error text
   */
  errorStyle?: StyleProp<TextStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}
