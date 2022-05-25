
import * as React from 'react';
import { 
    PrimerCheckoutData, 
    PrimerCheckoutPaymentMethodData, 
    Primer, 
    PrimerErrorHandler, 
    PrimerPaymentCreationHandler, 
    PrimerSessionIntent, 
    PrimerSettings, 
    PrimerResumeHandler,
    PrimerPaymentMethodTokenData,
    PrimerTokenizationHandler,
    PrimerClientSession,
    PrimerError
} from '@primer-io/react-native';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { styles } from '../styles';
import type { IAppSettings } from '../models/IAppSettings';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IClientSession } from '../models/IClientSession';
import { makeRandomString } from '../helpers/helpers';
import type { IPayment } from '../models/IPayment';

let clientToken: string | null = null;

const CheckoutScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';
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
            // options: {
            //     GOOGLE_PAY: {
            //         surcharge: {
            //             amount: 50,
            //         },
            //     },
            //     ADYEN_IDEAL: {
            //         surcharge: {
            //             amount: 50,
            //         },
            //     },
            //     ADYEN_SOFORT: {
            //         surcharge: {
            //             amount: 50,
            //         },
            //     },
            //     APPLE_PAY: {
            //         surcharge: {
            //             amount: 150,
            //         },
            //     },
            //     PAYMENT_CARD: {
            //         networks: {
            //             VISA: {
            //                 surcharge: {
            //                     amount: 100,
            //                 },
            //             },
            //             MASTERCARD: {
            //                 surcharge: {
            //                     amount: 200,
            //                 },
            //             },
            //         },
            //     },
            // },
        },
    };

    const onBeforeClientSessionUpdate = () => {
        console.log(`onBeforeClientSessionUpdate`);
    }

    const onClientSessionUpdate = (clientSession: PrimerClientSession) => {
        console.log(`onClientSessionUpdate\n${JSON.stringify(clientSession)}`);;
    }

    const onBeforePaymentCreate = (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => {
        console.log(`onBeforePaymentCreate\n${JSON.stringify(checkoutPaymentMethodData)}`);
        handler.continuePaymentCreation();
    }

    const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
        console.log(`PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
    };

    const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => {
        console.log(`onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData)}`);

        try {
            const payment: IPayment = await createPayment(paymentMethodTokenData.token);

            if (payment.requiredAction && payment.requiredAction.clientToken) {
                paymentId = payment.id;

                if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
                    console.warn("Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
                }
                paymentId = payment.id;
                handler.continueWithNewClientToken(payment.requiredAction.clientToken);
            } else {
                props.navigation.navigate('Result', payment);
                handler.handleSuccess();
            }
        } catch (err) {
            console.error(err);
            handler.handleFailure("RN app error");
        }
    }

    const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
        console.log(`onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                props.navigation.navigate('Result', payment);
                handler.handleSuccess();
            } else {
                const err = new Error("Invalid value for paymentId");
                throw err;
            }
            paymentId = null;

        } catch (err) {
            console.error(err);
            paymentId = null;
            handler.handleFailure("RN app error");
        }
    }

    const onCheckoutFail = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler) => {
        console.log(`onCheckoutFail:\n${JSON.stringify(error)}\n\n${JSON.stringify(checkoutData)}`);
        handler.showErrorMessage("My RN message");
    };

    const onDismiss = () => {
        console.log(`onDismiss`);
        clientToken = null;
    };

    const onUniversalCheckoutButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            clientToken = clientSession.clientToken;

            const settings: PrimerSettings = {
                paymentHandling: 'AUTO',
                localeData: {
                    languageCode: 'el',
                    localeCode: 'GR'
                },
                paymentMethodOptions: {
                    iOS: {
                        urlScheme: 'merchant://'
                    },
                    applePayOptions: {
                        merchantIdentifier: "merchant.checkout.team"
                    },
                    cardPaymentOptions: {
                        is3DSOnVaultingEnabled: false
                    },
                    klarnaOptions: {
                        recurringPaymentDescription: "Description"
                    }
                },
                uiOptions: {
                    isInitScreenEnabled: false,
                    isSuccessScreenEnabled: false,
                    isErrorScreenEnabled: false
                },
                debugOptions: {
                    is3DSSanityCheckEnabled: false
                },
                onBeforeClientSessionUpdate: onBeforeClientSessionUpdate,
                onClientSessionUpdate: onClientSessionUpdate,
                onBeforePaymentCreate: onBeforePaymentCreate,
                onCheckoutComplete: onCheckoutComplete,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onCheckoutFail: onCheckoutFail,
                onDismiss: onDismiss,
            };

            await Primer.configure(settings);
            await Primer.showUniversalCheckout(clientToken);

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

    const onApplePayButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            clientToken = clientSession.clientToken;

            const settings: PrimerSettings = {
                paymentMethodOptions: {
                    iOS: {
                        urlScheme: 'merchant://'
                    }
                }
            };
            await Primer.configure(settings);
            await Primer.showPaymentMethod('APPLE_PAY', PrimerSessionIntent.CHECKOUT, clientToken);

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
                onPress={onApplePayButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
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
