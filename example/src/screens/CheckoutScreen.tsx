
import * as React from 'react';
import { Primer } from '@primer-io/react-native';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { styles } from '../styles';
import type { IAppSettings } from '../models/IAppSettings';
import type { PrimerResumeHandler } from 'lib/typescript/models/primer-request';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { OnTokenizeSuccessCallback } from 'lib/typescript/models/primer-callbacks';
import type { PaymentInstrumentToken } from 'lib/typescript/models/payment-instrument-token';
import type { IClientSession } from '../models/IClientSession';
import { makeRandomString } from '../helpers/helpers';
import type { IPayment } from '../models/IPayment';

const CheckoutScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';
    // const [paymentId, setPaymentId] = React.useState<string | null>(null);
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const appSettings: IAppSettings = props.route.params;
    let paymentId: string | null = null;

    const clientSessionRequestBody: IClientSessionRequestBody = {
        customerId: appSettings.customerId,
        orderId: 'rn-test-' + makeRandomString(8),
        currencyCode: appSettings.currencyCode,
        order: {
            countryCode: appSettings.countryCode,
            lineItems: [
                {
                    amount: appSettings.amount,
                    quantity: 1,
                    itemId: 'item-123',
                    description: 'this item',
                    discountAmount: 0,
                },
            ],
        },
        customer: {
            emailAddress: 'test@mail.com',
            mobileNumber: appSettings.phoneNumber,
            firstName: 'John',
            lastName: 'Doe',
            billingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                postalCode: '12345',
                addressLine1: '1 test',
                addressLine2: undefined,
                countryCode: appSettings.countryCode,
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
                countryCode: appSettings.countryCode,
            },
            nationalDocumentId: '9011211234567',
        },
        paymentMethod: {
            vaultOnSuccess: false,
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

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (paymentInstrument: PaymentInstrumentToken, resumeHandler: PrimerResumeHandler) => {
        try {
            const payment = await createPayment(paymentInstrument.token);
            
            if (payment.requiredAction?.clientToken) {
                paymentId = payment.id;
                resumeHandler.handleNewClientToken(payment.requiredAction.clientToken);
            } else {
                resumeHandler.handleSuccess();
            }
        } catch (err) {
            if (err instanceof Error) {
                resumeHandler.handleError(err.message);
            } else if (typeof err === "string") {
                resumeHandler.handleError(err);
            } else {
                resumeHandler.handleError('Unknown error');
            }
        }
    };

    const onResumeSuccess = async (resumeToken: string, resumeHandler: PrimerResumeHandler | null) => {
        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                debugger;
                paymentId = null;
                if (resumeHandler) {
                    resumeHandler.handleSuccess();
                }
            } else {
                const err = new Error("Invalid value for paymentId");
                throw err;
            }
        } catch (err) {
            paymentId = null;
            if (resumeHandler) {
                if (err instanceof Error) {
                    resumeHandler.handleError(err.message);
                } else if (typeof err === "string") {
                    resumeHandler.handleError(err);
                } else {
                    resumeHandler.handleError('Unknown error');
                }
            }
        }
    };

    const onUniversalCheckoutButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            const primerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    }
                },
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess
            };

            //@ts-ignore
            Primer.showUniversalCheckout(clientSession.clientToken, primerConfig);

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
            <View style={{ flex: 1 }} />
            {/* <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Vault Manager
                </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginBottom: 20, marginTop: 5, backgroundColor: 'black' }}
                onPress={onUniversalCheckoutButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Universal Checkout
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CheckoutScreen;