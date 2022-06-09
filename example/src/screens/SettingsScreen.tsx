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
import { Picker } from "@react-native-picker/picker";
import { Section } from '../models/Section';
import type { IClientSessionParams } from '../models/IAppSettings';
import { Environment, makeEnvironmentFromIntVal, makePaymentHandlingFromIntVal, PaymentHandling } from '../network/Environment';
import { makeRandomString } from '../helpers/helpers';

export let environment: Environment = Environment.Sandbox;
export let paymentHandling: PaymentHandling = PaymentHandling.Auto;
export let clientSessionParams: IClientSessionParams = {
    currencyCode: 'EUR',
    customerId: `rn-customer-${makeRandomString(8)}`,
    orderId: `rn-order-${makeRandomString(8)}`,
    order: {
        countryCode: 'FR',
        lineItems: [
            {
                amount: 1000,
                quantity: 1,
                itemId: 'shoes-261816',
                description: 'Fancy Shoes',
                discountAmount: 0
            }
        ]
    },
    merchantName: 'Primer Merchant',
    customer: {
        firstName: 'John',
        lastName: "Smith",
        emailAddress: 'john.smith@primer.io',
        mobileNumber: '+447867267218',
        nationalDocumentId: '7281082747',
        billingAddress: {
            firstName: 'John',
            lastName: 'Smith',
            postalCode: '12345',
            addressLine1: '1 Test st.',
            addressLine2: undefined,
            countryCode: 'GB',
            city: 'London',
            state: undefined
        },
        shippingAddress: {
            firstName: 'John',
            lastName: 'Smith',
            postalCode: '12345',
            addressLine1: '1 Test st.',
            addressLine2: undefined,
            countryCode: 'GB',
            city: 'London',
            state: undefined
        }
    }
}

// @ts-ignore
const SettingsScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [currency, setCurrency] = React.useState<string>("EUR");
    const [countryCode, setCountryCode] = React.useState<string>("FR");

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const onChangeAmount = (text: string) => {
        if (text) {
            const amount = -(-text);
            clientSessionParams.order = {
                countryCode: 'FR',
                lineItems: [
                    {
                        amount: amount,
                        quantity: 1,
                        itemId: 'shoes-261816',
                        description: 'Fancy Shoes',
                        discountAmount: 0
                    }
                ]
            }
        } else {
            clientSessionParams.order = undefined;
        }
    }

    const onChangeCustomerId = (text: string) => {
        if (text) {
            clientSessionParams.customerId = text;
        } else {
            clientSessionParams.customerId = undefined;
        }
    }

    const onChangePhoneNumber = (text: string) => {
        if (text) {
            //@ts-ignore
            clientSessionParams.customer.mobileNumber = text;
        } else {
            //@ts-ignore
            clientSessionParams.customer.mobileNumber = undefined;
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

                <Section title="Payment Handling">
                    Set payment handling
                </Section>

                <SegmentedControl
                    style={{ marginHorizontal: 20, marginVertical: 10 }}
                    values={['Auto', 'Manual']}
                    selectedIndex={paymentHandling}
                    onChange={(event) => {
                        const selectedIndex = event.nativeEvent.selectedSegmentIndex;
                        let selectedPaymentHandling = makePaymentHandlingFromIntVal(selectedIndex);
                        paymentHandling = selectedPaymentHandling;
                    }}
                />

                <Section title="Required Settings">
                    Amount, currency and country code are required to all payment methods
                </Section>

                <TextInput
                    style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                    onChangeText={onChangeAmount}
                    value={`${clientSessionParams.order?.lineItems[0].amount === undefined ? "" : clientSessionParams.order?.lineItems[0].amount}`}
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
                            clientSessionParams.currencyCode = itemValue;
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
                            //@ts-ignore
                            clientSessionParams.order.countryCode = itemValue;
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
                    value={`${clientSessionParams.customerId === undefined ? "" : clientSessionParams.customerId}`}
                    placeholder="Set the customer ID, e.g. rn_customer_0"
                    placeholderTextColor={'grey'}
                    keyboardType='default'
                    autoCapitalize='none'
                    autoCorrect={false}
                />

                <TextInput
                    style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                    onChangeText={onChangePhoneNumber}
                    value={`${clientSessionParams.customer?.mobileNumber === null ? "" : clientSessionParams.customer?.mobileNumber}`}
                    placeholder="Set the customer's phone number"
                    placeholderTextColor={'grey'}
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={{ ...styles.button, marginHorizontal: 20, marginTop: 20, marginBottom: 5, backgroundColor: 'black' }}
                    onPress={() => {
                        console.log(clientSessionParams);
                        navigation.navigate('Checkout');
                    }}
                >
                    <Text
                        style={{ ...styles.buttonText, color: 'white' }}
                    >
                        Primer SDK
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ ...styles.button, marginHorizontal: 20, marginTop: 5, marginBottom: 20, backgroundColor: 'black' }}
                    onPress={() => {
                        navigation.navigate('HUC');
                    }}
                >
                    <Text
                        style={{ ...styles.buttonText, color: 'white' }}
                    >
                        Headless Universal Checkout (Beta)
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;
