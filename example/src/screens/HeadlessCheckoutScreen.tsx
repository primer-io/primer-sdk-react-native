import React, { useEffect, useState } from 'react';
import {
  PrimerHUC
} from '@primer-io/react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import type { PrimerSettings } from 'src/models/primer-settings';
import { createClientSession, createPayment, resumePayment } from '../api/api';

const huc = new PrimerHUC();

export const HeadlessCheckoutScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(undefined);
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  const [paymentId, setPaymentId] = useState<undefined | string>(undefined);
  const [error, setError] = useState<null | any>(null);

  huc.listAvailableAssets((assets) => {
    console.log(`Available assets: ${JSON.stringify(assets)}`);
  });

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

    createClientSession().then((session) => {
      setIsLoading(false);

      huc.startHeadlessCheckout(session.clientToken, 
        settings,
        (err) => {
          setError(err);
          console.error(err);
        },
        (response) => {
          setPaymentMethods(response.paymentMethodTypes);
          console.log(`Available payment methods: ${JSON.stringify(response.paymentMethodTypes)}`);
        });
    });
  }, []);

  huc.onTokenizeSuccess = async (paymentMethodToken) => {
    try {
      const response = await createPayment(paymentMethodToken.token);
      console.log(JSON.stringify(response));
      if (response.id && response.requiredAction && response.requiredAction.clientToken) {
        setPaymentId(response.id);
        huc.resumeWithToken(response.requiredAction.clientToken);
      }
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  huc.onResume = async (resumeToken) => {
    try {
      const response = await resumePayment(paymentId, resumeToken);
      setPaymentResponse(response);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  const payWithPaymentMethod = (paymentMethod: string) => {
    huc.showPaymentMethod(paymentMethod);
  }

  const renderPaymentMethods = () => {
    if (!paymentMethods) {
      return null;
    } else {
      return (
        <View>
          {
            paymentMethods.map(pm => {
              return (
                <TouchableOpacity
                  key={pm}
                  style={{
                    marginHorizontal: 20, 
                    marginVertical: 4,
                    height: 50, 
                    backgroundColor: 'black', 
                    justifyContent: 'center', 
                    alignItems: "center",
                    borderRadius: 4
                  }}
                  onPress={() => {
                    payWithPaymentMethod(pm);
                  }}
                >
                  <Text style={{color: "white"}}>{pm}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
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