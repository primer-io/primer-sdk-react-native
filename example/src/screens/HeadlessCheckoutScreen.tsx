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
import {
  HeadlessUniversalCheckout,
  PrimerSettings,
  SessionIntent,
  PaymentMethod,
  Asset,
  AssetsManager,
  NativeUIManager
} from '@primer-io/react-native';

let paymentId: string | null = null;
let logs: string = "";

// @ts-ignore
export const HeadlessCheckoutScreen = ({ navigation }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [clientSession, setClientSession] = useState<any | undefined>(undefined);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[] | undefined>(undefined);
  const [assets, setAssets] = useState<Asset[] | undefined>(undefined);
  const [tmpLogs, setTmpLogs] = useState<string>("");

  const updateLogs = (str: string) => {
    const currentLog = logs || '';
    logs = currentLog + '\n' + str;
    console.log(logs);
    setTmpLogs(logs);
  }

  useEffect(() => {
    createClientSession()
      .then(session => {
        setClientSession(session);

        startHeadlessUniversalCheckout(session.clientToken)
          .then(() => {

          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      })
  }, []);

  const startHeadlessUniversalCheckout = async (clientToken: string): Promise<void> => {
    const settings: PrimerSettings = {
      paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
      paymentMethodOptions: {
        iOS: {
          urlScheme: 'merchant://primer.io'
        },
      },
      headlessUniversalCheckoutCallbacks: {
        onAvailablePaymentMethodsLoad: (availablePaymentMethods) => {
          updateLogs(`\nℹ️ onAvailablePaymentMethodsLoad: ${JSON.stringify(availablePaymentMethods, null, 2)}`);
        },
        onBeforeClientSessionUpdate: () => {
          updateLogs(`\nℹ️ onBeforeClientSessionUpdate`);
        },
        onClientSessionUpdate: (clientSession) => {
          updateLogs(`\nℹ️ onClientSessionUpdate: ${JSON.stringify(clientSession, null, 2)}`);
        },
        onBeforePaymentCreate: (checkoutPaymentData, handler) => {
          updateLogs(`\nℹ️ onBeforePaymentCreate: ${JSON.stringify(checkoutPaymentData, null, 2)}`);
          handler.continuePaymentCreation();
        },
        onTokenizationStart: (paymentMethodType) => {
          updateLogs(`\nℹ️ onTokenizationStart: ${paymentMethodType}`);
        },
        onTokenizationSuccess: async (paymentMethodTokenData, handler) => {
          updateLogs(`\n✅ onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData, null, 2)}`);
          setClientSession(undefined);

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
              setIsLoading(false);
              handler.complete();
            }

          } catch (err) {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
            console.error(err);
            setIsLoading(false);
            handler.complete();
          }
        },
        onCheckoutResume: async (resumeToken, handler) => {
          updateLogs(`\n✅ onCheckoutResume: ${JSON.stringify(resumeToken)}`);
          setClientSession(undefined);

          try {
            if (paymentId) {
              const payment: IPayment = await resumePayment(paymentId, resumeToken);
              setIsLoading(false);

            } else {
              const err = new Error("Invalid value for paymentId");
              throw err;
            }
            paymentId = null;
            handler.complete();

          } catch (err) {
            console.error(err);
            paymentId = null;
            setIsLoading(false);
            handler.complete();
          }
        },
        onCheckoutAdditionalInfo: (additionalInfo) => {
          updateLogs(`\nℹ️ onCheckoutAdditionalInfo: ${JSON.stringify(additionalInfo, null, 2)}`);
        },
        onCheckoutPending: (additionalInfo) => {
          updateLogs(`\nℹ️ onCheckoutPending: ${JSON.stringify(additionalInfo, null, 2)}`);
        },
        onCheckoutComplete: (checkoutData) => {
          updateLogs(`\nℹ️ onCheckoutComplete: ${JSON.stringify(checkoutData, null, 2)}`);
          setClientSession(undefined);
        },
        onError: (error, checkoutData) => {
          updateLogs(`\n🛑 onError: ${JSON.stringify(error, null, 2)} ${JSON.stringify(checkoutData, null, 2)}`);
        },
        onPreparationStart: (paymentMethodType) => {
          updateLogs(`\nℹ️ onPreparationStart: ${paymentMethodType}`);
        },
        onPaymentMethodShow: (paymentMethodType) => {
          updateLogs(`\nℹ️ onPaymentMethodShow: ${paymentMethodType}`);
        },
      }
    };

    if (appPaymentParameters.merchantName) {
      //@ts-ignore
      settings.paymentMethodOptions.applePayOptions = {
        merchantIdentifier: 'merchant.checkout.team',
        merchantName: appPaymentParameters.merchantName
      }
    }

    const availablePaymentMethods = await HeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
    setAvailablePaymentMethods(availablePaymentMethods);
    getPaymentMethodAssets();
  }

  const getPaymentMethodAssets = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const assetsManager = new AssetsManager();
        const assets: Asset[] = await assetsManager.getPaymentMethodAssets();
        updateLogs(`\nℹ️ getPaymentMethodAssets: ${JSON.stringify(assets, null, 2)}`);
        setAssets(assets);
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  const payWithPaymentMethod = async (paymentMethodType: string) => {
    try {
      if (!clientSession) {
        const session = await createClientSession();
        setClientSession(session);
      }

      const paymentMethod = availablePaymentMethods?.find(pm => pm.paymentMethodType === paymentMethodType);

      if (paymentMethod) {
        if (paymentMethod.paymentMethodManagerCategories.includes("NATIVE_UI") && paymentMethod.supportedPrimerSessionIntents.includes("CHECKOUT")) {
          const nativeUIManager = new NativeUIManager();
          await nativeUIManager.initialize(paymentMethod.paymentMethodType);
          await nativeUIManager.showPaymentMethod(SessionIntent.CHECKOUT);
          return;
        }
      }

      const err = new Error("Failed to create manager");
      throw err

    } catch (err) {
      console.error(err);
    }
  };

  const renderPaymentMethods = () => {
    if (!assets) {
      return null;
    } else {
      return (
        <View style={{flex: 1}}>
          {
            assets.map(a => {
              if (a.paymentMethodType === "PAYMENT_CARD") {
                return (
                  <TouchableOpacity
                    key={a.paymentMethodType}
                    style={{
                      marginVertical: 4,
                      height: 40,
                      backgroundColor: a.paymentMethodBackgroundColor.colored || a.paymentMethodBackgroundColor.light,
                      borderRadius: 4,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                    onPress={e => {
                      navigation.navigate('RawCardData', { clientSession: clientSession });
                    }}
                  >
                    <Text>
                      Pay with card
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={a.paymentMethodType}
                    style={{
                      marginVertical: 4,
                      height: 40,
                      backgroundColor: a.paymentMethodBackgroundColor.colored || a.paymentMethodBackgroundColor.light,
                      borderRadius: 4,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                    onPress={e => {
                      payWithPaymentMethod(a.paymentMethodType);
                    }}
                  >
                    <Image
                      style={{ marginVertical: 5, height: 30, width: "100%", resizeMode: "contain" }}
                      source={{ uri: a.paymentMethodLogo.colored }}
                    />
                  </TouchableOpacity>
                );
              }
            })
          }
        </View>
      )
    }
  };

  const renderLogBox = () => {
    return (
      <ScrollView style={{flex: 1, backgroundColor: "lightgray", marginBottom: 30}}>
        <Text>
          {tmpLogs}
        </Text>
      </ScrollView>
    );
  }

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
      {renderLogBox()}
      {renderLoadingOverlay()}
    </View>
  );
};
