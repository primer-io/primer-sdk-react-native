import React, { useState } from 'react';
import { View, Picker, TextInput, TouchableOpacity, Text } from 'react-native';
import type { PrimerSettings } from 'src/models/primer-settings';
import type { CurrencyCode } from 'src/models/utils/currencyCode';
import { styles } from '../styles';

interface ISettingsScreenArguments {
  navigation: any;
}

export const SettingsScreen = (args: ISettingsScreenArguments) => {
  const [customerId, setCustomerId] = React.useState('customer1');
  const [amount, setAmount] = React.useState<number>(50);
  const [intent, setIntent] = React.useState<'checkout' | 'vault' | 'card'>(
    'checkout'
  );
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(
    'sandbox'
  );
  const [country, setCountry] = useState<'SE' | 'GB'>('GB');

  const getCurrencyFromCountry = (): CurrencyCode => {
    switch (country) {
      case 'SE':
        return 'SEK';
      case 'GB':
        return 'GBP';
      default:
        return 'GBP';
    }
  };

  const presentWallet = () => {
    const settings: PrimerSettings = {
      order: {
        amount: amount,
        currency: getCurrencyFromCountry(),
        countryCode: country,
      },
      options: {
        isFullScreenEnabled: false,
        isLoadingScreenEnabled: true,
        isResultScreenEnabled: true,
        ios: {
          merchantIdentifier: '',
          urlScheme: 'primer',
          urlSchemeIdentifier: 'primer',
        },
        androids: {
          redirectScheme: 'primer',
        },
      },
    };

    args.navigation.navigate('Wallet', {
      settings,
      environment,
      customerId,
      intent,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.frame, styles.column]}>
        <View style={[styles.row]}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            onChangeText={setCustomerId}
            value={customerId}
          />
        </View>
        <View style={[styles.row, styles.container]}>
          <View style={[styles.container]}>
            <Picker
              selectedValue={environment}
              style={styles.picker}
              onValueChange={(itemValue, _) => setEnvironment(itemValue)}
            >
              <Picker.Item label="Production" value="production" />
              <Picker.Item label="Sandbox" value="sandbox" />
            </Picker>
          </View>
          <View style={[styles.container]}>
            <Picker
              selectedValue={country}
              style={styles.picker}
              onValueChange={(itemValue, _) => setCountry(itemValue)}
            >
              <Picker.Item label="SE - SEK" value="SE" />
              <Picker.Item label="GB - GBP" value="GB" />
            </Picker>
          </View>
          <View style={[styles.container]}>
            <Picker
              selectedValue={amount}
              style={styles.picker}
              onValueChange={(itemValue, _) => setAmount(itemValue)}
            >
              <Picker.Item label="0.50" value={50} />
              <Picker.Item label="1.00" value={100} />
              <Picker.Item label="2.00" value={200} />
              <Picker.Item label="3.00" value={300} />
              <Picker.Item label="4.00" value={400} />
              <Picker.Item label="5.00" value={500} />
              <Picker.Item label="6.00" value={600} />
              <Picker.Item label="7.00" value={700} />
              <Picker.Item label="8.00" value={800} />
              <Picker.Item label="9.00" value={900} />
              <Picker.Item label="10.00" value={1000} />
              <Picker.Item label="20.00" value={2000} />
              <Picker.Item label="30.00" value={3000} />
              <Picker.Item label="50.00" value={5000} />
              <Picker.Item label="100.00" value={10000} />
            </Picker>
          </View>
        </View>

        {/* Pick Intent */}
        <View style={[styles.row, styles.container]}>
          <View style={[styles.container]}>
            <Picker
              selectedValue={intent}
              style={styles.picker}
              onValueChange={(itemValue, _) => setIntent(itemValue)}
            >
              <Picker.Item label="Vault Manager" value="vault" />
              <Picker.Item label="Universal Checkout" value="checkout" />
              <Picker.Item label="Card Checkout" value="card" />
            </Picker>
          </View>
        </View>

        {/* Next Button */}
        <View style={[styles.row, styles.button]}>
          <View style={[styles.container, styles.button]}>
            <TouchableOpacity onPress={presentWallet}>
              <Text style={[styles.buttonText]}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};