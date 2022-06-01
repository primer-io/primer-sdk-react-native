import React, { useEffect, useRef, useState } from 'react';
import { HeadlessUniversalCheckout } from '@primer-io/react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import type { PrimerSettings } from 'src/models/primer-settings';
import { createClientSession, createClientSessionRequestBody, createPayment, resumePayment } from '../network/api';
import type { PrimerHeadlessUniversalCheckoutCallbacks } from 'src/headless_checkout/types';
import type { IAppSettings } from '../models/IAppSettings';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';

export const HeadlessCheckoutScreen = (props: any) => {
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

  const appSettings: IAppSettings = props.route.params;
  const clientSessionRequestBody: IClientSessionRequestBody = createClientSessionRequestBody(
    appSettings.amount,
    appSettings.currencyCode,
    appSettings.countryCode,
    appSettings.customerId || null,
    appSettings.phoneNumber || null,
    false);

  const onTokenizeSuccess = async (paymentMethod: any) => {
    console.log(`Merchant HUC App | onTokenizeSuccess\npaymentMethod: ${JSON.stringify(paymentMethod)}`);
    try {
      const response = await createPayment(paymentMethod.token);
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
  };

  const onResumeSuccess = async (resumeToken: string) => {
    console.log(`Merchant HUC App | onResumeSuccess\nresumeToken: ${resumeToken}`);

    try {
      if (paymentId.current) {
        debugger;
        const response = await resumePayment(
          paymentId.current,
          resumeToken
        );
        debugger;
        setPaymentResponse(response);
      } else {
        debugger;
        const err = new Error('Missing payment id');
        throw err;
      }
    } catch (err) {
      debugger;
      console.error(err);
      setError(err);
    }
  };

  const onFailure = (err: any) => {
    console.error(err);
  };

  const settings: PrimerSettings & PrimerHeadlessUniversalCheckoutCallbacks = {
    options: {
      ios: {
        merchantIdentifier: 'merchant.checkout.team',
        urlScheme: 'primer://'
      },
    },
    business: {
      name: "Business Name"
    },
    onTokenizeSuccess: onTokenizeSuccess,
    onResumeSuccess: onResumeSuccess,
    onFailure: onFailure,
    onPreparationStarted: () => {
      console.log(`merchant app | onPreparationStarted`);
    },
    onTokenizeStart: () => {
      console.log(`merchant app | onTokenizeStart`);
    },
    onPaymentMethodPresented: () => {
      console.log(`merchant app | onPaymentMethodPresented`);
    },
  };

  const payWithPaymentMethod = async (paymentMethod: string) => {
    // Create a new client token in case the one stored has been used.
    try {
      setIsLoading(true);
      const clientSession = await createClientSession(clientSessionRequestBody);
      setIsLoading(false);

      await HeadlessUniversalCheckout.startWithClientToken(clientSession.clientToken, settings);
      await HeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
    } catch (err) {
      console.error(err);
    }
  };

  const paymentId = useRef('');

  useEffect(() => {
    createClientSession(clientSessionRequestBody)
      .then((session) => {
        setIsLoading(false);

        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
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
      .then(() => { })
      .catch((err) => { });
  }, []);

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
