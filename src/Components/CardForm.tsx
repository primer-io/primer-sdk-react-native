import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useCardForm } from './hooks/useCardForm';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import { PrimerInputElementType } from '../models/PrimerInputElementType';
import type { CardFormProps, CardFormTheme } from '../models/components/CardFormTypes';

/**
 * Default theme for CardForm
 */
const defaultTheme: CardFormTheme = {
  primaryColor: '#0066FF',
  errorColor: '#FF3B30',
  textColor: '#000000',
  placeholderColor: '#999999',
  backgroundColor: '#FFFFFF',
  borderColor: '#E0E0E0',
  borderWidth: 1,
  borderRadius: 8,
  focusedBorderColor: '#0066FF',
  fontSize: 16,
  fieldHeight: 48,
  fieldSpacing: 16,
};

/**
 * Pre-built card form component with built-in styling and validation
 *
 * This component uses the useCardForm hook internally to provide
 * a complete card payment form with minimal configuration.
 *
 * @example
 * ```tsx
 * <CardForm
 *   showCardholderName
 *   onValidationChange={(isValid) => setCanSubmit(isValid)}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function CardForm(props: CardFormProps) {
  const {
    onValidationChange,
    onStateChange,
    onValidationError,
    theme: customTheme,
    style,
    showCardholderName = false,
    showSubmitButton = true,
    submitButtonText = 'Pay',
    onSubmit,
  } = props;

  const { isReady } = usePrimerCheckout();

  const theme = {
    primaryColor: customTheme?.primaryColor ?? defaultTheme.primaryColor ?? '#0066FF',
    errorColor: customTheme?.errorColor ?? defaultTheme.errorColor ?? '#FF3B30',
    textColor: customTheme?.textColor ?? defaultTheme.textColor ?? '#000000',
    placeholderColor: customTheme?.placeholderColor ?? defaultTheme.placeholderColor ?? '#999999',
    backgroundColor: customTheme?.backgroundColor ?? defaultTheme.backgroundColor ?? '#FFFFFF',
    borderColor: customTheme?.borderColor ?? defaultTheme.borderColor ?? '#E0E0E0',
    borderWidth: customTheme?.borderWidth ?? defaultTheme.borderWidth ?? 1,
    borderRadius: customTheme?.borderRadius ?? defaultTheme.borderRadius ?? 8,
    focusedBorderColor: customTheme?.focusedBorderColor ?? customTheme?.primaryColor ?? defaultTheme.focusedBorderColor ?? '#0066FF',
    fontSize: customTheme?.fontSize ?? defaultTheme.fontSize ?? 16,
    fontFamily: customTheme?.fontFamily,
    fieldHeight: customTheme?.fieldHeight ?? defaultTheme.fieldHeight ?? 48,
    fieldSpacing: customTheme?.fieldSpacing ?? defaultTheme.fieldSpacing ?? 16,
  };

  const cardForm = useCardForm({
    onValidationChange: (isValid, errors) => {
      onValidationChange?.(isValid);
      if (errors && errors.length > 0) {
        onValidationError?.(errors);
      }
    },
    collectCardholderName: showCardholderName,
  });

  // Notify parent of state changes
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({
        values: {
          cardNumber: cardForm.cardNumber,
          expiryDate: cardForm.expiryDate,
          cvv: cardForm.cvv,
          cardholderName: cardForm.cardholderName,
        },
        isValid: cardForm.isValid,
        errors: cardForm.errors,
        metadata: cardForm.metadata,
      });
    }
  }, [
    cardForm.cardNumber,
    cardForm.expiryDate,
    cardForm.cvv,
    cardForm.cardholderName,
    cardForm.isValid,
    cardForm.errors,
    cardForm.metadata,
    onStateChange,
  ]);

  const handleSubmit = () => {
    if (cardForm.isValid) {
      if (onSubmit) {
        onSubmit();
      } else {
        cardForm.submit();
      }
    }
  };

  const fieldStyle = (hasError: boolean, isFocused: boolean): StyleProp<TextStyle> => [
    styles.input,
    {
      height: theme.fieldHeight,
      borderColor: hasError ? theme.errorColor : isFocused ? theme.focusedBorderColor : theme.borderColor,
      borderWidth: theme.borderWidth,
      borderRadius: theme.borderRadius,
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontSize: theme.fontSize,
      fontFamily: theme.fontFamily,
    },
  ];

  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const shouldShowField = (fieldType: PrimerInputElementType): boolean => {
    return cardForm.requiredFields.includes(fieldType);
  };

  // Show loading state while SDK is initializing
  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={[styles.loadingText, { color: theme.textColor }]}>
          Initializing payment form...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Card Number */}
      {shouldShowField(PrimerInputElementType.CARD_NUMBER) && (
        <View style={[styles.fieldContainer, { marginBottom: theme.fieldSpacing }]}>
          <Text style={[styles.label, { color: theme.textColor, fontSize: theme.fontSize - 2 }]}>
            Card Number
          </Text>
          <TextInput
            style={fieldStyle(!!cardForm.errors.cardNumber, focusedField === 'cardNumber')}
            value={cardForm.cardNumber}
            onChangeText={cardForm.updateCardNumber}
            onFocus={() => setFocusedField('cardNumber')}
            onBlur={() => setFocusedField(null)}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={theme.placeholderColor}
            keyboardType="number-pad"
            maxLength={19}
            autoComplete="cc-number"
            testID="card-number-input"
          />
          {cardForm.errors.cardNumber && (
            <Text style={[styles.errorText, { color: theme.errorColor, fontSize: theme.fontSize - 4 }]}>
              {cardForm.errors.cardNumber}
            </Text>
          )}
          {cardForm.metadata?.cardNetwork && (
            <Text style={[styles.helperText, { color: theme.primaryColor, fontSize: theme.fontSize - 4 }]}>
              {cardForm.metadata.cardNetwork}
            </Text>
          )}
        </View>
      )}

      {/* Expiry Date and CVV Row */}
      <View style={[styles.row, { marginBottom: theme.fieldSpacing }]}>
        {/* Expiry Date */}
        {shouldShowField(PrimerInputElementType.EXPIRY_DATE) && (
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.textColor, fontSize: theme.fontSize - 2 }]}>
              Expiry Date
            </Text>
            <TextInput
              style={fieldStyle(!!cardForm.errors.expiryDate, focusedField === 'expiryDate')}
              value={cardForm.expiryDate}
              onChangeText={cardForm.updateExpiryDate}
              onFocus={() => setFocusedField('expiryDate')}
              onBlur={() => setFocusedField(null)}
              placeholder="MM/YY"
              placeholderTextColor={theme.placeholderColor}
              keyboardType="number-pad"
              maxLength={5}
              autoComplete="cc-exp"
              testID="expiry-date-input"
            />
            {cardForm.errors.expiryDate && (
              <Text style={[styles.errorText, { color: theme.errorColor, fontSize: theme.fontSize - 4 }]}>
                {cardForm.errors.expiryDate}
              </Text>
            )}
          </View>
        )}

        {/* CVV */}
        {shouldShowField(PrimerInputElementType.CVV) && (
          <View style={[styles.fieldContainer, styles.halfWidth, { marginLeft: 12 }]}>
            <Text style={[styles.label, { color: theme.textColor, fontSize: theme.fontSize - 2 }]}>CVV</Text>
            <TextInput
              style={fieldStyle(!!cardForm.errors.cvv, focusedField === 'cvv')}
              value={cardForm.cvv}
              onChangeText={cardForm.updateCVV}
              onFocus={() => setFocusedField('cvv')}
              onBlur={() => setFocusedField(null)}
              placeholder="123"
              placeholderTextColor={theme.placeholderColor}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              autoComplete="cc-csc"
              testID="cvv-input"
            />
            {cardForm.errors.cvv && (
              <Text style={[styles.errorText, { color: theme.errorColor, fontSize: theme.fontSize - 4 }]}>
                {cardForm.errors.cvv}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Cardholder Name */}
      {showCardholderName && shouldShowField(PrimerInputElementType.CARDHOLDER_NAME) && (
        <View style={[styles.fieldContainer, { marginBottom: theme.fieldSpacing }]}>
          <Text style={[styles.label, { color: theme.textColor, fontSize: theme.fontSize - 2 }]}>
            Cardholder Name
          </Text>
          <TextInput
            style={fieldStyle(!!cardForm.errors.cardholderName, focusedField === 'cardholderName')}
            value={cardForm.cardholderName}
            onChangeText={cardForm.updateCardholderName}
            onFocus={() => setFocusedField('cardholderName')}
            onBlur={() => setFocusedField(null)}
            placeholder="John Doe"
            placeholderTextColor={theme.placeholderColor}
            autoCapitalize="words"
            autoComplete="name"
            testID="cardholder-name-input"
          />
          {cardForm.errors.cardholderName && (
            <Text style={[styles.errorText, { color: theme.errorColor, fontSize: theme.fontSize - 4 }]}>
              {cardForm.errors.cardholderName}
            </Text>
          )}
        </View>
      )}

      {/* Submit Button */}
      {showSubmitButton && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              height: theme.fieldHeight + 8,
              borderRadius: theme.borderRadius,
              backgroundColor: cardForm.isValid ? theme.primaryColor : theme.borderColor,
            },
          ]}
          onPress={handleSubmit}
          disabled={!cardForm.isValid}
          testID="submit-button"
        >
          <Text style={[styles.submitButtonText, { fontSize: theme.fontSize, fontFamily: theme.fontFamily }]}>
            {submitButtonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  fieldContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 4,
  },
  helperText: {
    marginTop: 4,
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
