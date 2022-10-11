import * as React from 'react';
import {
    ScrollView,
    Text,
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
import { appPaymentParameters, IClientSessionAddress, IClientSessionCustomer, IClientSessionLineItem, IClientSessionOrder, IClientSessionPaymentMethod, IClientSessionPaymentMethodOptions, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
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
    const [environment, setEnvironment] = React.useState<Environment>(Environment.Staging);
    const [paymentHandling, setPaymentHandling] = React.useState<PaymentHandling>(PaymentHandling.Auto);
    const [lineItems, setLineItems] = React.useState<IClientSessionLineItem[]>(appPaymentParameters.clientSessionRequestBody.order?.lineItems || []);
    const [currency, setCurrency] = React.useState<string>("PHP");
    const [countryCode, setCountryCode] = React.useState<string>("PH");
    const [orderId, setOrderId] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.orderId);

    const [merchantName, setMerchantName] = React.useState<string | undefined>(appPaymentParameters.merchantName);

    const [isCustomerApplied, setIsCustomerApplied] = React.useState<boolean>(appPaymentParameters.clientSessionRequestBody.customer !== undefined);
    const [customerId, setCustomerId] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customerId);
    const [firstName, setFirstName] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.firstName);
    const [lastName, setLastName] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.lastName);
    const [email, setEmail] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.emailAddress);
    const [phoneNumber, setPhoneNumber] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.mobileNumber);
    const [nationalDocumentId, setNationalDocumentId] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.nationalDocumentId);
    const [isAddressApplied, setIsAddressApplied] = React.useState<boolean>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress !== undefined);
    const [addressLine1, setAddressLine1] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.addressLine1);
    const [addressLine2, setAddressLine2] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.addressLine2);
    const [postalCode, setPostalCode] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.postalCode);
    const [city, setCity] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.city);
    const [state, setState] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.state);
    const [customerAddressCountryCode, setCustomerAddressCountryCode] = React.useState<string | undefined>(appPaymentParameters.clientSessionRequestBody.customer?.billingAddress?.countryCode);

    const [isSurchargeApplied, setIsSurchargeApplied] = React.useState<boolean>(true);
    const [applePaySurcharge, setApplePaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.APPLE_PAY?.surcharge.amount);
    const [googlePaySurcharge, setGooglePaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.GOOGLE_PAY?.surcharge.amount);
    const [adyenGiropaySurcharge, setAdyenGiropaySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.ADYEN_GIROPAY?.surcharge.amount);
    const [adyenIdealSurcharge, setAdyenIdealSurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.ADYEN_IDEAL?.surcharge.amount);
    const [adyenSofortSurcharge, setAdyenSofortySurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.ADYEN_SOFORT?.surcharge.amount);
    const [visaSurcharge, setVisaSurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.PAYMENT_CARD?.networks.VISA?.surcharge.amount);
    const [masterCardSurcharge, setMasterCardSurcharge] = React.useState<number | undefined>(appPaymentParameters.clientSessionRequestBody.paymentMethod?.options?.PAYMENT_CARD?.networks.MASTERCARD?.surcharge.amount);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.black : Colors.white
    };

    const renderEnvironmentSection = () => {
        return (
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
        )
    }

    const renderPaymentHandlingSection = () => {
        return (
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
        );
    }

    const renderOrderSection = () => {
        return (
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
                            <Picker.Item label="THB" value="THB" />
                            <Picker.Item label="IDR" value="IDR" />
                            <Picker.Item label="PHP" value="PHP" />
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
                            <Picker.Item label="PT" value="PT" />
                            <Picker.Item label="TH" value="TH" />
                            <Picker.Item label="ID" value="ID" />
                            <Picker.Item label="NL" value="NL" />
                            <Picker.Item label="PH" value="PH" />
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
        );
    }

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

    const renderRequiredSettings = () => {
        return (
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

                {renderEnvironmentSection()}

                {renderPaymentHandlingSection()}

                {renderOrderSection()}
            </View>
        );
    }

    const renderSurchargeSection = () => {
        return (
            <View style={{ marginTop: 12, marginBottom: 8 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ ...styles.heading1, marginBottom: 4 }}>
                        Surcharge
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Switch
                        value={isSurchargeApplied}
                        onValueChange={val => {
                            setIsSurchargeApplied(val);
                        }}
                    />
                </View>
                {
                    !isSurchargeApplied ? null :
                        <View>
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
                                title='Adyen IDeal Surcharge'
                                style={{ marginVertical: 4 }}
                                value={adyenIdealSurcharge === undefined ? undefined : `${adyenIdealSurcharge}`}
                                placeholder={'Set Adyen IDeal surcharge'}
                                onChangeText={(text) => {
                                    const tmpSurcharge = Number(text);
                                    if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                        setAdyenIdealSurcharge(tmpSurcharge);
                                    } else {
                                        setAdyenIdealSurcharge(undefined);
                                    }
                                }}
                            />
                            <TextField
                                title='Adyen Sofort Surcharge'
                                style={{ marginVertical: 4 }}
                                value={adyenSofortSurcharge === undefined ? undefined : `${adyenSofortSurcharge}`}
                                placeholder={'Set Adyen Sofort surcharge'}
                                onChangeText={(text) => {
                                    const tmpSurcharge = Number(text);
                                    if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                        setAdyenSofortySurcharge(tmpSurcharge);
                                    } else {
                                        setAdyenSofortySurcharge(undefined);
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
                            <TextField
                                title='MasterCard Surcharge'
                                style={{ marginVertical: 4 }}
                                value={masterCardSurcharge === undefined ? undefined : `${masterCardSurcharge}`}
                                placeholder={'Set MasterCard surcharge'}
                                onChangeText={(text) => {
                                    const tmpSurcharge = Number(text);
                                    if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                                        setMasterCardSurcharge(tmpSurcharge);
                                    } else {
                                        setMasterCardSurcharge(undefined);
                                    }
                                }}
                            />
                        </View>
                }

            </View>
        );
    }

    const renderCustomerSection = () => {
        return (
            <View style={{ marginTop: 12, marginBottom: 8 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={{ ...styles.heading1, marginBottom: 4 }}>
                        Customer
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Switch
                        value={isCustomerApplied}
                        onValueChange={val => {
                            setIsCustomerApplied(val);
                        }}
                    />
                </View>

                {
                    !isCustomerApplied ? null :
                        <View>
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
                            <TextField
                                title='National Document ID'
                                style={{ marginVertical: 4 }}
                                value={nationalDocumentId}
                                placeholder={'Set your customer\'s national doc ID'}
                                onChangeText={(text) => {
                                    setNationalDocumentId(text);
                                }}
                            />

                            <View style={{ marginTop: 8 }}>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <Text style={{ ...styles.heading1, marginBottom: 4 }}>
                                        Address
                                    </Text>
                                    <View style={{ flex: 1 }} />
                                    <Switch
                                        value={isAddressApplied}
                                        onValueChange={val => {
                                            setIsAddressApplied(val);
                                        }}
                                    />
                                </View>
                                {
                                    !isAddressApplied ? null :
                                        <View>
                                            <TextField
                                                title='Line 1'
                                                style={{ marginVertical: 4 }}
                                                value={addressLine1}
                                                placeholder={'Set your customer\'s address line 1'}
                                                onChangeText={(text) => {
                                                    setAddressLine1(text);
                                                }}
                                            />
                                            <TextField
                                                title='Line 2'
                                                style={{ marginVertical: 4 }}
                                                value={addressLine2}
                                                placeholder={'Set your customer\'s address line 2'}
                                                onChangeText={(text) => {
                                                    setAddressLine2(text);
                                                }}
                                            />
                                            <TextField
                                                title='Postal Code'
                                                style={{ marginVertical: 4 }}
                                                value={postalCode}
                                                placeholder={'Set your customer\'s postal code'}
                                                onChangeText={(text) => {
                                                    setPostalCode(text);
                                                }}
                                            />
                                            <TextField
                                                title='City'
                                                style={{ marginVertical: 4 }}
                                                value={city}
                                                placeholder={'Set your customer\'s city'}
                                                onChangeText={(text) => {
                                                    setCity(text);
                                                }}
                                            />
                                            <TextField
                                                title='State'
                                                style={{ marginVertical: 4 }}
                                                value={state}
                                                placeholder={'Set your customer\'s state'}
                                                onChangeText={(text) => {
                                                    setState(text);
                                                }}
                                            />
                                            <TextField
                                                title='Country Code'
                                                style={{ marginVertical: 4 }}
                                                value={customerAddressCountryCode}
                                                placeholder={'Set your customer\'s country code'}
                                                onChangeText={(text) => {
                                                    setCustomerAddressCountryCode(text);
                                                }}
                                            />
                                        </View>
                                }
                            </View>

                        </View>
                }

            </View>
        );
    };

    const renderMerchantSection = () => {
        return (
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
        );
    }

    const renderOptionalSettings = () => {
        return (
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
                {renderMerchantSection()}
                {renderCustomerSection()}
                {renderSurchargeSection()}
            </View>
        );
    }

    const renderActions = () => {
        return (
            <View>
                <TouchableOpacity
                    style={{ ...styles.button, marginVertical: 5, backgroundColor: 'black' }}
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
                    style={{ ...styles.button, marginVertical: 5, backgroundColor: 'black' }}
                    onPress={() => {
                        updateAppPaymentParameters();
                        console.log(appPaymentParameters);
                        navigation.navigate('HUC');
                    }}
                >
                    <Text
                        style={{ ...styles.buttonText, color: 'white' }}
                    >
                        Headless Universal Checkout
                    </Text>
                </TouchableOpacity>
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

        currentClientSessionRequestBody.customerId = customerId;

        let currentCustomer: IClientSessionCustomer | undefined = { ...appPaymentParameters.clientSessionRequestBody.customer };
        if (isCustomerApplied) {
            currentCustomer.firstName = firstName;
            currentCustomer.lastName = lastName;
            currentCustomer.emailAddress = email;
            currentCustomer.mobileNumber = phoneNumber;

            let currentAddress: IClientSessionAddress | undefined = { ...appPaymentParameters.clientSessionRequestBody.customer?.billingAddress }
            if (isAddressApplied) {
                currentAddress.firstName = firstName;
                currentAddress.lastName = lastName;
                currentAddress.addressLine1 = addressLine1;
                currentAddress.addressLine2 = addressLine2;
                currentAddress.postalCode = postalCode;
                currentAddress.city = city;
                currentAddress.state = state;
                currentAddress.countryCode = customerAddressCountryCode;

            } else {
                currentAddress = undefined;
            }

            currentCustomer.billingAddress = Object.keys(currentAddress || {}).length === 0 ? undefined : currentAddress;
            currentCustomer.shippingAddress = Object.keys(currentAddress || {}).length === 0 ? undefined : currentAddress;

        } else {
            currentClientSessionRequestBody.customerId = undefined;
            currentCustomer = undefined;
        }

        currentClientSessionRequestBody.customer = Object.keys(currentCustomer || {}).length === 0 ? undefined : currentCustomer;

        const currentPaymentMethod: IClientSessionPaymentMethod = { ...currentClientSessionRequestBody.paymentMethod }
        let currentPaymentMethodOptions: IClientSessionPaymentMethodOptions | undefined = { ...currentPaymentMethod.options }

        if (isSurchargeApplied) {
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
        } else {
            currentPaymentMethodOptions = undefined;
        }


        currentPaymentMethod.options = Object.keys(currentPaymentMethodOptions || {}).length === 0 ? undefined : currentPaymentMethodOptions;
        currentClientSessionRequestBody.paymentMethod = Object.keys(currentPaymentMethod).length === 0 ? undefined : currentPaymentMethod;

        appPaymentParameters.clientSessionRequestBody = currentClientSessionRequestBody;
    }

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
                {renderRequiredSettings()}
                {renderOptionalSettings()}

                <View style={{ marginVertical: 5 }} />

                {renderActions()}
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;
