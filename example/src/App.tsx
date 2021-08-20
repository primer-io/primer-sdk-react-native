import React from 'react';
import { StyleSheet, View, Text, Button, SafeAreaView } from 'react-native';
import { usePrimer } from './usePrimer';

export default function App() {
  const { presentPrimer, loading, paymentInstrument } = usePrimer();

  const renderPaymentInstrumentText = () => {
    if (!paymentInstrument) return <Text>No Card 😢</Text>;
    return (
      <View>
        <Text>Got Card 💰</Text>
        <Text>{JSON.stringify(paymentInstrument)}</Text>
      </View>
    );
  };

  const renderButton = () => {
    if (loading) return <Text>Loading...</Text>;
    return (
      <Button title="Show Checkout" onPress={presentPrimer}>
        Checkout
      </Button>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View>{renderPaymentInstrumentText()}</View>
        <View style={styles.button}>{renderButton()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
  },
});
