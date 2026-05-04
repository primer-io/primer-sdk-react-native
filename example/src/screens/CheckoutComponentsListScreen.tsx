import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PrimerCheckoutProvider,
  PrimerCheckoutSheet,
} from '@primer-io/react-native';
import type {PrimerSettings} from '@primer-io/react-native';
import {createClientSession} from '../network/api';
import {appPaymentParameters} from '../models/IClientSessionRequestBody';
import {customAppearanceMode} from './SettingsScreen';
import {getPaymentHandlingStringVal} from '../network/Environment';
import {STRIPE_ACH_PUBLISHABLE_KEY} from '../Keys';

interface Example {
  id: string;
  title: string;
  description: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'default',
    title: 'Default',
    description: 'Basic checkout flow with payment method list',
  },
];

export function CheckoutComponentsListScreen() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleOpen = async (example: Example) => {
    setLoadingId(example.id);
    try {
      const response = await createClientSession();
      setCheckoutToken(response.clientToken);
      setSheetVisible(true);
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoadingId(null);
    }
  };

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
    <>
      <ScrollView style={componentStyles.container}>
        {EXAMPLES.map(example => {
          const isLoading = loadingId === example.id;
          return (
            <TouchableOpacity
              key={example.id}
              style={componentStyles.item}
              onPress={() => handleOpen(example)}
              disabled={loadingId !== null}>
              <View style={componentStyles.itemContent}>
                <Text style={componentStyles.itemTitle}>{example.title}</Text>
                <Text style={componentStyles.itemDescription}>
                  {example.description}
                </Text>
              </View>
              {isLoading && <ActivityIndicator />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {checkoutToken !== null && (
        <PrimerCheckoutProvider
          clientToken={checkoutToken}
          settings={settings}
          onCheckoutComplete={checkoutData => {
            console.log('Checkout complete:', checkoutData);
            setSheetVisible(false);
          }}
          onError={error => {
            console.error('Checkout error:', error);
            Alert.alert('Checkout Error', error.errorId ?? 'Unknown error');
          }}>
          <PrimerCheckoutSheet
            visible={sheetVisible}
            onRequestDismiss={() => setSheetVisible(false)}
            onDismiss={() => setCheckoutToken(null)}
          />
        </PrimerCheckoutProvider>
      )}
    </>
  );
}

const componentStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  item: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  itemTitle: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
});
