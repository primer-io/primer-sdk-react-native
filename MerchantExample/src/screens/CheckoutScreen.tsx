

import * as React from 'react';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IClientSession } from '../models/IClientSession';
import { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import { createClientSession } from '../network/api';
import { styles } from '../styles';

const CheckoutScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const clientSessionRequestBody: IClientSessionRequestBody = {
        customerId: "rn_customer_id",
        orderId: 'rn-test-10001',
        currencyCode: 'EUR',
        order: {
            countryCode: 'NL',
            lineItems: [
                {
                    amount: 30,
                    quantity: 1,
                    itemId: 'item-123',
                    description: 'this item',
                    discountAmount: 0,
                },
            ],
        },
        customer: {
            emailAddress: 'test@mail.com',
            mobileNumber: '0841234567',
            firstName: 'John',
            lastName: 'Doe',
            billingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                postalCode: '12345',
                addressLine1: '1 test',
                addressLine2: undefined,
                countryCode: 'GB',
                city: 'test',
                state: 'test',
            },
            shippingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                addressLine1: '1 test',
                postalCode: '12345',
                city: 'test',
                state: 'test',
                countryCode: 'GB',
            },
            nationalDocumentId: '9011211234567',
        },
        paymentMethod: {
            options: {
                GOOGLE_PAY: {
                    surcharge: {
                        amount: 50,
                    },
                },
                ADYEN_IDEAL: {
                    surcharge: {
                        amount: 50,
                    },
                },
                ADYEN_SOFORT: {
                    surcharge: {
                        amount: 50,
                    },
                },
                APPLE_PAY: {
                    surcharge: {
                        amount: 150,
                    },
                },
                PAYMENT_CARD: {
                    networks: {
                        VISA: {
                            surcharge: {
                                amount: 100,
                            },
                        },
                        MASTERCARD: {
                            surcharge: {
                                amount: 200,
                            },
                        },
                    },
                },
            },
        },
    };

    const onUniversalCheckoutButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);

        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    return (
        <View style={backgroundStyle}>
            <View style={{flex: 1}}/>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black'}}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black'}}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Vault Manager
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginBottom: 20, marginTop: 5, backgroundColor: 'black'}}
                onPress={onUniversalCheckoutButtonTapped}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Universal Checkout
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CheckoutScreen;