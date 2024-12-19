import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';
import {
  CheckoutAdditionalInfo,
  CheckoutData,
  VaultManager,
  VaultedPaymentMethod,
  HeadlessUniversalCheckout,
  VaultedPaymentMethodAdditionalData,
  PrimerSettings,
  ValidationError
} from '@primer-io/react-native';

let log: string = "";
let merchantPaymentId: string | null = null;
let merchantCheckoutData: CheckoutData | null = null;
let merchantCheckoutAdditionalInfo: CheckoutAdditionalInfo | null = null;
let merchantPayment: IPayment | null = null;
let merchantPrimerError: Error | unknown | null = null;

export default HeadlessCheckoutVaultScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSession, setClientSession] = useState<null | any>(null);

  const [cvv, setCvv] = useState('');
  const [vaultedPaymentMethods, setVaultedPaymentMethods] = useState<undefined | VaultedPaymentMethod[]>(undefined);
  const [selectedVaultedPaymentMethod, setSelectedVaultedPaymentMethod] = useState<undefined | VaultedPaymentMethod>(undefined);

  const updateLogs = (str: string) => {
    console.log(str);
    const currentLog = log;
    const combinedLog = currentLog + "\n" + str;
    log = combinedLog;
  }

  let vaultManager = new VaultManager();

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
      android: {
        redirectScheme: 'primer'
      },
    },
    debugOptions: {
      is3DSSanityCheckEnabled: false
    },
    headlessUniversalCheckoutCallbacks: {
      onAvailablePaymentMethodsLoad: (availablePaymentMethods => {
        updateLogs(`\nℹ️ onAvailablePaymentMethodsLoad\n${JSON.stringify(availablePaymentMethods, null, 2)}\n`);
        setIsLoading(false);
      }),
      onPreparationStart: (paymentMethodType) => {
        updateLogs(`\nℹ️ onPreparationStart\npaymentMethodType: ${paymentMethodType}\n`);
      },
      onPaymentMethodShow: (paymentMethodType) => {
        updateLogs(`\nℹ️ onPaymentMethodShow\npaymentMethodType: ${paymentMethodType}\n`);
      },
      onTokenizationStart: (paymentMethodType) => {
        updateLogs(`\nℹ️ onTokenizationStart\npaymentMethodType: ${paymentMethodType}\n`);
      },
      onBeforeClientSessionUpdate: () => {
        updateLogs(`\nℹ️ onBeforeClientSessionUpdate\n`);
      },
      onClientSessionUpdate: (clientSession) => {
        updateLogs(`\nℹ️ onClientSessionUpdate\nclientSession: ${JSON.stringify(clientSession, null, 2)}\n`);
      },
      onCheckoutAdditionalInfo: (additionalInfo) => {
        merchantCheckoutAdditionalInfo = additionalInfo;
        updateLogs(`\nℹ️ onCheckoutPending\nadditionalInfo: ${JSON.stringify(additionalInfo, null, 2)}\n`);
        setIsLoading(false);
      },
      onCheckoutPending: (checkoutAdditionalInfo) => {
        merchantCheckoutAdditionalInfo = checkoutAdditionalInfo;
        updateLogs(`\n✅ onCheckoutPending\nadditionalInfo: ${JSON.stringify(checkoutAdditionalInfo, null, 2)}\n`);
        setIsLoading(false);
        navigateToResultScreen();
      },
      onCheckoutComplete: (checkoutData) => {
        merchantCheckoutData = checkoutData;
        updateLogs(`\n✅ onCheckoutComplete\ncheckoutData: ${JSON.stringify(checkoutData, null, 2)}\n`);
        setIsLoading(false);
        navigateToResultScreen();
      },
      onTokenizationSuccess: async (paymentMethodTokenData, handler) => {
        updateLogs(`\nℹ️ onTokenizationSuccess\npaymentMethodTokenData: ${JSON.stringify(paymentMethodTokenData, null, 2)}\n`);
        setIsLoading(false);

        try {
          const payment: IPayment = await createPayment(paymentMethodTokenData.token);
          merchantPayment = payment;

          if (payment.requiredAction && payment.requiredAction.clientToken) {
            merchantPaymentId = payment.id;

            if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
              updateLogs("\n⚠️ Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
            }

            handler.continueWithNewClientToken(payment.requiredAction.clientToken);

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
            const payment: IPayment = await resumePayment(merchantPaymentId, resumeToken);
            merchantPayment = payment;
            handler.complete();
            updateLogs(`\n✅ Payment resumed\npayment: ${JSON.stringify(payment, null, 2)}`);
            setIsLoading(false);
            navigateToResultScreen();
            merchantPaymentId = null;

          } else {
            const err = new Error("Invalid value for paymentId");
            throw err;
          }

        } catch (err) {
          console.error(err);
          handler.complete();
          updateLogs(`\n🛑 Payment resume\nerror: ${JSON.stringify(err, null, 2)}`);
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
      }
    }
  };

  useEffect(() => {
    createClientSessionIfNeeded()
      .then((session) => {
        fetchVaultedPaymentMethods(session.clientToken);
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
  }

  const fetchVaultedPaymentMethods = async (clientToken: string) => {
    try {
      const result = await HeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
      if (result) {
        await vaultManager.configure();
        const availablePaymentMethods = await vaultManager.fetchVaultedPaymentMethods();
        setVaultedPaymentMethods(availablePaymentMethods);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  const startVaultedPaymentFlow = async () => {
    try {
      setIsLoading(true);
      if (!cvv) {
        await vaultManager.startPaymentFlow(selectedVaultedPaymentMethod.id);
      } else {
        const data: VaultedPaymentMethodAdditionalData = { cvv: cvv };
        const validationErrors: ValidationError[] = await vaultManager.validate(selectedVaultedPaymentMethod.id, data);
        if (validationErrors.length == 0) {
          await vaultManager.startPaymentFlow(selectedVaultedPaymentMethod.id, data);
        } else {
          console.error(validationErrors[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  const navigateToResultScreen = async () => {
    try {
      props.navigation.navigate("Result", {
        merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
        merchantCheckoutData: merchantCheckoutData,
        merchantPayment: merchantPayment,
        merchantPrimerError: merchantPrimerError,
        logs: log
      });

      setClientSession(null);
      setIsLoading(true);
      await createClientSessionIfNeeded();

    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  }

  const renderVaultedPaymentMethods = () => {
    if (!vaultedPaymentMethods) {
      return null;
    }

    if (vaultedPaymentMethods.length == 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            marginHorizontal: 20,
            paddingTop: 1,
            paddingBottom: 10,
            paddingHorizontal: 10,
            fontSize: 18,
            height: 44,
            color: 'red'
          }}>No vaulted payment methods!</Text>
      );
    } else {
      return (
        vaultedPaymentMethods.map((item) => {
          return <View style={{flexDirection:'row'}}> 
            <Text style={{
              marginHorizontal: 20,
              paddingTop: 1,
              paddingBottom: 10,
              paddingHorizontal: 10,
              fontSize: 18,
              flexWrap: 'wrap',
              color: 'black'
            }} onPress={() => setSelectedVaultedPaymentMethod(item)}
            >
              • {getVaultedPaymentData(item)}
            </Text>
          </View>
        })
      );
    }
  }

  const getVaultedPaymentData = (item: any) => {
    const paymentMethodType = item?.paymentMethodType ?? ""
    var suffix: string | null = null
    switch (paymentMethodType) {
      case "PAYMENT_CARD":
      case "GOOGLE_PAY":
      case "APPLE_PAY": {
        let last4Digits = item.paymentInstrumentData.last4Digits
        if (last4Digits !== undefined) {
          suffix = "••••" + last4Digits
        }
        break;
      }
      case "PAYPAL": {
        suffix = item.paymentInstrumentData?.externalPayerInfo?.email ?? ""
        break;
      }
      case "KLARNA": {
        const billingAddress = item.paymentInstrumentData?.sessionData?.billingAddress
        suffix = billingAddress?.email ?? ""
        break;
      }
      case "STRIPE_ACH": {
        const bankName = item.paymentInstrumentData?.bankName ?? "-";
        suffix = "(" + bankName + ")"
        const last4Digits = item.paymentInstrumentData?.accountNumberLast4Digits;
        if (last4Digits !== undefined) {
          suffix += " ••••" + last4Digits
        }
        break;
      }
    }
    return paymentMethodType + ": " + (suffix ?? "-");
  }

  const renderVaultAdditionalData = () => {
    return (
      <View>
        <TextInput style={{
          borderColor: "gray",
          marginHorizontal: 20,
          marginVertical: 8,
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
        }}
          placeholder='CVV'
          keyboardType='numeric'
          onChangeText={cvv => setCvv(cvv)}
        />
        <Button
          color='black'
          title='Submit'
          disabled={!selectedVaultedPaymentMethod}
          onPress={() => startVaultedPaymentFlow()}
        />
      </View>
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
    <ScrollView style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderVaultedPaymentMethods()}
      {renderVaultAdditionalData()}
      {renderLoadingOverlay()}
    </ScrollView>
  );
};
