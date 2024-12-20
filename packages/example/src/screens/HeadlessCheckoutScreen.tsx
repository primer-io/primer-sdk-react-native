import React, { useEffect, useState } from 'react';
import { Alert, Image, TouchableOpacity, View } from 'react-native';
import {
  createClientSession,
  createPayment,
  resumePayment,
} from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';
import {
  AssetsManager,
  CheckoutAdditionalInfo,
  CheckoutData,
  HeadlessUniversalCheckout,
  NativeResourceView,
  NativeUIManager,
  PaymentMethod,
  PrimerSettings,
  Resource,
  SessionIntent
} from '@primer-io/react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { showAchMandateAlert } from './AchMandateAlert';
import { STRIPE_ACH_PUBLISHABLE_KEY } from '../Keys';
import { PrimerPaymentMethodAsset } from '@primer-io/react-native/lib/typescript/models/PrimerPaymentMethodResource';

let log: string = '';
let merchantPaymentId: string | null = null;
let merchantCheckoutData: CheckoutData | null = null;
let merchantCheckoutAdditionalInfo: CheckoutAdditionalInfo | null = null;
let merchantPayment: IPayment | null = null;
let merchantPrimerError: Error | unknown | null = null;

const selectImplementationType = (paymentMethod: PaymentMethod): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buttons: any[] = [];

    paymentMethod.paymentMethodManagerCategories.forEach(category => {
      buttons.push({
        text: category,
        style: 'default',
        onPress: () => {
          resolve(category);
        },
      });
    });

    buttons.push({
      text: 'Cancel',
      style: 'cancel',
      onPress: () => {
        const err = new Error('Operation cancelled');
        reject(err);
      },
    });

    Alert.alert('', 'Select implementation to test', buttons, {
      cancelable: true,
    });
  });
};

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSession, setClientSession] = useState<null | any>(null);
  const [paymentMethods, setPaymentMethods] = useState<undefined | PaymentMethod[]>(undefined);
  const [paymentMethodsResources, setPaymentMethodsResources] = useState<undefined | Resource[]>(undefined);
  const [selectedSessionIntent, setSelectedSessionIntent] = useState<SessionIntent>(SessionIntent.CHECKOUT);

  const updateLogs = (str: string) => {
    console.log(str);
    const currentLog = log;
    const combinedLog = currentLog + '\n' + str;
    log = combinedLog;
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
          merchantName: "My Merchant Name"
        }
      },
      googlePayOptions: {
        isCaptureBillingAddressEnabled: true,
        isExistingPaymentMethodRequired: false,
        shippingAddressParameters: { phoneNumberRequired: true },
        requireShippingMethod: false,
        emailAddressRequired: true
      },
    },
    debugOptions: {
      is3DSSanityCheckEnabled: false
    },
    clientSessionCachingEnabled: true,
    headlessUniversalCheckoutCallbacks: {
      onAvailablePaymentMethodsLoad: availablePaymentMethods => {
        updateLogs(
          `\nℹ️ onAvailablePaymentMethodsLoad\n${JSON.stringify(
            availablePaymentMethods,
            null,
            2,
          )}\n`,
        );
        setIsLoading(false);
      },
      onPreparationStart: paymentMethodType => {
        updateLogs(
          `\nℹ️ onPreparationStart\npaymentMethodType: ${paymentMethodType}\n`,
        );
      },
      onPaymentMethodShow: paymentMethodType => {
        updateLogs(
          `\nℹ️ onPaymentMethodShow\npaymentMethodType: ${paymentMethodType}\n`,
        );
      },
      onTokenizationStart: paymentMethodType => {
        updateLogs(
          `\nℹ️ onTokenizationStart\npaymentMethodType: ${paymentMethodType}\n`,
        );
      },
      onBeforeClientSessionUpdate: () => {
        updateLogs(`\nℹ️ onBeforeClientSessionUpdate\n`);
      },
      onClientSessionUpdate: clientSession => {
        updateLogs(
          `\nℹ️ onClientSessionUpdate\nclientSession: ${JSON.stringify(
            clientSession,
            null,
            2,
          )}\n`,
        );
      },
      onBeforePaymentCreate: (tmpCheckoutData, handler) => {
        updateLogs(
          `\nℹ️ onBeforePaymentCreate\ncheckoutData: ${JSON.stringify(
            tmpCheckoutData,
            null,
            2,
          )}\n`,
        );
        handler.continuePaymentCreation();
      },
      onCheckoutAdditionalInfo: additionalInfo => {
        merchantCheckoutAdditionalInfo = additionalInfo;
        updateLogs(
          `\nℹ️ onCheckoutPending\nadditionalInfo: ${JSON.stringify(
            additionalInfo,
            null,
            2,
          )}\n`,
        );
        setIsLoading(false);
        switch (merchantCheckoutAdditionalInfo.additionalInfoName) {
          case "DisplayStripeAchMandateAdditionalInfo":
            showAchMandateAlert();
            break;
        }
      },
      onCheckoutComplete: checkoutData => {
        merchantCheckoutData = checkoutData;
        updateLogs(
          `\n✅ onCheckoutComplete\ncheckoutData: ${JSON.stringify(
            checkoutData,
            null,
            2,
          )}\n`,
        );
        setIsLoading(false);
        navigateToResultScreen();
      },
      onCheckoutPending: checkoutAdditionalInfo => {
        merchantCheckoutAdditionalInfo = checkoutAdditionalInfo;
        updateLogs(
          `\n✅ onCheckoutPending\nadditionalInfo: ${JSON.stringify(
            checkoutAdditionalInfo,
            null,
            2,
          )}\n`,
        );
        setIsLoading(false);
        navigateToResultScreen();
      },
      onTokenizationSuccess: async (paymentMethodTokenData, handler) => {
        updateLogs(
          `\nℹ️ onTokenizationSuccess\npaymentMethodTokenData: ${JSON.stringify(
            paymentMethodTokenData,
            null,
            2,
          )}\n`,
        );
        setIsLoading(false);

        try {
          const payment: IPayment = await createPayment(
            paymentMethodTokenData.token,
          );
          merchantPayment = payment;

          if (payment.requiredAction && payment.requiredAction.clientToken) {
            merchantPaymentId = payment.id;

            if (payment.requiredAction.name === '3DS_AUTHENTICATION') {
              updateLogs(
                '\n⚠️ Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.',
              );
            }

            handler.continueWithNewClientToken(
              payment.requiredAction.clientToken,
            );
          } else {
            setIsLoading(false);
            handler.complete();
            navigateToResultScreen();
          }
        } catch (err) {
          merchantPrimerError = err;
          updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
          setIsLoading(false);
          handler.complete();

          console.error(err);
          navigateToResultScreen();
        }
      },
      onCheckoutResume: async (resumeToken, handler) => {
        updateLogs(`\nℹ️ onCheckoutResume\nresumeToken: ${resumeToken}`);

        try {
          if (merchantPaymentId) {
            const payment: IPayment = await resumePayment(
              merchantPaymentId,
              resumeToken,
            );
            merchantPayment = payment;
            handler.complete();
            updateLogs(
              `\n✅ Payment resumed\npayment: ${JSON.stringify(
                payment,
                null,
                2,
              )}`,
            );
            setIsLoading(false);
            navigateToResultScreen();
            merchantPaymentId = null;
          } else {
            const err = new Error('Invalid value for paymentId');
            throw err;
          }
        } catch (err) {
          console.error(err);
          handler.complete();
          updateLogs(
            `\n🛑 Payment resume\nerror: ${JSON.stringify(err, null, 2)}`,
          );
          setIsLoading(false);

          merchantPaymentId = null;
          navigateToResultScreen();
        }
      },
      onError: (err, checkoutData) => {
        merchantCheckoutData = checkoutData;
        merchantPrimerError = err;
        updateLogs(`\n🛑 onError\nerror: ${JSON.stringify(err, null, 2)}`);
        console.error(err);
        setIsLoading(false);
        navigateToResultScreen();
      },
    },
  };

  if (appPaymentParameters.merchantName) {
    //@ts-ignore
    settings.paymentMethodOptions.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName,
    };
  }

  useEffect(() => {
    createClientSessionIfNeeded()
      .then(session => {
        setIsLoading(false);
        startHUC(session.clientToken);
      })
      .catch(err => {
        setIsLoading(false);
        console.error(err);
      });
  }, []);

  const createClientSessionIfNeeded = (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (clientSession === null) {
          const newClientSession = await createClientSession();
          setClientSession(newClientSession);
          resolve(newClientSession);
        } else {
          resolve(clientSession);
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  const navigateToResultScreen = async () => {
    try {
      props.navigation.navigate('Result', {
        merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
        merchantCheckoutData: merchantCheckoutData,
        merchantPayment: merchantPayment,
        merchantPrimerError: merchantPrimerError,
        logs: log,
      });

      setClientSession(null);
      setIsLoading(true);
      await createClientSessionIfNeeded();
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  };

  const startHUC = async (clientToken: string) => {
    try {
      const availablePaymentMethods =
        await HeadlessUniversalCheckout.startWithClientToken(
          clientToken,
          settings,
        );
      setPaymentMethods(availablePaymentMethods);
      // updateLogs(`\nℹ️ Available payment methods:\n${JSON.stringify(availablePaymentMethods, null, 2)}`);
      const assetsManager = new AssetsManager();
      const resources = await assetsManager.getPaymentMethodResources();
      setPaymentMethodsResources(resources);
    } catch (err) {
      console.error(err);
    }
  };

  const paymentMethodButtonTapped = async (paymentMethodType: string) => {
    console.log(paymentMethodType);

    try {
      const paymentMethod = paymentMethods?.find(
        pm => pm.paymentMethodType === paymentMethodType,
      );

      if (!paymentMethod) {
        return;
      }

      if (paymentMethod.paymentMethodManagerCategories.length === 1) {
        pay(paymentMethod, paymentMethod.paymentMethodManagerCategories[0]);
      } else {
        const selectedImplementationType = await selectImplementationType(paymentMethod);
        pay(paymentMethod, selectedImplementationType);
      }
    } catch (err) {
      updateLogs(
        `\n🛑 paymentMethodButtonTapped\nerror: ${JSON.stringify(
          err,
          null,
          2,
        )}`,
      );
      console.error(err);
    }
  };

  const pay = async (
    paymentMethod: PaymentMethod,
    implementationType: string,
  ) => {
    console.log(paymentMethod, implementationType);
    try {
      if (implementationType === 'NATIVE_UI') {
        setIsLoading(true);
        await createClientSessionIfNeeded();
        const nativeUIManager = new NativeUIManager();
        await nativeUIManager.configure(paymentMethod.paymentMethodType);
        console.log("Payment session intent is " + selectedSessionIntent)
        await nativeUIManager.showPaymentMethod(SessionIntent.CHECKOUT);
      } else if (implementationType === 'COMPONENT_WITH_REDIRECT') {
        await createClientSessionIfNeeded();

        if (paymentMethod.paymentMethodType === 'ADYEN_IDEAL') {
          props.navigation.navigate('HeadlessCheckoutWithRedirect', {
            paymentMethodType: paymentMethod.paymentMethodType,
          });
        }
      } else if (implementationType === 'RAW_DATA') {
        await createClientSessionIfNeeded();

        if (
          paymentMethod.paymentMethodType === 'XENDIT_OVO' ||
          paymentMethod.paymentMethodType === 'ADYEN_MBWAY'
        ) {
          props.navigation.navigate('RawPhoneNumberData', {
            paymentMethodType: paymentMethod.paymentMethodType,
          });
        } else if (
          paymentMethod.paymentMethodType === 'XENDIT_RETAIL_OUTLETS'
        ) {
          props.navigation.navigate('RawRetailOutlet', {
            paymentMethodType: paymentMethod.paymentMethodType,
          });
        } else if (
          paymentMethod.paymentMethodType === 'ADYEN_BANCONTACT_CARD'
        ) {
          props.navigation.navigate('RawAdyenBancontactCard', {
            paymentMethodType: paymentMethod.paymentMethodType,
          });
        } else if (paymentMethod.paymentMethodType === 'PAYMENT_CARD') {
          props.navigation.navigate('RawCardData', {
            paymentMethodType: paymentMethod.paymentMethodType,
          });
        }
      } else if (implementationType === "STRIPE_ACH" && paymentMethod.paymentMethodType === "STRIPE_ACH") {
        props.navigation.navigate('HeadlessCheckoutStripeAchScreen');
      } else if (implementationType === "KLARNA" && paymentMethod.paymentMethodType === "KLARNA") {
        props.navigation.navigate('Klarna', { paymentSessionIntent: selectedSessionIntent });
      } 
      else {
        Alert.alert(
          'Warning!',
          `${implementationType} is not supported on Headless Universal Checkout yet.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => { },
            },
          ],
          {
            cancelable: true,
          },
        );
      }
    } catch (err) {
      updateLogs(`\n🛑 pay\nerror: ${JSON.stringify(err, null, 2)}`);
      setIsLoading(false);
      console.error(err);
    }
  };

  const renderSessionIntentSegmentedControl = () => {
    const values = [SessionIntent.CHECKOUT, SessionIntent.VAULT]
    return (
      <View style={{
        marginVertical: 20,
      }}>
        <SegmentedControl
          values={values}
          selectedIndex={values.indexOf(selectedSessionIntent)}
          onChange={(event) => {
            const selectedIndex = event.nativeEvent.selectedSegmentIndex;
            setSelectedSessionIntent(values[selectedIndex]);
          }}
        />
      </View>
    );
  };

  const renderPaymentMethodsUI = () => {
    if (!paymentMethodsResources) {
      return null;
    }
    return (
      <View>
        {paymentMethodsResources.map(paymentMethodResource => {
          const testId = `button-${paymentMethodResource.paymentMethodType
            .toLowerCase()
            .replace('_', '-')}`
          const isNativeView = typeof paymentMethodResource.nativeViewName === "string";
          return isNativeView ? (
            <TouchableOpacity
              testID={testId}
              key={paymentMethodResource.paymentMethodType}>
              <NativeResourceView
                onPress={() => {
                  paymentMethodButtonTapped(
                    paymentMethodResource.paymentMethodType,
                  );
                }}
                nativeViewName={paymentMethodResource.nativeViewName!}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={paymentMethodResource.paymentMethodType}
              style={{
                marginHorizontal: 20,
                marginVertical: 8,
                height: 50,
                backgroundColor:
                  (paymentMethodResource as PrimerPaymentMethodAsset).paymentMethodBackgroundColor.colored ||
                  (paymentMethodResource as PrimerPaymentMethodAsset).paymentMethodBackgroundColor.light,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 4,
              }}
              onPress={() => {
                paymentMethodButtonTapped(
                  paymentMethodResource.paymentMethodType,
                );
              }}
              testID={testId}>
              <Image
                style={{ height: 36, width: '100%', resizeMode: 'contain' }}
                source={{
                  uri:
                    (paymentMethodResource as PrimerPaymentMethodAsset).paymentMethodLogo.colored ||
                    (paymentMethodResource as PrimerPaymentMethodAsset).paymentMethodLogo.light,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderLoadingOverlay = () => {
    if (!isLoading) {
      return null;
    } else {
      return (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(200, 200, 200, 0.5)',
            zIndex: 1000,
          }}>
          <ActivityIndicator size="small" />
        </View>
      );
    }
  };

  return (
    <View style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderSessionIntentSegmentedControl()}
      {renderPaymentMethodsUI()}
      {renderLoadingOverlay()}
    </View>
  );
};
