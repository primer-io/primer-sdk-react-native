import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeadlessCheckoutScreen } from './screens/HeadlessCheckoutScreen';
import SettingsScreen from './screens/SettingsScreen';
import CheckoutScreen from './screens/CheckoutScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="HUC"
          component={HeadlessCheckoutScreen}
          options={{ title: 'Headless Universal Checkout' }}
        />
        <Stack.Screen
          name="UniversalCheckout"
          component={CheckoutScreen}
          options={{ title: 'Universal Checkout' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
