import React, { useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';
import { PaymentInstrumentList } from '../components/PaymentInstrumentList';
import { Primer } from "@primer-io/react-native";
import { createClientSession } from '../api/client-session';
import { useState } from 'react';
import type { PrimerSettings } from 'lib/typescript/models/primer-settings';

interface IWalletScreenArguments {
  navigation: any;
  route: any;
}

export const WalletScreen = (args: IWalletScreenArguments) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const settings: PrimerSettings = args.route.params.settings;
  const customerId: string = args.route.params.customerId;
  debugger;

  // const { presentPrimer, loading } = usePrimer(
  //   args.route.params.settings,
  //   args.route.params.customerId,
  //   args.route.params.intent
  // );

  useEffect(() => {
    Primer.onClientTokenCallback = async () => {
      try {
        setIsLoading(true);
        debugger;
        const response = await createClientSession(customerId, settings);
        const clientToken = response.clientToken;
        Primer.setClientToken(clientToken);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }
  }, []);

  const presentPrimer = () => {
    Primer.showUniversalCheckout(undefined);
  }

  const renderButton = () => {
    if (isLoading)
      return (
        <View style={[styles.container, styles.button]}>
          <ActivityIndicator color={'white'} />
        </View>
      );
    return (
        <TouchableOpacity
          style={[styles.container, styles.button]}
          onPress={presentPrimer}
        >
          <Text style={[styles.buttonText]}>Show Checkout</Text>
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.frame, styles.column]}>
        <View style={[styles.row, styles.container]}>
          <PaymentInstrumentList data={[]} />
        </View>
        <View style={[styles.row, styles.button]}>{renderButton()}</View>
      </View>
    </View>
  );
};
