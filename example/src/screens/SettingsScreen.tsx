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
import { Environment, makeEnvironmentFromIntVal, makePaymentHandlingFromIntVal, PaymentHandling } from '../network/Environment';
import { appPaymentParameters, IClientSessionCustomer, IClientSessionLineItem, IClientSessionOrder, IClientSessionPaymentMethod, IClientSessionPaymentMethodOptions, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import { Switch } from 'react-native';
import { FlatList } from 'react-native';
import TextField from '../components/TextField';
import type { NewLineItemScreenProps } from './NewLineItemSreen';

export interface AppPaymentParameters {
    environment: Environment;
    paymentHandling: PaymentHandling;
    clientSessionRequestBody: IClientSessionRequestBody;
    merchantName?: string;
}

// @ts-ignore
const SettingsScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [environment, setEnvironment] = React.useState<Environment>(Environment.Sandbox);
    const [paymentHandling, setPaymentHandling] = React.useState<PaymentHandling>(PaymentHandling.Auto);
    const [lineItems, setLineItems] = React.useState<IClientSessionLineItem[]>(appPaymentParameters.clientSessionRequestBody.order?.lineItems || []);
    const [currency, setCurrency] = React.useState<string>("EUR");
    const [countryCode, setCountryCode] = React.useState<string>("FR");
    const [orderId, setOrderId] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.orderId);

    const [merchantName, setMerchantName] = React.useState<string | undefined>(appPaymentParameters.merchantName);
    const [customer, setCustomer] = React.useState<IClientSessionCustomer | undefined>(appPaymentParameters.clientSessionRequestBody.customer);
    const [customerId, setCustomerId] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customerId);
    const [firstName, setFirstName] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.firstName);
    const [lastName, setLastName] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.lastName);
    const [email, setEmail] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.emailAddress);
    const [phoneNumber, setPhoneNumber] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.mobileNumber);

    const [isSurchargeApplied, setIsSurchargeApplied] = React.useState<boolean>(true);
    const [applePaySurcharge, setApplePaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.APPLE_PAY?.surcharge.amount);
    const [googlePaySurcharge, setGooglePaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.GOOGLE_PAY?.surcharge.amount);
    const [adyenGiropaySurcharge, setAdyenGiropaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.ADYEN_GIROPAY?.surcharge.amount);
    const [visaSurcharge, setVisaSurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.PAYMENT_CARD?.networks.VISA?.surcharge.amount);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.black : Colors.white
    };

    const onChangeCustomerId = (text: string) => {
        const val = text.length > 0 ? text : undefined;
        setCustomerId(val)
        appPaymentParameters.clientSessionRequestBody.customerId = val;
    }

    const onChangePhoneNumber = (text: string) => {
        const val = text.length > 0 ? text : undefined;
        setPhoneNumber(val);

        const customer = appPaymentParameters.clientSessionRequestBody.customer || {};
        customer.mobileNumber = val;
        appPaymentParameters.clientSessionRequestBody.customer = Object.keys(customer).length === 0 ? undefined : customer;
    }

    const onIsSurchargeAppliedChange = (value: boolean) => {
        setIsSurchargeApplied(value);
    };

    const onCustomerValueChange = (value: boolean) => {

    };

    const renderLineItems = () => {
        return (
            <View style={{ marginTop: 8, marginBottom: 4 }}>
                <View style={{ flex: 1, flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ ...styles.heading2 }}>
                        Line Items
                    </Text>
                    <View style={{ flexGrow: 1 }} />
                    <TouchableOpacity
                        onPress={() => {
                            const newLineItemsScreenProps: NewLineItemScreenProps = {
                                onAddLineItem: (lineItem) => {
                                    const currentLineItems = [...lineItems];
                                    currentLineItems.push(lineItem);
                                    setLineItems(currentLineItems);
                                }
                            }

                            navigation.navigate('NewLineItem', newLineItemsScreenProps);
                        }}
                    >
                        <Text style={{ color: 'blue' }}>
                            +Add Line Item
                        </Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={lineItems}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            key={`${index}`}
                            style={{ flex: 1, flexDirection: 'row', marginVertical: 4 }}
                            onPress={() => {
                                const newLineItemsScreenProps: NewLineItemScreenProps = {
                                    lineItem: item,
                                    onRemoveLineItem: (lineItem) => {
                                        const currentLineItems = [...lineItems];
                                        const index = currentLineItems.indexOf(lineItem, 0);
                                        if (index > -1) {
                                            currentLineItems.splice(index, 1);
                                        }
                                        setLineItems(currentLineItems);
                                    }
                                }

                                navigation.navigate('NewLineItem', newLineItemsScreenProps);
                            }}
                        >
                            <Text>{item.description} {`x${item.quantity}`}</Text>
                            <View style={{ flexGrow: 1 }} />
                            <Text>{item.amount}</Text>
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        <View
                            style={{ flex: 1, flexDirection: 'row', marginVertical: 4 }}
                        >
                            <Text style={{ fontWeight: '600' }}>Total</Text>
                            <View style={{ flexGrow: 1 }} />
                            <Text style={{ fontWeight: '600' }}>{`${(lineItems || []).map(item => (item.amount * item.quantity)).reduce((prev, next) => prev + next, 0)}`}</Text>
                        </View>
                    }
                />
            </View>
        );
    }

    const updateAppPaymentParameters = () => {
        appPaymentParameters.merchantName = merchantName;
        appPaymentParameters.environment = environment;
        appPaymentParameters.paymentHandling = paymentHandling;

        const currentClientSessionRequestBody: IClientSessionRequestBody = { ...appPaymentParameters.clientSessionRequestBody };
        currentClientSessionRequestBody.currencyCode = currency;

        const currentClientSessionOrder: IClientSessionOrder = { ...currentClientSessionRequestBody.order };
        currentClientSessionOrder.countryCode = countryCode;
        currentClientSessionOrder.lineItems = lineItems

        currentClientSessionRequestBody.order = currentClientSessionOrder;

        const currentPaymentMethod: IClientSessionPaymentMethod = { ...currentClientSessionRequestBody.paymentMethod }
        const currentPaymentMethodOptions: IClientSessionPaymentMethodOptions = { ...currentPaymentMethod.options }

        if (applePaySurcharge) {
            currentPaymentMethodOptions.APPLE_PAY = {
                surcharge: {
                    amount: applePaySurcharge
                }
            }
        } else {
            currentPaymentMethodOptions.APPLE_PAY = undefined;
        }

        if (googlePaySurcharge) {
            currentPaymentMethodOptions.GOOGLE_PAY = {
                surcharge: {
                    amount: googlePaySurcharge
                }
            }
        } else {
            currentPaymentMethodOptions.GOOGLE_PAY = undefined;
        }

        if (adyenGiropaySurcharge) {
            currentPaymentMethodOptions.ADYEN_GIROPAY = {
                surcharge: {
                    amount: adyenGiropaySurcharge
                }
            }
        } else {
            currentPaymentMethodOptions.ADYEN_GIROPAY = undefined;
        }

        if (visaSurcharge) {
            currentPaymentMethodOptions.PAYMENT_CARD = {
                networks: {
                    VISA: {
                        surcharge: {
                            amount: visaSurcharge
                        }
                    }
                }
            }
        } else {
            currentPaymentMethodOptions.PAYMENT_CARD = undefined;
        }

        currentPaymentMethod.options = Object.keys(currentPaymentMethodOptions).length === 0 ? undefined : currentPaymentMethodOptions;

        currentClientSessionRequestBody.paymentMethod = Object.keys(currentPaymentMethod).length === 0 ? undefined : currentPaymentMethod;

        appPaymentParameters.clientSessionRequestBody = currentClientSessionRequestBody;
    }

    const renderCustomer = () => {
        if (customer === undefined) {
            return null;
        } else {
            return <View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text>Customer ID</Text>
                    <View style={{ flexGrow: 1 }} />
                    <TextInput
                        style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                        onChangeText={onChangeCustomerId}
                        value={customerId}
                        placeholder="Set the customer ID, e.g. rn_customer_0"
                        placeholderTextColor={'grey'}
                        keyboardType='default'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text>First Name</Text>
                    <View style={{ flexGrow: 1 }} />
                    <TextInput
                        style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                        onChangeText={onChangeCustomerId}
                        value={customerId}
                        placeholder="Set the customer ID, e.g. rn_customer_0"
                        placeholderTextColor={'grey'}
                        keyboardType='default'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text>Last Name</Text>
                    <View style={{ flexGrow: 1 }} />
                    <TextInput
                        style={{ ...styles.textInput, marginHorizontal: 20, marginVertical: 10 }}
                        onChangeText={onChangeCustomerId}
                        value={customerId}
                        placeholder="Set the customer ID, e.g. rn_customer_0"
                        placeholderTextColor={'grey'}
                        keyboardType='default'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TextField
                        title='Email'
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text)
                        }}
                    />
                </View>
            </View>
        }
    };

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
            {/* <Header /> */}
            <View
                style={{
                    marginHorizontal: 24
                }}
            >

                <View style={{ marginTop: 32, marginBottom: 12 }}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: "black"
                            },
                        ]}
                    >
                        Required Settings
                    </Text>
                    <Text
                        style={[
                            styles.sectionDescription,
                            {
                                color: "black"
                            },
                        ]}
                    >
                        The settings below cannot be left blank.
                    </Text>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1 }}>
                            Environment
                        </Text>
                        <SegmentedControl
                            style={{ marginTop: 6 }}
                            values={['Dev', 'Sandbox', 'Staging', 'Production']}
                            selectedIndex={environment}
                            onChange={(event) => {
                                const selectedIndex = event.nativeEvent.selectedSegmentIndex;
                                let selectedEnvironment = makeEnvironmentFromIntVal(selectedIndex);
                                setEnvironment(selectedEnvironment);
                            }}
                        />
                    </View>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1 }}>
                            Payment Handling
                        </Text>
                        <SegmentedControl
                            style={{ marginTop: 6 }}
                            values={['Auto', 'Manual']}
                            selectedIndex={paymentHandling}
                            onChange={(event) => {
                                const selectedIndex = event.nativeEvent.selectedSegmentIndex;
                                let selectedPaymentHandling = makePaymentHandlingFromIntVal(selectedIndex);
                                setPaymentHandling(selectedPaymentHandling);
                            }}
                        />
                    </View>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1 }}>
                            Order
                        </Text>

                        <View style={{ marginTop: 8, marginBottom: 4 }}>
                            <Text style={{ ...styles.heading2 }}>
                                Currency & Country Code
                            </Text>
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
                        </View>

                        {renderLineItems()}

                        <View style={{ marginTop: 8, marginBottom: 4 }}>
                            <TextField
                                title='Order ID'
                                value={orderId}
                                onChangeText={(text) => {
                                    setOrderId(text);
                                }}
                            />
                        </View>
                    </View>
                </View>





                <View style={{ marginTop: 32, marginBottom: 12 }}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: "black"
                            },
                        ]}
                    >
                        Optional Settings
                    </Text>
                    <Text
                        style={[
                            styles.sectionDescription,
                            {
                                color: "black"
                            },
                        ]}
                    >
                        These settings are not required, however some payment methods may need them.
                    </Text>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1 }}>
                            Merchant Name
                        </Text>
                        <TextField
                            value={merchantName}
                            placeholder={'Set merchant name that is presented on Apple Pay'}
                            onChangeText={(text) => {
                                setMerchantName(text);
                            }}
                        />
                    </View>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1, marginBottom: 4 }}>
                            Customer
                        </Text>
                        <TextField
                            title='ID'
                            style={{ marginVertical: 4 }}
                            value={customerId}
                            placeholder={'Set a unique ID for your customer'}
                            onChangeText={(text) => {
                                setCustomerId(text);
                            }}
                        />
                        <TextField
                            title='First Name'
                            style={{ marginVertical: 4 }}
                            value={firstName}
                            placeholder={'Set your customer\'s first name'}
                            onChangeText={(text) => {
                                setFirstName(text);
                            }}
                        />
                        <TextField
                            title='Last Name'
                            style={{ marginVertical: 4 }}
                            value={lastName}
                            placeholder={'Set your customer\'s last name'}
                            onChangeText={(text) => {
                                setLastName(text);
                            }}
                        />
                        <TextField
                            title='Email'
                            style={{ marginVertical: 4 }}
                            value={email}
                            placeholder={'Set your customer\'s email'}
                            onChangeText={(text) => {
                                setEmail(text);
                            }}
                        />
                        <TextField
                            title='Mobile Number'
                            style={{ marginVertical: 4 }}
                            value={phoneNumber}
                            placeholder={'Set your customer\'s mobile number'}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                            }}
                        />
                    </View>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                        <Text style={{ ...styles.heading1, marginBottom: 4 }}>
                            Surcharge
                        </Text>
                        <TextField
                            title='Apple Pay Surcharge'
                            style={{ marginVertical: 4 }}
                            value={applePaySurcharge === undefined ? undefined : `${applePaySurcharge}`}
                            placeholder={'Set Apple Pay surcharge'}
                            onChangeText={(text) => {
                                const tmpSurcharge = Number(text);
                                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                    setApplePaySurcharge(tmpSurcharge);
                                } else {
                                    setApplePaySurcharge(undefined);
                                }
                            }}
                        />
                        <TextField
                            title='Google Pay Surcharge'
                            style={{ marginVertical: 4 }}
                            value={googlePaySurcharge === undefined ? undefined : `${googlePaySurcharge}`}
                            placeholder={'Set Google Pay surcharge'}
                            onChangeText={(text) => {
                                const tmpSurcharge = Number(text);
                                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                    setGooglePaySurcharge(tmpSurcharge);
                                } else {
                                    setGooglePaySurcharge(undefined);
                                }
                            }}
                        />
                        <TextField
                            title='Adyen Giropay Surcharge'
                            style={{ marginVertical: 4 }}
                            value={adyenGiropaySurcharge === undefined ? undefined : `${adyenGiropaySurcharge}`}
                            placeholder={'Set Adyen Giropay surcharge'}
                            onChangeText={(text) => {
                                const tmpSurcharge = Number(text);
                                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                    setAdyenGiropaySurcharge(tmpSurcharge);
                                } else {
                                    setAdyenGiropaySurcharge(undefined);
                                }
                            }}
                        />
                        <TextField
                            title='VISA Surcharge'
                            style={{ marginVertical: 4 }}
                            value={visaSurcharge === undefined ? undefined : `${visaSurcharge}`}
                            placeholder={'Set VISA surcharge'}
                            onChangeText={(text) => {
                                const tmpSurcharge = Number(text);
                                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                    setVisaSurcharge(tmpSurcharge);
                                } else {
                                    setVisaSurcharge(undefined);
                                }
                            }}
                        />
                    </View>
                </View>


















                <TouchableOpacity
                    style={{ ...styles.button, marginTop: 20, marginBottom: 5, backgroundColor: 'black' }}
                    onPress={() => {
                        updateAppPaymentParameters();
                        console.log(appPaymentParameters);
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
                    style={{ ...styles.button, marginTop: 5, marginBottom: 20, backgroundColor: 'black' }}
                    onPress={() => {
                        updateAppPaymentParameters();
                        console.log(appPaymentParameters);
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


