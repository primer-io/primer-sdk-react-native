import React, { useEffect, useState } from 'react';
import {
  PrimerHUC
} from '@primer-io/react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { createClientSession } from '../api/client-session';
import type { PrimerSettings } from 'src/models/primer-settings';
import { createPayment } from '../api/create-payment';

const huc = new PrimerHUC();

export const HeadlessCheckoutScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  const [error, setError] = useState<null | any>(null);

  huc.getAssetFor("apple-pay",
    "logo",
    (err) => {
      console.error(err.description);
    },
    (url) => {
      setLocalImageUrl(url);
    });

  useEffect(() => {
    const settings: PrimerSettings = {
      options: {
        ios: {
          merchantIdentifier: "merchant.checkout.team"
        }
      }
    }

    createClientSession('customerId123').then((session) => {
      setIsLoading(false);

      huc.startHeadlessCheckout(session.clientToken, 
        settings,
        (err) => {
          setError(err);
          console.error(err);
        },
        (paymentMethodTypes) => {
          setShowPaymentMethods(true);
          console.log(`Available payment methods: ${JSON.stringify(paymentMethodTypes)}`);
        });
    });
  }, []);

  huc.onTokenizeSuccess = async (paymentMethodToken) => {
    try {
      const response = await createPayment(paymentMethodToken.token);
      console.log(JSON.stringify(response));
      setPaymentResponse(response);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  const payWithApplePay = () => {
    huc.showPaymentMethod("APPLE_PAY");
  }

  const renderPaymentMethods = () => {
    if (!showPaymentMethods) {
      return null;
    } else {
      return (
        <TouchableOpacity
              style={{
                marginHorizontal: 20, 
                height: 50, 
                backgroundColor: 'black', 
                justifyContent: 'center', 
                alignItems: "center",
                borderRadius: 4
              }}
              onPress={payWithApplePay}
            >
              <Image source={{uri: localImageUrl}} style = {{width: 60, height: 25, resizeMode : 'contain', tintColor: 'white' }} />
            </TouchableOpacity>
      )
    }
  }

  const renderResponse = () => {
    if (!paymentResponse) {
      return null;
    } else {
      return (
        <Text style={{color: "black"}}>
          {JSON.stringify(paymentResponse)}
        </Text>
      )
    }
  }

  const renderError = () => {
    if (!error) {
      return null;
    } else {
      return (
        <Text style={{color: "red"}}>
          {JSON.stringify(error)}
        </Text>
      )
    }
  }

  return (
    <View style={(styles.container, styles.frame)}>
      {/* <PrimerCardNumberEditText style={{width: 300, height: 50, backgroundColor: 'red'}} /> */}
      {renderPaymentMethods()}
      {renderResponse()}
      {renderError()}
    </View>
  );
};
