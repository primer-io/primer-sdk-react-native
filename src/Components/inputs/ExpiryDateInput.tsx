import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { BaseInputProps } from '../../models/components/InputTheme';

export interface ExpiryDateInputProps extends BaseInputProps {}

const defaultTheme = {
  primaryColor: '#0066FF',
  errorColor: '#FF3B30',
  textColor: '#000000',
  placeholderColor: '#999999',
  backgroundColor: '#FFFFFF',
  borderColor: '#E0E0E0',
  borderWidth: 1,
  borderRadius: 8,
  fontSize: 16,
  fieldHeight: 48,
};

/**
 * Expiry Date Input Component
 *
 * A pre-styled input field for card expiry dates with automatic formatting.
 *
 * @example
 * ```tsx
 * const cardForm = useCardForm();
 *
 * <ExpiryDateInput
 *   value={cardForm.expiryDate}
 *   onChangeText={cardForm.updateExpiryDate}
 *   onBlur={() => cardForm.markFieldTouched('expiryDate')}
 *   error={cardForm.errors.expiryDate}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function ExpiryDateInput(props: ExpiryDateInputProps) {
  const {
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    isFocused = false,
    placeholder = 'MM/YY',
    label = 'Expiry Date',
    showLabel = true,
    theme: customTheme,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    testID = 'expiry-date-input',
  } = props;

  const theme = {
    primaryColor: customTheme?.primaryColor ?? defaultTheme.primaryColor,
    errorColor: customTheme?.errorColor ?? defaultTheme.errorColor,
    textColor: customTheme?.textColor ?? defaultTheme.textColor,
    placeholderColor: customTheme?.placeholderColor ?? defaultTheme.placeholderColor,
    backgroundColor: customTheme?.backgroundColor ?? defaultTheme.backgroundColor,
    borderColor: customTheme?.borderColor ?? defaultTheme.borderColor,
    borderWidth: customTheme?.borderWidth ?? defaultTheme.borderWidth,
    borderRadius: customTheme?.borderRadius ?? defaultTheme.borderRadius,
    focusedBorderColor: customTheme?.focusedBorderColor ?? customTheme?.primaryColor ?? defaultTheme.primaryColor,
    fontSize: customTheme?.fontSize ?? defaultTheme.fontSize,
    fontFamily: customTheme?.fontFamily,
    fieldHeight: customTheme?.fieldHeight ?? defaultTheme.fieldHeight,
  };

  const getBorderColor = () => {
    if (error) return theme.errorColor;
    if (isFocused) return theme.focusedBorderColor;
    return theme.borderColor;
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.textColor, fontSize: theme.fontSize - 2 }, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            height: theme.fieldHeight,
            borderColor: getBorderColor(),
            borderWidth: theme.borderWidth,
            borderRadius: theme.borderRadius,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            fontSize: theme.fontSize,
            fontFamily: theme.fontFamily,
          },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholderColor}
        keyboardType="number-pad"
        maxLength={5}
        autoComplete="cc-exp"
        testID={testID}
      />
      {error && (
        <Text style={[styles.error, { color: theme.errorColor, fontSize: theme.fontSize - 4 }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
  },
});
