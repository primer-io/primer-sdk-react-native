import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { BaseInputProps } from '../../models/components/InputTheme';

export interface CardholderNameInputProps extends BaseInputProps {}

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
 * Cardholder Name Input Component
 *
 * A pre-styled input field for cardholder names.
 *
 * @example
 * ```tsx
 * const cardForm = useCardForm({ collectCardholderName: true });
 *
 * <CardholderNameInput
 *   value={cardForm.cardholderName}
 *   onChangeText={cardForm.updateCardholderName}
 *   onBlur={() => cardForm.markFieldTouched('cardholderName')}
 *   error={cardForm.errors.cardholderName}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function CardholderNameInput(props: CardholderNameInputProps) {
  const {
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    isFocused = false,
    placeholder = 'John Doe',
    label = 'Cardholder Name',
    showLabel = true,
    theme: customTheme,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    testID = 'cardholder-name-input',
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
        autoCapitalize="words"
        autoComplete="name"
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
