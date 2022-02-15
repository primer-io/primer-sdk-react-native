import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { SettingsScreen } from './screens/SettingsScreen';
import { WalletScreen } from './screens/WalletScreen';
import ComponentsScreen from './screens/ComponentsScreen';
import { PrimerContainer } from '@primer-io/react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PrimerContainer>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={ComponentsScreen}
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
    </PrimerContainer>
  );
}
