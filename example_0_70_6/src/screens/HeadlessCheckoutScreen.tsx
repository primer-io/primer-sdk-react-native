import React, { useEffect, useState } from 'react';

import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';
import { PrimerCheckoutData, PrimerClientSession, PrimerError, PrimerErrorHandler, HeadlessUniversalCheckout, PrimerPaymentMethodTokenData, PrimerResumeHandler, PrimerSettings, PrimerTokenizationHandler, PrimerCheckoutAdditionalInfo } from '@primer-io/react-native';

let paymentId: string | null = null;
let log: string | undefined;

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(undefined);
  //@ts-ignore
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  const [clearLogs, setClearLogs] = useState<boolean>(false);
  const [error, setError] = useState<null | any>(null);

  const updateLogs = (str: string) => {
    const currentLog = log || '';
    const combinedLog = currentLog + '\n' + str;
    log = combinedLog;
  }

  //@ts-ignore
  const getLogo = async (identifier: string) => {
    try {
      const assetUrl = await HeadlessUniversalCheckout.getAssetForPaymentMethodType(
        identifier,
        'logo'
      );
      setLocalImageUrl(assetUrl);
    } catch (err) {
      updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
    }
  };

  const onPrepareStart = (paymentMethodType: string) => {
    updateLogs(`\nℹ️ HUC started preparing for ${paymentMethodType}`);
    setIsLoading(true);
  };

  const onPaymentMethodShow = (paymentMethodType: string) => {
    updateLogs(`\nℹ️ HUC showed ${paymentMethodType}`);
    setIsLoading(true);
  };

  const onTokenizeStart = (paymentMethodType: string) => {
    updateLogs(`\nℹ️ HUC started tokenization for ${paymentMethodType}`);
    setIsLoading(true);
  };

  const onAvailablePaymentMethodsLoad = (paymentMethodTypes: string[]) => {
    updateLogs(`\nℹ️ HUC did set up client session for payment methods ${JSON.stringify(paymentMethodTypes)}`);
    setIsLoading(false);
  };

  const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
    updateLogs(`\n✅ PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
    debugger;
    setIsLoading(false);
    props.navigation.navigate('Result', checkoutData);
  };

  const onResumePending = (additionalInfo: PrimerCheckoutAdditionalInfo) => {
    updateLogs(`\n✅ PrimerCheckoutAdditionalInfo:\n${JSON.stringify(additionalInfo)}`);
    debugger;
    setIsLoading(false);
    props.navigation.navigate('Result', additionalInfo);
  };

  const onCheckoutReceivedAdditionalInfo = (additionalInfo: PrimerCheckoutAdditionalInfo) => {
    updateLogs(`\n✅ PrimerCheckoutAdditionalInfo:\n${JSON.stringify(additionalInfo)}`);
    debugger;
    setIsLoading(false);
    props.navigation.navigate('Result', additionalInfo);
  };

  const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => {
    updateLogs(`\n✅ onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData, null, 2)}`);

    try {
      const payment: IPayment = await createPayment(paymentMethodTokenData.token);

      if (payment.requiredAction && payment.requiredAction.clientToken) {
        paymentId = payment.id;

        if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
          updateLogs("\n🛑 Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
        }
        paymentId = payment.id;
        handler.continueWithNewClientToken(payment.requiredAction.clientToken);
      } else {
        props.navigation.navigate('Result', payment);
        setIsLoading(false);
      }
    } catch (err) {
      updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
      console.error(err);
      setIsLoading(false);
      props.navigation.navigate('Result', err);
    }
  }

  //@ts-ignore
  const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
    updateLogs(`\n✅ onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

    try {
      if (paymentId) {
        const payment: IPayment = await resumePayment(paymentId, resumeToken);
        props.navigation.navigate('Result', payment);
        setIsLoading(false);

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
    }
  }

  const onError = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => {
    updateLogs(`\n🛑 HUC failed with error:\n\n${JSON.stringify(error, null, 2)}\n\ncheckoutData:\n${JSON.stringify(checkoutData, null, 2)}`);
    console.error(error);
    handler?.showErrorMessage("My RN message");
    setIsLoading(false);
  };

  const onBeforeClientSessionUpdate = () => {
    updateLogs(`\nℹ️ onBeforeClientSessionUpdate`);
  };

  //@ts-ignore
  const onClientSessionUpdate = (clientSession: PrimerClientSession) => {
    updateLogs(`\nℹ️ onClientSessionUpdate`);
  }

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
    },
    onAvailablePaymentMethodsLoad: onAvailablePaymentMethodsLoad,
    onPrepareStart: onPrepareStart,
    onBeforeClientSessionUpdate: onBeforeClientSessionUpdate,
    onClientSessionUpdate: onClientSessionUpdate,
    onPaymentMethodShow: onPaymentMethodShow,
    //@ts-ignore
    onBeforePaymentCreate: (checkoutPaymentMethodData, handler) => {
      updateLogs(`\nℹ️ onBeforePaymentCreate`);
      handler.continuePaymentCreation();
    },
    onTokenizeStart: onTokenizeStart,
    onCheckoutComplete: onCheckoutComplete,
    onTokenizeSuccess: onTokenizeSuccess,
    onResumeSuccess: onResumeSuccess,
    onResumePending: onResumePending,
    onCheckoutReceivedAdditionalInfo: onCheckoutReceivedAdditionalInfo,
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
          .then((paymentMethodTypes) => {
            updateLogs(`\nℹ️ Available payment methods:\n${JSON.stringify(paymentMethodTypes, null, 2)}`);
            setPaymentMethods(paymentMethodTypes);
          })
          .catch((err) => {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
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
          //@ts-ignore
          .then((response) => {
            HeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
          })
          .catch((err) => {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
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
      </View>
    }
  };

  return (
    <View style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderPaymentMethods()}
      <TouchableOpacity
        key={'clear-logs'}
        style={{
          marginHorizontal: 20,
          marginVertical: 4,
          height: 50,
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: 'black',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
        }}
        onPress={() => {
          log = undefined;
          setClearLogs(!clearLogs);
        }}
      >
        <Text style={{ color: 'black' }}>Clear Logs</Text>
      </TouchableOpacity>
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
      <ScrollView
        key={`${clearLogs}`}
        style={{ backgroundColor: 'lightgrey', marginVertical: 10, marginBottom: 40 }}
      >
        <Text>
          {log}
        </Text>
      </ScrollView>
      {renderLoadingOverlay()}
    </View>
  );
};
