import type { IPrimerSettings } from 'lib/typescript/models/primer-settings';
import type { IPrimerTheme } from 'lib/typescript/models/primer-theme';
import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { usePrimer } from './usePrimer';

const theme: IPrimerTheme = {
  color: '',
};

const settings: IPrimerSettings = {
  order: {},
  business: {},
  customer: {},
  appearance: {
    hasDisabledSuccessScreen: false,
    isInitialLoadingHidden: false,
  },
};

export default function App() {
  const { presentPrimer, loading } = usePrimer(theme, settings);

  const renderButton = () => {
    if (loading) return <Text>Loading...</Text>;

    return (
      <Button title="Checkout" onPress={presentPrimer}>
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
