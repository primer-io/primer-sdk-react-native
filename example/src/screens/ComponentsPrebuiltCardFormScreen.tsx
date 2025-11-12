import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  PrimerCheckoutProvider,
  CardForm,
} from '@primer-io/react-native';

/**
 * Example screen demonstrating pre-built CardForm component
 * This shows the simplest integration approach with minimal code
 */
function PrebuiltCardFormContent() {
  const [isValid, setIsValid] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pre-built Card Form</Text>
      <Text style={styles.subtitle}>
        Using the CardForm component with built-in UI
      </Text>

      <CardForm
        showCardholderName
        onValidationChange={setIsValid}
        theme={{
          primaryColor: '#0066FF',
          errorColor: '#FF3B30',
          borderRadius: 8,
          fontSize: 16,
          fieldSpacing: 16,
        }}
        submitButtonText="Pay $99.99"
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
    </View>
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
    padding: 24,
    backgroundColor: '#FFFFFF',
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
