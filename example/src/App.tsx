import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './screens/SettingsScreen';
import { WalletScreen } from './screens/WalletScreen';
import { HeadlessCheckoutScreen } from './screens/HeadlessCheckoutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Checkout"
          component={HeadlessCheckoutScreen}
          options={{ title: 'Headless Checkout' }}
        />
        {/* <Stack.Screen
          name="Home"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        /> */}
        <Stack.Screen name="Wallet" component={WalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
