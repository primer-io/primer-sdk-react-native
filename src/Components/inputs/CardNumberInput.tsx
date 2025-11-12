import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CardNetworkIcon } from '../CardNetworkIcon';
import type { BaseInputProps, ConnectedInputProps } from '../../models/components/InputTheme';

export interface CardNumberInputProps extends BaseInputProps, ConnectedInputProps {
  /**
   * Detected card network (e.g., "VISA", "MASTERCARD")
   */
  cardNetwork?: string;

  /**
   * Whether to show the card network icon
   * @default true
   */
  showCardNetworkIcon?: boolean;
}

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
 * Card Number Input Component
 *
 * A pre-styled input field for card numbers with automatic card network detection
 * and icon display.
 *
 * @example
 * Connected mode (recommended):
 * ```tsx
 * const cardForm = useCardForm();
 * <CardNumberInput cardForm={cardForm} field="cardNumber" theme={theme} />
 * ```
 *
 * Manual mode (verbose):
 * ```tsx
 * <CardNumberInput
 *   value={cardForm.cardNumber}
 *   onChangeText={cardForm.updateCardNumber}
 *   onBlur={() => cardForm.markFieldTouched('cardNumber')}
 *   error={cardForm.errors.cardNumber}
 *   cardNetwork={cardForm.metadata?.cardNetwork}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function CardNumberInput(props: CardNumberInputProps) {
  const {
    // Connected mode
    cardForm,
    field,
    // Manual mode
    value: valueProp,
    onChangeText: onChangeTextProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    error: errorProp,
    cardNetwork: cardNetworkProp,
    isFocused: isFocusedProp,
    // Common props
    placeholder = '1234 5678 9012 3456',
    label = 'Card Number',
    showLabel = true,
    showCardNetworkIcon = true,
    theme: customTheme,
    style,
    inputStyle,
    labelStyle,
    errorStyle,
    testID = 'card-number-input',
  } = props;

  // Internal focus state for connected mode
  const [internalFocused, setInternalFocused] = useState(false);

  // Determine if we're in connected mode
  const isConnected = cardForm && field;

  // Get values from cardForm or props
  const value = isConnected ? cardForm[field] : (valueProp ?? '');
  const error = isConnected ? cardForm.errors[field] : errorProp;
  const cardNetwork = isConnected ? cardForm.metadata?.cardNetwork : cardNetworkProp;
  const isFocused = isConnected ? internalFocused : (isFocusedProp ?? false);

  // Get handlers
  const onChangeText = isConnected
    ? (field === 'cardNumber' ? cardForm.updateCardNumber : () => {})
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
      <View style={styles.inputContainer}>
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
              paddingRight: showCardNetworkIcon && cardNetwork ? 65 : 16,
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
          maxLength={19}
          autoComplete="cc-number"
          testID={testID}
        />
        {showCardNetworkIcon && cardNetwork && (
          <View style={styles.iconContainer}>
            <CardNetworkIcon cardNetwork={cardNetwork} badgeColor={theme.primaryColor} />
          </View>
        )}
      </View>
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
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  error: {
    marginTop: 4,
  },
});
