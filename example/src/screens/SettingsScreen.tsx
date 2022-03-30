import * as React from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';
import { styles } from '../styles';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Environment, makeEnvironmentFromIntVal } from '../models/Environment';
import { Picker } from "@react-native-picker/picker";
import { Section } from '../models/Section';
import type { IAppSettings } from '../models/IAppSettings';

// import { NavigationContainer, NavigationContainerProps } from '@react-navigation/native';
// import { NavigatorScreenParams } from '@react-navigation/native';

export let environment: Environment = Environment.Sandbox;

// @ts-ignore
const SettingsScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [amount, setAmount] = React.useState<number | null>(1000);
    const [currency, setCurrency] = React.useState<string>("EUR");
    const [countryCode, setCountryCode] = React.useState<string>("FR");
    const [customerId, setCustomerId] = React.useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = React.useState<string | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const onChangeAmount = (text: string) => {
        if (text) {
            setAmount(-(-text));
        } else {
            setAmount(null);
        }
    }

    const onChangeCustomerId = (text: string) => {
        if (text) {
            setCustomerId(text);
        } else {
            setCustomerId(null);
        }
    }

    const onChangePhoneNumber = (text: string) => {
        if (text) {
            setPhoneNumber(text);
        } else {
            setPhoneNumber(null);
        }
    }

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
            {/* <Header /> */}
            <View
                style={{
                    backgroundColor: isDarkMode ? Colors.black : Colors.white,
                }}>

                <Section title="Environment">
                    Set your environment
                </Section>

                <SegmentedControl
                    style={{ marginHorizontal: 20, marginVertical: 10 }}
                    values={['Dev', 'Sandbox', 'Staging', 'Production']}
                    selectedIndex={environment}
                    onChange={(event) => {
                        const selectedIndex = event.nativeEvent.selectedSegmentIndex;
                        let selectedEnvironment = makeEnvironmentFromIntVal(selectedIndex);
                        environment = selectedEnvironment;
                    }}
                />

                <Section title="Required Settings">
                    Amount, currency and country code are required to all payment methods
                </Section>

                <TextInput
                    style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                    onChangeText={onChangeAmount}
                    value={`${amount === null ? "" : amount}`}
                    placeholder="Type amount in minor units, e.g. 1000"
                    placeholderTextColor={'grey'}
                    keyboardType="numeric"
                />

                <View
                    style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: -30, marginBottom: 140 }}
                >
                    <Picker
                        selectedValue={currency}
                        style={{ height: 50, flex: 1 }}
                        onValueChange={(itemValue) => {
                            setCurrency(itemValue);
                        }}
                    >
                        <Picker.Item label="EUR" value="EUR" />
                        <Picker.Item label="GBP" value="GBP" />
                        <Picker.Item label="USD" value="USD" />
                        <Picker.Item label="SEK" value="SEK" />
                        <Picker.Item label="SGD" value="SGD" />
                        <Picker.Item label="PLN" value="PLN" />
                    </Picker>

                    <Picker
                        selectedValue={countryCode}
                        style={{ height: 50, flex: 1 }}
                        onValueChange={(itemValue) => {
                            setCountryCode(itemValue);
                        }}
                    >
                        <Picker.Item label="DE" value="DE" />
                        <Picker.Item label="FR" value="FR" />
                        <Picker.Item label="GB" value="GB" />
                        <Picker.Item label="SE" value="SE" />
                        <Picker.Item label="SG" value="SG" />
                        <Picker.Item label="PL" value="PL" />
                    </Picker>
                </View>

                <Section title="Optional Settings">
                    The settings below are not required, however some payment methods may need them.
                </Section>

                <TextInput
                    style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                    onChangeText={onChangeCustomerId}
                    value={`${customerId === null ? "" : customerId}`}
                    placeholder="Set the customer ID, e.g. rn_customer_0"
                    placeholderTextColor={'grey'}
                    keyboardType='default'
                    autoCapitalize='none'
                    autoCorrect={false}
                />

                <TextInput
                    style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                    onChangeText={onChangePhoneNumber}
                    value={`${phoneNumber === null ? "" : phoneNumber}`}
                    placeholder="Set the customer's phone number"
                    placeholderTextColor={'grey'}
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={{ ...styles.button, marginHorizontal: 20, marginTop: 20, marginBottom: 5, backgroundColor: 'black' }}
                    onPress={() => {
                        console.log(`Amount: ${amount}\nCurrency: ${currency}\nCountry Code: ${countryCode}\nCustomer ID: ${customerId}\nPhone Number: ${phoneNumber}`);

                        if (amount && currency && countryCode) {
                            const appSettings: IAppSettings = {
                                amount: amount,
                                currencyCode: currency,
                                countryCode: countryCode,
                                customerId: customerId || undefined,
                                phoneNumber: phoneNumber || undefined,
                            };
    
                            navigation.navigate('Checkout', appSettings);
                        }
                    }}
                >
                    <Text
                        style={{ ...styles.buttonText, color: 'white' }}
                    >
                        Continue with Primer SDK
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ ...styles.button, marginHorizontal: 20, marginTop: 5, marginBottom: 20, backgroundColor: 'black' }}
                    onPress={() => {
                        console.log(`Amount: ${amount}\nCurrency: ${currency}\nCountry Code: ${countryCode}\nCustomer ID: ${customerId}\nPhone Number: ${phoneNumber}`);
                        
                        navigation.navigate('Checkout');
                    }}
                >
                    <Text
                        style={{ ...styles.buttonText, color: 'white' }}
                    >
                        Initialize App with HUC
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;
