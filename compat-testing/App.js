import React from 'react';
import {
  SafeAreaView,
  ScrollView
} from 'react-native';
import CheckoutScreen from './CheckoutScreen';

const App = () => {
  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <CheckoutScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;