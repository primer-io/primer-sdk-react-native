import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {PrimerCheckoutProvider, useCardForm} from '@primer-io/react-native';
import type {PrimerSettings} from '@primer-io/react-native';
import {appPaymentParameters} from '../models/IClientSessionRequestBody';
import {customAppearanceMode} from './SettingsScreen';
import {getPaymentHandlingStringVal} from '../network/Environment';
import {STRIPE_ACH_PUBLISHABLE_KEY} from '../Keys';

function CardFormContent() {
  const {
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,
    updateCardNumber,
    updateExpiryDate,
    updateCVV,
    updateCardholderName,
    isValid,
    errors,
    markFieldTouched,
    submit,
    isSubmitting,
    binData,
  } = useCardForm({collectCardholderName: true});

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Custom Card Form</Text>
      <Text style={styles.subtitle}>
        Built with useCardForm() hook + plain TextInputs
      </Text>

      {binData?.preferred && (
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>
            {binData.preferred.displayName}
          </Text>
        </View>
      )}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={[styles.input, errors.cardNumber ? styles.inputError : null]}
          value={cardNumber}
          onChangeText={updateCardNumber}
          onBlur={() => markFieldTouched('cardNumber')}
          placeholder="4242 4242 4242 4242"
          keyboardType="number-pad"
          maxLength={19}
        />
        {errors.cardNumber != null && (
          <Text style={styles.error}>{errors.cardNumber}</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.label}>Expiry</Text>
          <TextInput
            style={[
              styles.input,
              errors.expiryDate ? styles.inputError : null,
            ]}
            value={expiryDate}
            onChangeText={updateExpiryDate}
            onBlur={() => markFieldTouched('expiryDate')}
            placeholder="MM/YY"
            keyboardType="number-pad"
            maxLength={5}
          />
          {errors.expiryDate != null && (
            <Text style={styles.error}>{errors.expiryDate}</Text>
          )}
        </View>

        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv ? styles.inputError : null]}
            value={cvv}
            onChangeText={updateCVV}
            onBlur={() => markFieldTouched('cvv')}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          {errors.cvv != null && (
            <Text style={styles.error}>{errors.cvv}</Text>
          )}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={[
            styles.input,
            errors.cardholderName ? styles.inputError : null,
          ]}
          value={cardholderName}
          onChangeText={updateCardholderName}
          onBlur={() => markFieldTouched('cardholderName')}
          placeholder="Name on card"
          autoCapitalize="words"
        />
        {errors.cardholderName != null && (
          <Text style={styles.error}>{errors.cardholderName}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.payButton,
          (!isValid || isSubmitting) && styles.payButtonDisabled,
        ]}
        onPress={submit}
        disabled={!isValid || isSubmitting}
        activeOpacity={0.7}>
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.payButtonText}>Pay</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.statusText}>
        Form valid: {isValid ? 'Yes' : 'No'}
      </Text>
    </ScrollView>
  );
}

export function CustomCardFormScreen({route}: any) {
  const {clientToken} = route.params;

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(
      appPaymentParameters.paymentHandling,
    ),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io',
      },
      stripeOptions: {
        publishableKey: STRIPE_ACH_PUBLISHABLE_KEY,
        mandateData: {
          merchantName: 'My Merchant Name',
        },
      },
      googlePayOptions: {
        isCaptureBillingAddressEnabled: true,
        isExistingPaymentMethodRequired: false,
        shippingAddressParameters: {isPhoneNumberRequired: true},
        requireShippingMethod: false,
        emailAddressRequired: true,
      },
    },
    uiOptions: {
      appearanceMode: customAppearanceMode,
    },
    debugOptions: {
      is3DSSanityCheckEnabled: false,
    },
    clientSessionCachingEnabled: true,
    apiVersion: '2.4',
  };

  if (appPaymentParameters.merchantName) {
    settings.paymentMethodOptions!.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName,
    };
  }

  return (
    <PrimerCheckoutProvider clientToken={clientToken} settings={settings}>
      <CardFormContent />
    </PrimerCheckoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    padding: 16,
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  label: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  networkBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  networkText: {
    color: '#1565c0',
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: '#2f98ff',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statusText: {
    color: '#999',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 24,
  },
  title: {
    color: '#212121',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
});
