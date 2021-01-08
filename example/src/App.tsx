import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { UXMode } from '@primer-io/react-native';
import { usePrimer } from './usePrimer';

export default function App() {
  const { showCheckout, token } = usePrimer({
    uxMode: UXMode.MANAGE_PAYMENT_METHODS,
    amount: 1234,
    currency: 'EUR',
    clientToken: '',
  });

  return (
    <View style={styles.container}>
      <Text>Result: {token}</Text>
      <View style={styles.button}>
        <Button title="Checkout" onPress={showCheckout}>
          Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  button: {
    marginVertical: 10,
  },
});
