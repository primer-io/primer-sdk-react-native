import React, { useEffect, useState } from 'react';
import {
  HeadlessUniversalCheckout,
  PrimerCheckoutData,
  PrimerError,
  PrimerErrorHandler,
  PrimerPaymentMethodTokenData,
  PrimerResumeHandler,
  PrimerSettings,
  PrimerTokenizationHandler
} from '@primer-io/react-native';
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { appPaymentParameters, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';

let paymentId: string | null = null;

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState<string | undefined>(undefined);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(undefined);
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
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

  const onHUCPrepareStart = (paymentMethod: string) => {
    console.log(`HUC started preparing for ${paymentMethod}`);
    setIsLoading(true);
    setLoadingMessage(`HUC started preparing payment with ${paymentMethod}`);
  };

  const onHUCPaymentMethodPresent = (paymentMethod: string) => {
    console.log(`HUC presented ${paymentMethod}`);
    setIsLoading(true);
    setLoadingMessage(`HUC presented ${paymentMethod}`);
  };

  const onHUCTokenizeStart = (paymentMethod: string) => {
    console.log(`HUC started tokenization for ${paymentMethod}`);
    setIsLoading(true);
    setLoadingMessage(`HUC started tokenizing ${paymentMethod}`);
  };

  const onHUCClientSessionSetup = (paymentMethods: string[]) => {
    console.log(`HUC did set up client session for payment methods ${JSON.stringify(paymentMethods)}`);
    setIsLoading(false);
    setLoadingMessage(`HUC did set up client session for payment methods ${JSON.stringify(paymentMethods)}`);
  };

  const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
    console.log(`PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
    setLoadingMessage(undefined);
    setIsLoading(false);
    props.navigation.navigate('Result', checkoutData);
  };

  const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => {
    console.log(`onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData)}`);

    try {
      const payment: IPayment = await createPayment(paymentMethodTokenData.token);

      if (payment.requiredAction && payment.requiredAction.clientToken) {
        paymentId = payment.id;

        if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
          console.warn("Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
        }
        paymentId = payment.id;
        handler.continueWithNewClientToken(payment.requiredAction.clientToken);
      } else {
        props.navigation.navigate('Result', payment);
        setIsLoading(false);
        setLoadingMessage(undefined);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setLoadingMessage(undefined);
      props.navigation.navigate('Result', err);
    }
  }

  const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
    console.log(`onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

    try {
      if (paymentId) {
        const payment: IPayment = await resumePayment(paymentId, resumeToken);
        props.navigation.navigate('Result', payment);
        setIsLoading(false);
        setLoadingMessage(undefined);

      } else {
        const err = new Error("Invalid value for paymentId");
        throw err;
      }
      paymentId = null;

    } catch (err) {
      console.error(err);
      paymentId = null;
      props.navigation.navigate('Result', err);
      setIsLoading(false);
      setLoadingMessage(undefined);
    }
  }

  const onError = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => {
    console.log(`HUC failed with error ${JSON.stringify(error)}`);
    console.error(error);
    handler?.showErrorMessage("My RN message");
    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
    },
    onCheckoutComplete: onCheckoutComplete,
    onTokenizeSuccess: onTokenizeSuccess,
    onResumeSuccess: onResumeSuccess,
    onHUCPrepareStart: onHUCPrepareStart,
    onHUCPaymentMethodPresent: onHUCPaymentMethodPresent,
    onHUCTokenizeStart: onHUCTokenizeStart,
    onHUCClientSessionSetup: onHUCClientSessionSetup,
    onError: onError
  };

  if (appPaymentParameters.merchantName) {
    //@ts-ignore
    settings.paymentMethodOptions.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName
    }
  }

  useEffect(() => {
    createClientSession()
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
          .then((response) => {
            console.log(`Available payment methods: ${JSON.stringify(response.paymentMethodTypes)}`);
            setPaymentMethods(response.paymentMethodTypes);
          })
          .catch((err) => {
            console.error(err);
            setError(err);
          });
      });

    // getLogo('GOOGLE_PAY')
    //   .then(() => {})
    //   .catch((err) => {});
  }, []);

  const payWithPaymentMethod = (paymentMethod: string) => {
    createClientSession()
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
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

  const renderLoadingOverlay = () => {
    if (!isLoading) {
      return null;
    } else {
      return <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        zIndex: 1000
      }}>
        <ActivityIndicator size='small' />
        <Text
          style={{
            fontSize: 14,
            color: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 24,
            marginTop: 8,
            marginBottom: 24
          }}
        >
          {loadingMessage}
        </Text>
      </View>
    }
  };

  return (
    <View style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderPaymentMethods()}
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
      {renderLoadingOverlay()}
    </View>
  );
};
