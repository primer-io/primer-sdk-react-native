import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PrimerCheckoutProvider,
  usePaymentMethods,
} from '@primer-io/react-native';
import type {
  PaymentMethodItem,
  PrimerSettings,
} from '@primer-io/react-native';
import {appPaymentParameters} from '../models/IClientSessionRequestBody';
import {customAppearanceMode} from './SettingsScreen';
import {getPaymentHandlingStringVal} from '../network/Environment';
import {STRIPE_ACH_PUBLISHABLE_KEY} from '../Keys';

function CustomPaymentMethodContent() {
  const {paymentMethods, isLoading, error, selectedMethod, selectMethod} =
    usePaymentMethods();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No payment methods available</Text>
      </View>
    );
  }

  const renderItem = ({item}: {item: PaymentMethodItem}) => {
    const isSelected = selectedMethod?.type === item.type;

    return (
      <TouchableOpacity
        style={[styles.methodItem, isSelected && styles.methodItemSelected]}
        onPress={() => selectMethod(item)}
        activeOpacity={0.7}>
        <View style={styles.methodInfo}>
          {item.logo != null && (
            <Image
              source={{uri: item.logo}}
              style={styles.methodLogo}
              resizeMode="contain"
            />
          )}
          <View style={styles.methodText}>
            <Text style={styles.methodName}>{item.name}</Text>
            <Text style={styles.methodType}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.methodRight}>
          {item.surcharge != null && (
            <Text style={styles.surcharge}>+{item.surcharge}</Text>
          )}
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Payment Method List</Text>
      <Text style={styles.subtitle}>
        Built with usePaymentMethods() hook + plain React Native components
      </Text>
      <FlatList
        data={paymentMethods}
        keyExtractor={item => item.type}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      {selectedMethod != null && (
        <TouchableOpacity
          style={styles.footer}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Pay',
              `Initiate payment with ${selectedMethod.name}.\n\nIn a real app, you would start the payment flow here using the Headless Universal Checkout managers.`,
            );
          }}>
          <Text style={styles.footerText}>
            Pay with {selectedMethod.name}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function CustomPaymentMethodListScreen({route}: any) {
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
      <CustomPaymentMethodContent />
    </PrimerCheckoutProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  checkmark: {
    color: '#2f98ff',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#2f98ff',
    padding: 16,
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  methodInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  methodItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
  },
  methodItemSelected: {
    borderColor: '#2f98ff',
    borderWidth: 2,
  },
  methodLogo: {
    height: 32,
    marginRight: 12,
    width: 32,
  },
  methodName: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  methodRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  methodText: {
    flex: 1,
  },
  methodType: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  surcharge: {
    color: '#666',
    fontSize: 13,
  },
  title: {
    color: '#212121',
    fontSize: 20,
    fontWeight: '700',
    padding: 16,
    paddingBottom: 4,
  },
});
