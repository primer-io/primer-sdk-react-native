import React from 'react';
import { StyleSheet, View, Text, Button, SafeAreaView } from 'react-native';
import type { IPrimerSettings } from 'src/models/primer-settings';
import type { IPrimerTheme } from 'src/models/primer-theme';
import { usePrimer } from './usePrimer';

const theme: IPrimerTheme = {};

const settings: IPrimerSettings = {
  order: {
    amount: 8000,
    currency: 'SEK',
    countryCode: 'SE',
  },
  options: {
    hasDisabledSuccessScreen: false,
    isInitialLoadingHidden: false,
  },
};

export default function App() {
  const { presentPrimer, loading } = usePrimer(theme, settings);

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
