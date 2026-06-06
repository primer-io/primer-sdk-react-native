import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SettingsScreen from './screens/SettingsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ResultScreen from './screens/ResultScreen';
import {HeadlessCheckoutScreen} from './screens/HeadlessCheckoutScreen';
import NewLineItemScreen from './screens/NewLineItemSreen';
import RawCardDataScreen from './screens/RawCardDataScreen';
import RawPhoneNumberDataScreen from './screens/RawPhoneNumberScreen';
import RawAdyenBancontactCardScreen from './screens/RawAdyenBancontactCardScreen';
import RawRetailOutletScreen from './screens/RawRetailOutletScreen';
import HeadlessCheckoutVaultScreen from './screens/HeadlessCheckoutVaultScreen';
import HeadlessCheckoutKlarnaScreen from './screens/HeadlessCheckoutKlarnaScreen';
import HeadlessCheckoutWithRedirect from './screens/HeadlessCheckoutWithRedirect';
import HeadlessCheckoutStripeAchScreen from './screens/HeadlessCheckoutStripeAchScreen';
import {CheckoutComponentsListScreen} from './screens/CheckoutComponentsListScreen';
import {CustomPaymentSelectionScreen} from './screens/CustomPaymentSelectionScreen';
import {CoffeeReorderScreen} from './screens/CoffeeReorderScreen';
import {AccordionCheckoutScreen} from './screens/AccordionCheckoutScreen';
import {CardPreviewScreen} from './screens/CardPreviewScreen';
import {CoinTopUpScreen} from './screens/CoinTopUpScreen';
import {HooksOnlyScreen} from './screens/HooksOnlyScreen';
import {LogBox} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NewLineItem" component={NewLineItemScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="HUC" component={HeadlessCheckoutScreen} />
          <Stack.Screen name="HUCVault" component={HeadlessCheckoutVaultScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="RawCardData" component={RawCardDataScreen} />
          <Stack.Screen
            name="RawPhoneNumberData"
            component={RawPhoneNumberDataScreen}
          />
          <Stack.Screen
            name="RawAdyenBancontactCard"
            component={RawAdyenBancontactCardScreen}
          />
          <Stack.Screen
            name="RawRetailOutlet"
            component={RawRetailOutletScreen}
          />
          <Stack.Screen
            name="CheckoutComponentsList"
            component={CheckoutComponentsListScreen}
            options={{title: 'Checkout Components'}}
          />
          <Stack.Screen
            name="CustomPaymentSelection"
            component={CustomPaymentSelectionScreen}
            options={{title: 'Secure checkout'}}
          />
          <Stack.Screen
            name="CoffeeReorder"
            component={CoffeeReorderScreen}
            options={{title: 'Quick reorder'}}
          />
          <Stack.Screen
            name="AccordionCheckout"
            component={AccordionCheckoutScreen}
            options={{title: 'Checkout'}}
          />
          <Stack.Screen
            name="CardPreview"
            component={CardPreviewScreen}
            options={{title: 'Slide to pay'}}
          />
          <Stack.Screen
            name="CoinTopUp"
            component={CoinTopUpScreen}
            options={{title: 'Coin store'}}
          />
          <Stack.Screen
            name="HooksOnly"
            component={HooksOnlyScreen}
            options={{title: 'Bring-your-own UI'}}
          />
          <Stack.Screen name="Klarna" component={HeadlessCheckoutKlarnaScreen} />
          <Stack.Screen
            name="HeadlessCheckoutWithRedirect"
            component={HeadlessCheckoutWithRedirect}
          />
          <Stack.Screen
            name="HeadlessCheckoutStripeAchScreen"
            component={HeadlessCheckoutStripeAchScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
