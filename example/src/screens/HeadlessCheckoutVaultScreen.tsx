import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  FlatList,
  View,
} from 'react-native';
import { createClientSession } from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { ActivityIndicator } from 'react-native';
import { getPaymentHandlingStringVal } from '../network/Environment';
import {
  VaultManager,
  VaultedPaymentMethod,
  HeadlessUniversalCheckout,
  PrimerSettings,
  VaultedPaymentMethodAdditionalData,
  ValidationError
} from '@primer-io/react-native';

let log: string = "";

const vaultManager = new VaultManager()

export const HeadlessCheckoutVaultScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSession, setClientSession] = useState<null | any>(null);
  const [vaultedPaymentMethods, setVaultedPaymentMethods] = useState<undefined | VaultedPaymentMethod[]>(undefined);
  const [selectedVaultedPaymentMethod, setSelectedVaultedPaymentMethod] = useState<undefined | VaultedPaymentMethod>(undefined);

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
      cardPaymentOptions: {
        is3DSOnVaultingEnabled: false
      },
    },
    headlessUniversalCheckoutCallbacks: {
      onAvailablePaymentMethodsLoad: (availablePaymentMethods => {
        updateLogs(`\nℹ️ onAvailablePaymentMethodsLoad\n${JSON.stringify(availablePaymentMethods, null, 2)}\n`);
        setIsLoading(false);
      }),
      onCheckoutComplete: (checkoutData) => {
        updateLogs(`\n✅ onCheckoutComplete\ncheckoutData: ${JSON.stringify(checkoutData, null, 2)}\n`);
        setIsLoading(false);
      },
      onError: (err, checkoutData) => {
        updateLogs(`\n🛑 onError\nerror: ${JSON.stringify(err, null, 2)}`);
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  const updateLogs = (str: string) => {
    console.log(str);
    const currentLog = log;
    const combinedLog = currentLog + "\n" + str;
    log = combinedLog;
  }

  useEffect(() => {
    createClientSessionIfNeeded()
      .then((session) => {
        setIsLoading(false);
        startVaultManager(session.clientToken);
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

  const startVaultManager = async (clientToken: string) => {
    try {
      setIsLoading(true);
      await HeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
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

  const payVaulted = async (vaultedPaymentMethod: VaultedPaymentMethod, additionalData: String) => {
    try {
      setIsLoading(true);
      const data: VaultedPaymentMethodAdditionalData = { cvv: additionalData };
      const validationErrors: ValidationError[] = await vaultManager.validate(vaultedPaymentMethod.id, data);

      if (validationErrors.length == 0) {
        await vaultManager.startPaymentFlowWithAdditionalData(vaultedPaymentMethod.id, data);
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
            height: 40,
            color: 'black'
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
      {renderVaultedPaymentMethods()}
      {renderVaultAdditionalData()}
      {renderLoadingOverlay()}
    </View>
  );
};