import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';
import { usePrimer } from '../hooks/usePrimer';
import { PaymentInstrumentList } from '../components/PaymentInstrumentList';

interface IWalletScreenArguments {
  navigation: any;
  route: any;
}

export const WalletScreen = (args: IWalletScreenArguments) => {
  const { presentPrimer, loading, paymentSavedInstruments } = usePrimer(
    args.route.params.settings,
    args.route.params.customerId,
    args.route.params.intent
  );

  const renderButton = () => {
    if (loading)
      return (
        <View style={[styles.container, styles.button]}>
          <ActivityIndicator color={'white'} />
        </View>
      );
    return (
      <View style={[styles.container, styles.button]}>
        <TouchableOpacity onPress={presentPrimer}>
          <Text style={[styles.buttonText]}>Show Checkout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.frame, styles.column]}>
        <View style={[styles.row, styles.container]}>
          <PaymentInstrumentList data={paymentSavedInstruments} />
        </View>
        <View style={[styles.row, styles.button]}>{renderButton()}</View>
      </View>
    </View>
  );
};
