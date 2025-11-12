import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import {
  PrimerCheckoutProvider,
  CardForm,
  PaymentMethodList,
  PaymentSummary,
} from '@primer-io/react-native';
import type { PaymentMethodItemType } from '@primer-io/react-native';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';

/**
 * Example screen demonstrating pre-built CardForm component
 * This shows the simplest integration approach with minimal code
 */
function PrebuiltCardFormContent() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItemType | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Calculate total from line items
  const totalAmount = appPaymentParameters.clientSessionRequestBody.order?.lineItems?.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  ) || 0;
  const currencyCode = appPaymentParameters.clientSessionRequestBody.currencyCode || 'EUR';

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
    setIsValid(false);
  };

  const theme = {
    primaryColor: '#0066FF',
    errorColor: '#FF3B30',
    borderRadius: 8,
    fontSize: 16,
    fieldSpacing: 16,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Pre-built Components</Text>
      <Text style={styles.subtitle}>
        Payment Method List + Card Form Integration
      </Text>

      {/* Payment Summary */}
      <PaymentSummary
        amount={totalAmount}
        currencyCode={currencyCode}
        theme={{
          ...theme,
          backgroundColor: '#F9FAFB',
        }}
        style={styles.summary}
      />

      {/* Show Payment Method List or Card Form */}
      {!selectedPaymentMethod ? (
        <>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <PaymentMethodList
            onPaymentMethodPress={handlePaymentMethodPress}
            showCardFirst={true}
            showComingSoonBadge={true}
            theme={theme}
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

          <Text style={styles.sectionTitle}>Card Details</Text>
          <CardForm
            showCardholderName
            onValidationChange={setIsValid}
            theme={theme}
            testID="card-form"
          />

          {/* Status indicator */}
          {__DEV__ && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Form Status: {isValid ? '✅ Valid' : '⚠️ Invalid'}
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
export default function ComponentsPrebuiltCardFormScreen(props: any) {
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
      <PrebuiltCardFormContent />
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
    color: '#0066FF',
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
