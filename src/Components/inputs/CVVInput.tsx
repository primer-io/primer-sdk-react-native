import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { BaseInputProps, ConnectedInputProps } from '../../models/components/InputTheme';

export interface CVVInputProps extends BaseInputProps, ConnectedInputProps {}

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
 * CVV Input Component
 *
 * A pre-styled input field for card CVV/CVC codes with secure entry.
 *
 * @example
 * ```tsx
 * const cardForm = useCardForm();
 *
 * <CVVInput
 *   value={cardForm.cvv}
 *   onChangeText={cardForm.updateCVV}
 *   onBlur={() => cardForm.markFieldTouched('cvv')}
 *   error={cardForm.errors.cvv}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function CVVInput(props: CVVInputProps) {
  const {
    cardForm,
    field,
    value: valueProp,
    onChangeText: onChangeTextProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    error: errorProp,
    isFocused: isFocusedProp,
    placeholder = '123',
    label = 'CVV',
    showLabel = true,
    theme: customTheme,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    testID = 'cvv-input',
  } = props;

  const [internalFocused, setInternalFocused] = useState(false);
  const isConnected = cardForm && field;

  const value = isConnected ? cardForm[field] : (valueProp ?? '');
  const error = isConnected ? cardForm.errors[field] : errorProp;
  const isFocused = isConnected ? internalFocused : (isFocusedProp ?? false);

  const onChangeText = isConnected
    ? (field === 'cvv' ? cardForm.updateCVV : () => {})
    : (onChangeTextProp ?? (() => {}));

  const onFocus = isConnected
    ? () => {
        setInternalFocused(true);
        onFocusProp?.();
      }
    : onFocusProp;

  const onBlur = isConnected
    ? () => {
        setInternalFocused(false);
        cardForm.markFieldTouched(field);
        onBlurProp?.();
      }
    : onBlurProp;

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
        secureTextEntry
        maxLength={4}
        autoComplete="cc-csc"
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
