import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import type { IPrimerSettings } from 'src/models/primer-settings';
import type { IPrimerTheme } from 'src/models/primer-theme';
import { usePrimer } from './usePrimer';

const theme: IPrimerTheme = {
  colors: {
    mainColor: {
      red: 120,
      green: 80,
      blue: 180,
      alpha: 255,
    },
    background: {
      red: 100,
      green: 80,
      blue: 200,
      alpha: 255,
    },
    disabled: {
      red: 50,
      green: 50,
      blue: 50,
      alpha: 255,
    },
  },
};

const settings: IPrimerSettings = {
  order: {
    amount: 8000,
    currency: 'EUR',
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
      <Button title="Pay" onPress={presentPrimer}>
        Checkout
      </Button>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.button}>{renderButton()}</View>
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
