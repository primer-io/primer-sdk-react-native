import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useCardForm } from './hooks/useCardForm';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import { PrimerInputElementType } from '../models/PrimerInputElementType';
import type { CardFormProps, CardFormTheme } from '../models/components/CardFormTypes';
import { CardNumberInput, ExpiryDateInput, CVVInput, CardholderNameInput } from './inputs';

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
        <CardNumberInput
          value={cardForm.cardNumber}
          onChangeText={cardForm.updateCardNumber}
          onFocus={() => setFocusedField('cardNumber')}
          onBlur={() => {
            setFocusedField(null);
            cardForm.markFieldTouched('cardNumber');
          }}
          error={cardForm.errors.cardNumber}
          cardNetwork={cardForm.metadata?.cardNetwork}
          isFocused={focusedField === 'cardNumber'}
          theme={theme}
          style={{ marginBottom: theme.fieldSpacing }}
        />
      )}

      {/* Expiry Date and CVV Row */}
      <View style={[styles.row, { marginBottom: theme.fieldSpacing }]}>
        {/* Expiry Date */}
        {shouldShowField(PrimerInputElementType.EXPIRY_DATE) && (
          <ExpiryDateInput
            value={cardForm.expiryDate}
            onChangeText={cardForm.updateExpiryDate}
            onFocus={() => setFocusedField('expiryDate')}
            onBlur={() => {
              setFocusedField(null);
              cardForm.markFieldTouched('expiryDate');
            }}
            error={cardForm.errors.expiryDate}
            isFocused={focusedField === 'expiryDate'}
            theme={theme}
            style={styles.halfWidth}
          />
        )}

        {/* CVV */}
        {shouldShowField(PrimerInputElementType.CVV) && (
          <CVVInput
            value={cardForm.cvv}
            onChangeText={cardForm.updateCVV}
            onFocus={() => setFocusedField('cvv')}
            onBlur={() => {
              setFocusedField(null);
              cardForm.markFieldTouched('cvv');
            }}
            error={cardForm.errors.cvv}
            isFocused={focusedField === 'cvv'}
            theme={theme}
            style={[styles.halfWidth, { marginLeft: 12 }]}
          />
        )}
      </View>

      {/* Cardholder Name */}
      {showCardholderName && shouldShowField(PrimerInputElementType.CARDHOLDER_NAME) && (
        <CardholderNameInput
          value={cardForm.cardholderName}
          onChangeText={cardForm.updateCardholderName}
          onFocus={() => setFocusedField('cardholderName')}
          onBlur={() => {
            setFocusedField(null);
            cardForm.markFieldTouched('cardholderName');
          }}
          error={cardForm.errors.cardholderName}
          isFocused={focusedField === 'cardholderName'}
          theme={theme}
          style={{ marginBottom: theme.fieldSpacing }}
        />
      )}

      {/* Submit Button */}
      {showSubmitButton && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              height: theme.fieldHeight + 8,
              borderRadius: theme.borderRadius,
              backgroundColor: cardForm.isValid && !cardForm.isSubmitting ? theme.primaryColor : theme.borderColor,
              opacity: cardForm.isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!cardForm.isValid || cardForm.isSubmitting}
          testID="submit-button"
        >
          {cardForm.isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.submitButtonText, { fontSize: theme.fontSize, fontFamily: theme.fontFamily }]}>
              {submitButtonText}
            </Text>
          )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfWidth: {
    flex: 1,
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
