import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';
import {
  Asset,
  AssetsManager,
  CheckoutAdditionalInfo,
  CheckoutData,
  HeadlessUniversalCheckout,
  VaultManager,
  NativeUIManager,
  PaymentMethod,
  VaultedPaymentMethod,
  VaultedPaymentMethodAdditionalData,
  ValidationError,
  PrimerSettings,
  SessionIntent,
} from '@primer-io/react-native';

let log: string = "";
let merchantPaymentId: string | null = null;
let merchantCheckoutData: CheckoutData | null = null;
let merchantCheckoutAdditionalInfo: CheckoutAdditionalInfo | null = null;
let merchantPayment: IPayment | null = null;
let merchantPrimerError: Error | unknown | null = null;

const selectImplemetationType = (paymentMethod: PaymentMethod): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buttons: any[] = [];

    paymentMethod.paymentMethodManagerCategories.forEach(category => {
      buttons.push({
        text: category,
        style: "default",
        onPress: () => {
          resolve(category);
        }
      });
    });

    buttons.push({
      text: "Cancel",
      style: "cancel",
      onPress: () => {
        const err = new Error("Operation cancelled");
        reject(err);
      }
    });

    Alert.alert(
      "",
      "Select implementation to test",
      buttons,
      {
        cancelable: true,
      }
    );
  })
}

const vaultManager = new VaultManager()

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSession, setClientSession] = useState<null | any>(null);
  const [paymentMethods, setPaymentMethods] = useState<undefined | PaymentMethod[]>(undefined);
  const [vaultedPaymentMethods, setVaultedPaymentMethods] = useState<undefined | VaultedPaymentMethod[]>(undefined);
  const [selectedVaultedPaymentMethod, setSelectedVaultedPaymentMethod] = useState<undefined | VaultedPaymentMethod>(undefined);
  const [paymentMethodsAssets, setPaymentMethodsAssets] = useState<undefined | Asset[]>(undefined);

  const updateLogs = (str: string) => {
    console.log(str);
    const currentLog = log;
    const combinedLog = currentLog + "\n" + str;
    log = combinedLog;
  }

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
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
      onCheckoutComplete: (checkoutData) => {
        merchantCheckoutData = checkoutData;
        updateLogs(`\n✅ onCheckoutComplete\ncheckoutData: ${JSON.stringify(checkoutData, null, 2)}\n`);
        setIsLoading(false);
        navigateToResultScreen();
      },
      onCheckoutPending: (checkoutAdditionalInfo) => {
        merchantCheckoutAdditionalInfo = checkoutAdditionalInfo;
        updateLogs(`\n✅ onCheckoutPending\nadditionalInfo: ${JSON.stringify(checkoutAdditionalInfo, null, 2)}\n`);
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

  if (appPaymentParameters.merchantName) {
    //@ts-ignore
    settings.paymentMethodOptions.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName
    }
  }

  useEffect(() => {
    createClientSessionIfNeeded()
      .then((session) => {
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

  const startHUC = async (clientToken: string) => {
    try {
      const availablePaymentMethods = await HeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
      setPaymentMethods(availablePaymentMethods);
      // updateLogs(`\nℹ️ Available payment methods:\n${JSON.stringify(availablePaymentMethods, null, 2)}`);
      const assetsManager = new AssetsManager();
      const assets = await assetsManager.getPaymentMethodAssets();
      setPaymentMethodsAssets(assets);

    } catch (err) {
      console.error(err);
    }
  }

  const startVaultManager = async () => {
    try {
      setIsLoading(true);
      await vaultManager.configure();
      const availablePaymentMethods = await vaultManager.fetchVaultedPaymentMethods();
      updateLogs(`\n Returned Payment Methods: ${JSON.stringify(availablePaymentMethods, null, 2)}`);
      setVaultedPaymentMethods(availablePaymentMethods);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  const paymentMethodButtonTapped = async (paymentMethodType: string) => {
    try {
      const paymentMethod = paymentMethods?.find(pm => pm.paymentMethodType === paymentMethodType);

      if (!paymentMethod) {
        return;
      }

      if (paymentMethod.paymentMethodManagerCategories.length === 1) {
        pay(paymentMethod, paymentMethod.paymentMethodManagerCategories[0]);

      } else {
        const selectedImplementationType = await selectImplemetationType(paymentMethod);
        pay(paymentMethod, selectedImplementationType);
      }
    } catch (err) {
      updateLogs(`\n🛑 paymentMethodButtonTapped\nerror: ${JSON.stringify(err, null, 2)}`);
      console.error(err);
    }
  };

  const pay = async (paymentMethod: PaymentMethod, implementationType: string) => {
    try {
      if (implementationType === "NATIVE_UI") {
        setIsLoading(true);
        await createClientSessionIfNeeded();
        const nativeUIManager = new NativeUIManager();
        await nativeUIManager.configure(paymentMethod.paymentMethodType);

        if (paymentMethod.paymentMethodType === "KLARNA") {
          await nativeUIManager.showPaymentMethod(SessionIntent.VAULT);
        } else {
          await nativeUIManager.showPaymentMethod(SessionIntent.CHECKOUT);
        }

      } else if (implementationType === "RAW_DATA") {
        await createClientSessionIfNeeded();

        if (paymentMethod.paymentMethodType === "XENDIT_OVO" || paymentMethod.paymentMethodType === "ADYEN_MBWAY") {
          props.navigation.navigate('RawPhoneNumberData', { paymentMethodType: paymentMethod.paymentMethodType });

        } else if (paymentMethod.paymentMethodType === "XENDIT_RETAIL_OUTLETS") {
          props.navigation.navigate('RawRetailOutlet', { paymentMethodType: paymentMethod.paymentMethodType });

        } else if (paymentMethod.paymentMethodType === "ADYEN_BANCONTACT_CARD") {
          props.navigation.navigate('RawAdyenBancontactCard', { paymentMethodType: paymentMethod.paymentMethodType });

        } else if (paymentMethod.paymentMethodType === "PAYMENT_CARD") {
          props.navigation.navigate('RawCardData', { paymentMethodType: paymentMethod.paymentMethodType });
        }

      } else {
        Alert.alert(
          "Warning!",
          `${implementationType} is not supported on Headless Universal Checkout yet.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {

              }
            }
          ],
          {
            cancelable: true,
          }
        );
      }

    } catch (err) {
      logPaymentError(err);
    }
  }

  const payVaulted = async (vaultedPaymentMethod: VaultedPaymentMethod, additionalData: String) => {
    try {
      setIsLoading(true);
      const data: VaultedPaymentMethodAdditionalData = { cvv: additionalData };
      const validationErrors: ValidationError[] = await vaultManager.validate(vaultedPaymentMethod.id, data);

      if (validationErrors.length == 0) {
        await vaultManager.startPaymentFlow(vaultedPaymentMethod.id, data);
        setIsLoading(false);
        Alert.alert(
          "Success!",
          `${vaultedPaymentMethod.paymentMethodType} payment has been processed successfully.`,
          [
            {
              text: "Okay",
              style: "default",
              onPress: () => { }
            }
          ],
          { cancelable: true, }
        );
      } else {
        setIsLoading(false);
        console.error(validationErrors[0]);
      }
    } catch (err) {
      logPaymentError(err);
    }
  }

  const logPaymentError = async (err: any) => {
    updateLogs(`\n🛑 pay\nerror: ${JSON.stringify(err, null, 2)}`);
    setIsLoading(false);
    console.error(err);
  }

  const renderVaultManagerButton = () => {
    return (
      <TouchableOpacity
        style={{
          ...styles.button, marginHorizontal: 20, marginVertical: 8, backgroundColor: 'black'
        }}
        onPress={() => {
          startVaultManager();
        }}
      >
        <Text
          style={{ ...styles.buttonText, color: 'white' }}
        >
          Vault Manager
        </Text>
      </TouchableOpacity>
    );
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
        <FlatList
          data={vaultedPaymentMethods}
          renderItem={({ item }) => <Text style={{
            marginHorizontal: 20,
            paddingTop: 1,
            paddingBottom: 10,
            paddingHorizontal: 10,
            fontSize: 18,
            height: 44,
            color:'black',
          }} onPress={() => setSelectedVaultedPaymentMethod(item)}>{item.paymentInstrumentData.first6Digits + '****'}
          </Text>}
        />
      );
    }
  }


  const renderVaultAdditionalData = () => {
    if (!selectedVaultedPaymentMethod) {
      return null;
    }

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
          onSubmitEditing={(value) => payVaulted(selectedVaultedPaymentMethod, value.nativeEvent.text)} />
      </View>
    );
  }

  const renderPaymentMethodsUI = () => {
    if (!paymentMethodsAssets) {
      return null;
    }

    return (
      <View>
        {paymentMethodsAssets.map((paymentMethodsAsset) => {
          return (
            <TouchableOpacity
              key={paymentMethodsAsset.paymentMethodType}
              style={{
                marginHorizontal: 20,
                marginVertical: 8,
                height: 50,
                backgroundColor: paymentMethodsAsset.paymentMethodBackgroundColor.colored || paymentMethodsAsset.paymentMethodBackgroundColor.light,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 4,
              }}
              onPress={() => {
                paymentMethodButtonTapped(paymentMethodsAsset.paymentMethodType);
              }}
              testID={`button-${paymentMethodsAsset.paymentMethodType.toLowerCase().replace("_", "-")}`}
            >
              <Image
                style={{ height: 36, width: '100%', resizeMode: "contain" }}
                source={{ uri: paymentMethodsAsset.paymentMethodLogo.colored || paymentMethodsAsset.paymentMethodLogo.light }}
              />
            </TouchableOpacity>
          );
        })}
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
    <View style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderVaultManagerButton()}
      {renderVaultedPaymentMethods()}
      {renderVaultAdditionalData()}
      {renderPaymentMethodsUI()}
      {renderLoadingOverlay()}
    </View>
  );
};
