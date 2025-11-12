import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CardNetworkIcon } from '../CardNetworkIcon';
import type { BaseInputProps } from '../../models/components/InputTheme';

export interface CardNumberInputProps extends BaseInputProps {
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
 * ```tsx
 * const cardForm = useCardForm();
 *
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
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    cardNetwork,
    isFocused = false,
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
