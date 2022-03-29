
import * as React from 'react';
import { Primer } from '@primer-io/react-native';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createClientSession, createPayment } from '../network/api';
import { styles } from '../styles';
import type { IAppSettings } from '../models/IAppSettings';
import type { PrimerResumeHandler } from 'lib/typescript/models/primer-request';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { OnTokenizeSuccessCallback } from 'lib/typescript/models/primer-callbacks';
import type { PaymentInstrumentToken } from 'lib/typescript/models/payment-instrument-token';
import type { IClientSession } from '../models/IClientSession';
import { resumePayment } from 'MerchantExample/src/network/api';

const CheckoutScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [paymentId, setPaymentId] = React.useState<string | null>(null);
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const appSettings: IAppSettings = props.route.params;

    const clientSessionRequestBody: IClientSessionRequestBody = {
        // customerId: "rn_customer_id",
        orderId: 'rn-test-10001',
        // currencyCode: 'EUR',
        order: {
            // countryCode: 'NL',
            lineItems: [
                {
                    amount: 0,
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
                // countryCode: 'GB',
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
                // countryCode: 'GB',
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
    clientSessionRequestBody.currencyCode = appSettings.currencyCode;
    //@ts-ignore
    clientSessionRequestBody.order.lineItems[0].amount = appSettings.amount;
    //@ts-ignore
    clientSessionRequestBody.order.countryCode = appSettings.countryCode;
    //@ts-ignore
    clientSessionRequestBody.order.countryCode = appSettings.countryCode;
    clientSessionRequestBody.customerId = appSettings.customerId;
    //@ts-ignore
    clientSessionRequestBody.customer.billingAddress.countryCode = appSettings.countryCode;
    //@ts-ignore
    clientSessionRequestBody.customer.shippingAddress.countryCode = appSettings.countryCode;

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (paymentInstrument: PaymentInstrumentToken, resumeHandler: PrimerResumeHandler) => {
        try {
            const payment = await createPayment(paymentInstrument.token);
            
            if (payment.requiredAction?.clientToken) {
                setPaymentId(payment.id);
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
            //@ts-ignore
            const payment = await resumePayment(paymentId, resumeToken);
            if (resumeHandler) {
                resumeHandler.handleSuccess();
            }
        } catch (err) {
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
            <TouchableOpacity
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
            </TouchableOpacity>
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