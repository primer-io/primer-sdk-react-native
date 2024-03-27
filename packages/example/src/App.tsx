import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from './screens/SettingsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ResultScreen from './screens/ResultScreen';
import { HeadlessCheckoutScreen } from './screens/HeadlessCheckoutScreen';
import NewLineItemScreen from './screens/NewLineItemSreen';
import RawCardDataScreen from './screens/RawCardDataScreen';
import RawPhoneNumberDataScreen from './screens/RawPhoneNumberScreen';
import RawAdyenBancontactCardScreen from './screens/RawAdyenBancontactCardScreen';
import RawRetailOutletScreen from './screens/RawRetailOutletScreen';
import HeadlessCheckoutVaultScreen from './screens/HeadlessCheckoutVaultScreen';
import HeadlessCheckoutWithRedirect from './screens/HeadlessCheckoutWithRedirect';
import { LogBox } from 'react-native';

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NewLineItem" component={NewLineItemScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="HUC" component={HeadlessCheckoutScreen} />
          <Stack.Screen name="HUCVault" component={HeadlessCheckoutVaultScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="RawCardData" component={RawCardDataScreen} />
          <Stack.Screen name="RawPhoneNumberData" component={RawPhoneNumberDataScreen} />
          <Stack.Screen name="RawAdyenBancontactCard" component={RawAdyenBancontactCardScreen} />
          <Stack.Screen name="RawRetailOutlet" component={RawRetailOutletScreen} />
          <Stack.Screen name="HeadlessCheckoutWithRedirect" component={HeadlessCheckoutWithRedirect} />
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default App;
