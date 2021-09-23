import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import { styles } from '../styles';

interface IPaymentInstrumentListArguments {
  data: PaymentInstrumentToken[];
}

export const PaymentInstrumentList = (
  args: IPaymentInstrumentListArguments
) => {
  const paymentInstrumentTypeToImage = (instrument: PaymentInstrumentToken) => {
    let src;
    switch (instrument.paymentInstrumentType) {
      case 'KLARNA_CUSTOMER_TOKEN':
        src = require('../assets/img/Klarna.png');
        break;
      case 'PAYPAL_BILLING_AGREEMENT':
        src = require('../assets/img/PayPal.png');
        break;
      case 'PAYMENT_CARD':
        if (instrument.paymentInstrumentData.network === 'Visa') {
          src = require('../assets/img/Visa.png');
        } else {
          src = require('../assets/img/MasterCard.png');
        }
        break;
      default:
        src = require('../assets/img/Visa.png');
        break;
    }

    return <Image source={src} style={styles.image} />;
  };

  return (
    <View style={listStyles.container}>
      <FlatList
        data={args.data}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {paymentInstrumentTypeToImage(item)}
            <View style={[styles.column, listStyles.itemContainer]}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={listStyles.item}
              >
                {paymentInstrumentTypeToString(item)}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

const paymentInstrumentTypeToString = (
  instrument: PaymentInstrumentToken
): string => {
  switch (instrument.paymentInstrumentType) {
    case 'KLARNA_CUSTOMER_TOKEN':
      return instrument.paymentInstrumentData.sessionData.billingAddress.email;
    case 'PAYPAL_BILLING_AGREEMENT':
      return instrument.paymentInstrumentData.externalPayerInfo.email;
    case 'PAYMENT_CARD':
      const last4Digits = instrument.paymentInstrumentData.last4Digits;
      return 'Card ending with ' + last4Digits;
    default:
      return 'Card';
  }
};

const listStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    overflow: 'hidden',
  },
  itemContainer: {
    flex: 1,
  },
});
