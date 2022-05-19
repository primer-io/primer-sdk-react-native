import React, { useEffect, useRef, useState } from 'react';
import { HeadlessUniversalCheckout } from '@primer-io/react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import type { PrimerSettings } from 'src/models/primer-settings';
import { createClientSession, createPayment, resumePayment } from '../api/api';
import type { PrimerHeadlessUniversalCheckoutCallbacks } from 'src/headless_checkout/types';

export const HeadlessCheckoutScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(
    undefined
  );
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  // const [paymentId, setPaymentId] = useState<undefined | string>(undefined);
  const [error, setError] = useState<null | any>(null);

  const getLogo = async (identifier: string) => {
    try {
      const assetUrl = await HeadlessUniversalCheckout.getAssetForPaymentMethod(
        identifier,
        'logo'
      );
      setLocalImageUrl(assetUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const paymentId = useRef('');

  useEffect(() => {
    const settings: PrimerSettings &
      PrimerHeadlessUniversalCheckoutCallbacks = {
      options: {
        ios: {
          merchantIdentifier: 'merchant.checkout.team',
        },
      },
      business: {
        name: "Business Name"
      },
      onPreparationStarted: () => {
        console.log(`merchant app | onPreparationStarted`);
      },
      onTokenizeStart: () => {
        console.log(`merchant app | onTokenizeStart`);
      },
      onTokenizeSuccess: async (paymentMethodInstrument) => {
        console.log(`merchant app | onTokenizeSuccess`);
        try {
          const response = await createPayment(paymentMethodInstrument.token);
          console.log(JSON.stringify(response));
          if (
            response.id &&
            response.requiredAction &&
            response.requiredAction.clientToken
          ) {
            paymentId.current = response.id;
            HeadlessUniversalCheckout.resumeWithClientToken(
              response.requiredAction.clientToken
            );
          }
        } catch (error) {
          console.error(error);
          setError(error);
        }
      },
      onPaymentMethodPresented: () => {
        console.log(`merchant app | onPaymentMethodPresented`);
      },
      onResumeSuccess: async (resumeToken) => {
        console.log(`merchant app | onResumeSuccess`);

        try {
          if (paymentId.current) {
            const response = await resumePayment(
              paymentId.current,
              resumeToken
            );
            setPaymentResponse(response);
          } else {
            const err = new Error('Missing payment id');
            throw err;
          }
        } catch (err) {
          console.error(err);
          setError(err);
        }
      },
      onFailure: (err) => {
        console.log(`merchant app | onFailure`);
      },
    };

    createClientSession().then((session) => {
      setIsLoading(false);
      HeadlessUniversalCheckout.startWithClientToken(
        session.clientToken,
        settings
      )
        .then((response) => {
          console.log(
            `Available payment methods: ${JSON.stringify(
              response.paymentMethodTypes
            )}`
          );
          setPaymentMethods(response.paymentMethodTypes);
        })
        .catch((err) => {
          console.error(err);
          setError(err);
        });
    });

    getLogo('GOOGLE_PAY')
      .then(() => {})
      .catch((err) => {});
  }, []);

  const payWithPaymentMethod = (paymentMethod: string) => {
    const settings: PrimerSettings &
      PrimerHeadlessUniversalCheckoutCallbacks = {
      options: {
        ios: {
          merchantIdentifier: 'merchant.checkout.team',
        },
      },
      business: {
        name: "Business Name"
      },
      onPreparationStarted: () => {
        console.log(`merchant app | onPreparationStarted`);
      },
      onTokenizeStart: () => {
        console.log(`merchant app | onTokenizeStart`);
      },
      onTokenizeSuccess: async (paymentMethodInstrument) => {
        console.log(`merchant app | onTokenizeSuccess`);
        try {
          const response = await createPayment(paymentMethodInstrument.token);
          console.log(JSON.stringify(response));
          if (
            response.id &&
            response.requiredAction &&
            response.requiredAction.clientToken
          ) {
            paymentId.current = response.id;
            HeadlessUniversalCheckout.resumeWithClientToken(
              response.requiredAction.clientToken
            );
          }
        } catch (error) {
          console.error(error);
          setError(error);
        }
      },
      onPaymentMethodPresented: () => {
        console.log(`merchant app | onPaymentMethodPresented`);
      },
      onResumeSuccess: async (resumeToken) => {
        console.log(`merchant app | onResumeSuccess`);

        try {
          if (paymentId.current) {
            const response = await resumePayment(
              paymentId.current,
              resumeToken
            );
            setPaymentResponse(response);
          } else {
            const err = new Error('Missing payment id');
            throw err;
          }
        } catch (err) {
          console.error(err);
          setError(err);
        }
      },
      onFailure: (err) => {
        console.log(`merchant app | onFailure`);
      },
    };

    createClientSession().then((session) => {
      setIsLoading(false);
      HeadlessUniversalCheckout.startWithClientToken(
        session.clientToken,
        settings
      )
        .then((response) => {
          HeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
        })
        .catch((err) => {
          console.error(err);
          setError(err);
        });
    });
  };

  const renderPaymentMethods = () => {
    if (!paymentMethods) {
      return null;
    } else {
      return (
        <View>
          {paymentMethods.map((pm) => {
            return (
              <TouchableOpacity
                key={pm}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 4,
                  height: 50,
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                }}
                onPress={() => {
                  payWithPaymentMethod(pm);
                }}
              >
                <Text style={{ color: 'white' }}>{pm}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
  };

  const renderResponse = () => {
    if (!paymentResponse) {
      return null;
    } else {
      return (
        <Text style={{ color: 'black' }}>
          {JSON.stringify(paymentResponse)}
        </Text>
      );
    }
  };

  const renderTestImage = () => {
    if (!localImageUrl) {
      return null;
    } else {
      return (
        <Image
          style={{ width: 300, height: 150 }}
          source={{ uri: localImageUrl }}
        />
      );
    }
  };

  const renderError = () => {
    if (!error) {
      return null;
    } else {
      return <Text style={{ color: 'red' }}>{JSON.stringify(error)}</Text>;
    }
  };

  return (
    <View style={(styles.container, styles.frame)}>
      {/* <PrimerCardNumberEditText style={{width: 300, height: 50, backgroundColor: 'red'}} /> */}
      {renderPaymentMethods()}
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
    </View>
  );
};
