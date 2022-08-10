import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from './screens/SettingsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ResultScreen from './screens/ResultScreen';
import { HeadlessCheckoutScreen } from './screens/HeadlessCheckoutScreen';
import NewLineItemScreen from './screens/NewLineItemSreen';
import { HUCRawCardDataScreen } from './screens/HUCRawCardDataScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NewLineItem" component={NewLineItemScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="HUC" component={HeadlessCheckoutScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="HUCRawCardData" component={HUCRawCardDataScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default App;
