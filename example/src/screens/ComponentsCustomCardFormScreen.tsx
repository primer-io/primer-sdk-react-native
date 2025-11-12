import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  PrimerCheckoutProvider,
  useCardForm,
  InputElementType,
  PaymentMethodList,
  PaymentSummary,
  usePaymentMethodList,
} from '@primer-io/react-native';
import type { PaymentMethodItemType } from '@primer-io/react-native';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';

/**
 * Example screen demonstrating custom card form UI using hooks
 * This shows the flexible, hook-based approach for full UI control
 */
function CustomCardFormContent() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItemType | null>(null);

  const { paymentMethods } = usePaymentMethodList({
    showCardFirst: true,
  });

  // Calculate total from line items
  const totalAmount = appPaymentParameters.clientSessionRequestBody.order?.lineItems?.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  ) || 0;
  const currencyCode = appPaymentParameters.clientSessionRequestBody.currencyCode || 'EUR';

  const cardForm = useCardForm({
    onValidationChange: (isValid, errors) => {
      console.log('Validation changed:', { isValid, errors });
    },
    onMetadataChange: (metadata) => {
      console.log('Card metadata:', metadata);
    },
    collectCardholderName: true,
  });

  const handleSubmit = async () => {
    try {
      await cardForm.submit();
      Alert.alert('Success', 'Payment submitted successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit payment');
    }
  };

  const handlePaymentMethodPress = (method: PaymentMethodItemType) => {
    if (method.type === 'PAYMENT_CARD') {
      setSelectedPaymentMethod(method);
    } else {
      Alert.alert(
        'Coming Soon!',
        `${method.name} payment method will be available soon.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackToList = () => {
    setSelectedPaymentMethod(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Custom Hook Example</Text>
      <Text style={styles.subtitle}>
        Using usePaymentMethodList + useCardForm hooks with manual UI
      </Text>

      {/* Payment Summary */}
      <PaymentSummary
        amount={totalAmount}
        currencyCode={currencyCode}
        theme={{
          primaryColor: '#10B981',
          backgroundColor: '#F0FDF4',
        }}
        style={styles.summary}
      />

      {/* Show Payment Method List or Custom Card Form */}
      {!selectedPaymentMethod ? (
        <>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <PaymentMethodList
            onPaymentMethodPress={handlePaymentMethodPress}
            showCardFirst={true}
            showComingSoonBadge={true}
            theme={{
              primaryColor: '#10B981',
              borderRadius: 12,
            }}
            testID="payment-method-list"
          />
        </>
      ) : (
        <>
          <View style={styles.backButtonContainer}>
            <Text style={styles.backButton} onPress={handleBackToList}>
              ← Back to payment methods
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Enter Card Details</Text>

      {/* Card Number */}
      {cardForm.requiredFields.includes(InputElementType.CARD_NUMBER) && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={[
              styles.input,
              cardForm.errors.cardNumber && styles.inputError,
            ]}
            value={cardForm.cardNumber}
            onChangeText={cardForm.updateCardNumber}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            maxLength={19}
            testID="card-number-input"
          />
          {cardForm.errors.cardNumber && (
            <Text style={styles.errorText}>{cardForm.errors.cardNumber}</Text>
          )}
          {cardForm.metadata?.cardNetwork && (
            <Text style={styles.helperText}>
              Detected: {cardForm.metadata.cardNetwork}
            </Text>
          )}
        </View>
      )}

      {/* Expiry Date and CVV Row */}
      <View style={styles.row}>
        {/* Expiry Date */}
        {cardForm.requiredFields.includes(InputElementType.EXPIRY_DATE) && (
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={[
                styles.input,
                cardForm.errors.expiryDate && styles.inputError,
              ]}
              value={cardForm.expiryDate}
              onChangeText={cardForm.updateExpiryDate}
              placeholder="MM/YY"
              keyboardType="number-pad"
              maxLength={5}
              testID="expiry-date-input"
            />
            {cardForm.errors.expiryDate && (
              <Text style={styles.errorText}>{cardForm.errors.expiryDate}</Text>
            )}
          </View>
        )}

        {/* CVV */}
        {cardForm.requiredFields.includes(InputElementType.CVV) && (
          <View
            style={[styles.fieldContainer, styles.halfWidth, styles.marginLeft]}
          >
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[styles.input, cardForm.errors.cvv && styles.inputError]}
              value={cardForm.cvv}
              onChangeText={cardForm.updateCVV}
              placeholder="123"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              testID="cvv-input"
            />
            {cardForm.errors.cvv && (
              <Text style={styles.errorText}>{cardForm.errors.cvv}</Text>
            )}
          </View>
        )}
      </View>

      {/* Cardholder Name */}
      {cardForm.requiredFields.includes(InputElementType.CARDHOLDER_NAME) && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={[
              styles.input,
              cardForm.errors.cardholderName && styles.inputError,
            ]}
            value={cardForm.cardholderName}
            onChangeText={cardForm.updateCardholderName}
            placeholder="John Doe"
            autoCapitalize="words"
            testID="cardholder-name-input"
          />
          {cardForm.errors.cardholderName && (
            <Text style={styles.errorText}>
              {cardForm.errors.cardholderName}
            </Text>
          )}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.payButton,
          !cardForm.isValid && styles.payButtonDisabled,
        ]}
        disabled={!cardForm.isValid}
        onPress={handleSubmit}
        testID="submit-button"
      >
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>

          {/* Debug Info */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                Form Valid: {cardForm.isValid ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                Required Fields: {cardForm.requiredFields.join(', ')}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

/**
 * Main screen component with PrimerCheckoutProvider
 */
export default function ComponentsCustomCardFormScreen(props: any) {
  const { clientToken } = props.route.params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      onCheckoutComplete={(data) => {
        console.log('Checkout complete:', data);
        Alert.alert('Success!', `Payment ${data.payment?.id} completed`, [
          {
            text: 'OK',
            onPress: () => props.navigation.goBack(),
          },
        ]);
      }}
      onError={(error, checkoutData) => {
        console.error('Checkout error:', error);
        Alert.alert('Error', error.description || 'Payment failed');
      }}
    >
      <CustomCardFormContent />
    </PrimerCheckoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  summary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  backButtonContainer: {
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FF3B30',
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: '#0066FF',
  },
  payButton: {
    height: 56,
    backgroundColor: '#0066FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  debugText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
});
