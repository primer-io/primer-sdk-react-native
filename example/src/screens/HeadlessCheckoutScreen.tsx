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
import { styles } from '../styles';
import { createClientSession, createPayment, resumePayment } from '../network/API';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { clientSessionParams, paymentHandling } from './SettingsScreen';
import { getPaymentHandlingStringVal } from '../network/Environment';
import Spinner from 'react-native-loading-spinner-overlay';

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
    setIsLoading(true);
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

  const settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
      applePayOptions: {
        merchantIdentifier: 'merchant.checkout.team',
        merchantName: clientSessionParams.merchantName || 'Primer Merchant'
      }
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

  const clientSessionRequestBody: IClientSessionRequestBody = {

    paymentMethod: {
      ...clientSessionParams,
      //@ts-ignore
      merchantName: undefined,
      vaultOnSuccess: false,
      // options: {
      //     GOOGLE_PAY: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     ADYEN_IDEAL: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     ADYEN_SOFORT: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     APPLE_PAY: {
      //         surcharge: {
      //             amount: 150,
      //         },
      //     },
      //     PAYMENT_CARD: {
      //         networks: {
      //             VISA: {
      //                 surcharge: {
      //                     amount: 100,
      //                 },
      //             },
      //             MASTERCARD: {
      //                 surcharge: {
      //                     amount: 200,
      //                 },
      //             },
      //         },
      //     },
      // },
    },
  };

  useEffect(() => {
    createClientSession(clientSessionRequestBody)
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
    createClientSession(clientSessionRequestBody)
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

  return (
    <View style={(styles.sectionContainer)}>
      {/* <PrimerCardNumberEditText style={{width: 300, height: 50, backgroundColor: 'red'}} /> */}
      <Spinner
        visible={isLoading}
        textContent={loadingMessage}
        textStyle={{
          color: '#FFF'
        }}
      />
      {renderPaymentMethods()}
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
    </View>
  );
};
